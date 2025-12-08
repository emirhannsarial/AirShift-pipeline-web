import { create } from 'zustand';
import { SocketSignalingRepository } from '../../data/repositories/SocketSignalingRepository';
import { WebRTCPeerRepository } from '../../data/repositories/WebRTCPeerRepository';
import { SendFileUseCase } from '../../core/domain/usecases/SendFileUseCase';
import { ReceiveFileUseCase } from '../../core/domain/usecases/ReceiveFileUseCase';
import type { FileMetadata } from '../../core/domain/entities/FileMetadata';
import { io } from 'socket.io-client';

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
    // YENİ: 'REJECTED' durumunu ekledik
    transferState: 'IDLE' | 'WAITING_ACCEPT' | 'TRANSFERRING' | 'COMPLETED' | 'ERROR' | 'REJECTED';
    senderLeft: boolean;
    
    // Actions
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    addLog: (msg: string) => void;
    selectFile: (file: File) => void;
    
    acceptDownload: () => void; 
    rejectDownload: () => void;
    resetTransfer: () => void; // YENİ: Durumu sıfırlama butonu için
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

    // YENİ: İşlem bittikten veya reddedildikten sonra başa dönmek için
    resetTransfer: () => {
        set({ 
            transferState: 'IDLE', 
            progress: 0, 
            incomingMetadata: null,
            // Dosyayı silmiyoruz ki gönderici tekrar aynı dosyayı yollayabilsin
        });
    },

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
            await receiveFileUseCase.startDownload(meta); // Artık bu fonksiyon var!
            set({ transferState: 'TRANSFERRING' });
            peerRepo.sendData(JSON.stringify({ type: 'STATUS', status: 'DOWNLOAD_STARTED' }));
        } catch (error) { 
            get().addLog(`Download cancelled: ${error}`);
        }
    },

    rejectDownload: () => {
        set({ incomingMetadata: null, transferState: 'IDLE' }); // Alıcı başa döner
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
        set({ roomId, connectionStatus: 'Connecting...' });
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

function sendMetadata(file: File) {
    const metadata = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type
    };
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
        set({ connectionStatus: 'CONNECTED (P2P)', senderLeft: false });
        if (!get().selectedFile) {
            peerRepo.sendData(JSON.stringify({ type: 'HELLO' }));
        }
    });
    
    peerRepo.onData((data: string | ArrayBuffer | Uint8Array) => {
        const bufferData = (typeof data === 'string') 
            ? new TextEncoder().encode(data) 
            : (data instanceof Uint8Array ? data : new Uint8Array(data));

        let isCommand = false;

        try {
            const textDecoder = new TextDecoder();
            const textString = textDecoder.decode(bufferData);

            if (textString.trim().startsWith('{') && textString.trim().endsWith('}')) {
                const msg = JSON.parse(textString);

                if (msg.type === 'HELLO') {
                    isCommand = true;
                    get().addLog("Receiver is ready.");
                    const file = get().selectedFile;
                    if (file) sendMetadata(file);
                }

                else if (msg.type === 'METADATA') {
                    isCommand = true;
                    set({ incomingMetadata: msg.payload }); 
                    get().addLog(`📄 Offer: ${msg.payload.name}`);
                }
                
                else if (msg.type === 'STATUS') {
                    isCommand = true;
                    if (msg.status === 'DOWNLOAD_STARTED') {
                        const file = get().selectedFile;
                        if (file) startSendingData(file, get, set);
                    }
                    // YENİ: Reddedilme Durumu
                    else if (msg.status === 'DOWNLOAD_REJECTED') {
                        get().addLog("Receiver rejected the file.");
                        set({ transferState: 'REJECTED' }); // Göndericide durum güncellendi
                    }
                }
            }
        } catch (error) {
            get().addLog(`⚠️ Control message parse error: ${(error as Error).message}`);
        }

        if (!isCommand) {
            if (get().transferState !== 'TRANSFERRING') return;

            receiveFileUseCase.processChunk(bufferData.buffer as ArrayBuffer, (progress) => {
                 set({ progress });
                 if (progress === 100) {
                     set({ transferState: 'COMPLETED', incomingMetadata: null });
                     get().addLog("🎉 Completed!");
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




