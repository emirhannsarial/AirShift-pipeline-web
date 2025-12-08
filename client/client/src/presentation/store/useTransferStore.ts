import { create } from 'zustand';
import { SocketSignalingRepository } from '../../data/repositories/SocketSignalingRepository';
import { WebRTCPeerRepository } from '../../data/repositories/WebRTCPeerRepository';
import { SendFileUseCase } from '../../core/domain/usecases/SendFileUseCase';
import { ReceiveFileUseCase } from '../../core/domain/usecases/ReceiveFileUseCase';
import type { FileMetadata } from '../../core/domain/entities/FileMetadata';
import { io } from 'socket.io-client';

// Environment variable yoksa localhost'a düş
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL);
const signalingRepo = new SocketSignalingRepository(socket);
const peerRepo = new WebRTCPeerRepository();
const sendFileUseCase = new SendFileUseCase(peerRepo);
const receiveFileUseCase = new ReceiveFileUseCase();

interface TransferState {
    roomId: string;
    connectionStatus: string;
    logs: string[];
    remotePeerId: string | null;
    progress: number;
    selectedFile: File | null;
    incomingMetadata: FileMetadata | null;
    transferState: 'IDLE' | 'WAITING_ACCEPT' | 'TRANSFERRING' | 'COMPLETED' | 'ERROR';
    senderLeft: boolean;
    
    // Actions
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    addLog: (msg: string) => void;
    selectFile: (file: File) => void;
    
    acceptDownload: () => void; 
    rejectDownload: () => void;
    reset: () => void;
}

type GetState = () => TransferState;
type SetState = (partial: Partial<TransferState>) => void;

export const useTransferStore = create<TransferState>((set, get) => ({
    roomId: '',
    connectionStatus: 'Idle',
    logs: [],
    remotePeerId: null,
    progress: 0,
    selectedFile: null,
    incomingMetadata: null,
    transferState: 'IDLE',
    senderLeft: false,

    addLog: (msg) => set((state) => ({ logs: [...state.logs, msg] })),

    reset: () => set({ progress: 0, transferState: 'IDLE', incomingMetadata: null, selectedFile: null }),

    selectFile: (file: File) => {
        set({ selectedFile: file, transferState: 'IDLE', progress: 0 });
        if (get().connectionStatus.includes('CONNECTED')) {
             sendMetadata(file);
        }
    },

    acceptDownload: async () => {
        const meta = get().incomingMetadata;
        if (!meta) return;

        try {
            await receiveFileUseCase.startDownload(meta); 
            set({ transferState: 'TRANSFERRING' });
            peerRepo.sendData(JSON.stringify({ type: 'STATUS', status: 'DOWNLOAD_STARTED' }));
        } catch (error) { 
            get().addLog(`Download cancelled: ${error}`);
        }
    },

    rejectDownload: () => {
        set({ incomingMetadata: null, transferState: 'IDLE' });
        peerRepo.sendData(JSON.stringify({ type: 'STATUS', status: 'DOWNLOAD_REJECTED' }));
    },

    createRoom: async () => {
        const roomId = import.meta.env.MODE === 'development' ? 'test' : crypto.randomUUID().slice(0, 8);
        set({ roomId, connectionStatus: 'Link Created. Waiting...' });

        await signalingRepo.joinRoom(roomId);
        
        signalingRepo.onUserConnected((userId) => {
            get().addLog(`Peer connected: ${userId}`);
            set({ remotePeerId: userId });
            peerRepo.initialize(true);
            bindPeerEvents(userId, get, set);
        });

        signalingRepo.onSignalReceived((_, signal) => peerRepo.signal(signal));
        
        signalingRepo.onPeerDisconnected(() => {
            set({ senderLeft: true, connectionStatus: 'DISCONNECTED' });
        });
    },

    joinRoom: async (roomId) => {
        // Emin olmak için selectedFile'ı null yapalım
        set({ roomId, connectionStatus: 'Connecting...', selectedFile: null }); 
        await signalingRepo.joinRoom(roomId);
        
        peerRepo.initialize(false);
        bindPeerEvents("WAITING_FOR_SENDER", get, set);

        signalingRepo.onSignalReceived((senderId, signal) => {
            set({ remotePeerId: senderId });
            peerRepo.signal(signal);
        });

        signalingRepo.onPeerDisconnected(() => {
            set({ senderLeft: true, connectionStatus: 'DISCONNECTED' });
        });
    }
}));

// Helper Fonksiyon
function sendMetadata(file: File) {
    const metadata = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type
    };
    
    // YENİ: Log ekleyelim ki gönderdiğini görelim
    useTransferStore.getState().addLog(`Metadata sending for: ${file.name}`);
    
    useTransferStore.setState({ transferState: 'WAITING_ACCEPT' }); 
    peerRepo.sendData(JSON.stringify({ type: 'METADATA', payload: metadata }));
}

async function startSendingData(file: File, get: GetState, set: SetState) {
    set({ transferState: 'TRANSFERRING' });
    try {
        await sendFileUseCase.execute(file, (progress) => {
            set({ progress });
        });
        set({ transferState: 'COMPLETED' });
        get().addLog("✅ File sent successfully!");
    } catch (error) {
        get().addLog(`❌ Error: ${error}`);
        set({ transferState: 'ERROR' });
    }
}

function bindPeerEvents(targetId: string, get: GetState, set: SetState) {
    peerRepo.onSignal((signal) => {
        const currentTarget = get().remotePeerId || targetId;
        if (currentTarget === "WAITING_FOR_SENDER") return; 
        signalingRepo.sendSignal(currentTarget, signal);
    });

    peerRepo.onConnect(() => {
        get().addLog("✅ CONNECTED (P2P)");
        set({ connectionStatus: 'CONNECTED (P2P)', senderLeft: false });

        // YENİ STRATEJİ:
        // Eğer biz ALICIYSAK (Dosya seçili değilse), karşıya "Ben Hazırım" mesajı atalım.
        if (!get().selectedFile) {
            console.log("Alıcıyım, 'HELLO' gönderiyorum...");
            peerRepo.sendData(JSON.stringify({ type: 'HELLO' }));
        }
    });
    
    peerRepo.onData((data: string | ArrayBuffer | Uint8Array) => {
        const arrayBuffer = data instanceof Uint8Array ? data.buffer : data;
        let isMetadata = false;

        if (typeof data === 'string') {
            try {
                const msg = JSON.parse(data);
                
                // 1. HELLO MESAJI GELDİ Mİ? (Gönderici bunu bekler)
                if (msg.type === 'HELLO') {
                    get().addLog("Receiver is ready (HELLO received).");
                    const file = get().selectedFile;
                    if (file) {
                        get().addLog("Sending metadata now...");
                        sendMetadata(file); // Dosya bilgisini şimdi yolla!
                    }
                }

                else if (msg.type === 'METADATA') {
                    isMetadata = true;
                    set({ incomingMetadata: msg.payload }); 
                    get().addLog(`📄 File offer received: ${msg.payload.name}`);
                }
                
                else if (msg.type === 'STATUS') {
                    if (msg.status === 'DOWNLOAD_STARTED') {
                        get().addLog("Receiver accepted. Sending started...");
                        const file = get().selectedFile;
                        if (file) startSendingData(file, get, set);
                    }
                    else if (msg.status === 'DOWNLOAD_REJECTED') {
                        get().addLog("Receiver rejected the file.");
                        set({ transferState: 'IDLE' });
                    }
                }
            } catch (e) {
                console.error("JSON Parse Hatası:", e);
            }
        }
        
        // Binary veri kontrolü...
        else if (!isMetadata && arrayBuffer instanceof ArrayBuffer) {
            if (get().transferState !== 'TRANSFERRING') return;

            receiveFileUseCase.processChunk(arrayBuffer as ArrayBuffer, (progress) => {
                 set({ progress });
                 if (progress === 100) {
                     set({ transferState: 'COMPLETED', incomingMetadata: null });
                     get().addLog("🎉 Transfer completed successfully!");
                 }
            });
        }
    });

    peerRepo.onError((err) => {
        set({ connectionStatus: 'ERROR', logs: [...get().logs, `Err: ${err.message}`] });
    });
    peerRepo.onClose(() => {
        set({ connectionStatus: 'DISCONNECTED', senderLeft: true });
    });
}