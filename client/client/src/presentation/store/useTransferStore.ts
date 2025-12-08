import { create } from 'zustand';
import { SocketSignalingRepository } from '../../data/repositories/SocketSignalingRepository';
import { WebRTCPeerRepository } from '../../data/repositories/WebRTCPeerRepository';
import { SendFileUseCase } from '../../core/domain/usecases/SendFileUseCase';
import { ReceiveFileUseCase } from '../../core/domain/usecases/ReceiveFileUseCase';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
// 1. Dependency Initialization
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SERVER_URL);
const signalingRepo = new SocketSignalingRepository(socket);
const peerRepo = new WebRTCPeerRepository();
const sendFileUseCase = new SendFileUseCase(peerRepo);
const receiveFileUseCase = new ReceiveFileUseCase();

// 2. State Interface
interface TransferState {
    roomId: string;
    connectionStatus: string;
    logs: string[];
    remotePeerId: string | null;
    progress: number;
    selectedFile: File | null;
    
    // Actions
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    addLog: (msg: string) => void;
    sendFile: (file: File) => void;
    selectFile: (file: File) => void;
}

type GetState = () => TransferState;
type SetState = (partial: Partial<TransferState>) => void;

// 3. Store Implementation
export const useTransferStore = create<TransferState>((set, get) => ({
    roomId: '',
    connectionStatus: 'Idle',
    logs: [],
    remotePeerId: null,
    progress: 0,
    selectedFile: null,

    addLog: (msg) => set((state) => ({ logs: [...state.logs, msg] })),

    selectFile: (file: File) => {
        set({ selectedFile: file });
        get().addLog(`File selected: ${file.name}`);
    },

    sendFile: async (file: File) => {
        get().addLog(`Sending file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        try {
            await sendFileUseCase.execute(file, (progress) => {
                set({ progress });
            });
            get().addLog("✅ File sent successfully!");
        } catch (error) {
            get().addLog(`❌ Error: ${error}`);
        }
    },

    createRoom: async () => {
        const roomId = uuidv4().slice(0, 8); 
        set({ roomId, connectionStatus: 'Link Created. Waiting for peer...' });
        get().addLog(`Room ID: ${roomId}`);

        await signalingRepo.joinRoom(roomId);
        
        signalingRepo.onUserConnected((userId) => {
            get().addLog(`Peer connected: ${userId}`);
            set({ remotePeerId: userId });
            
            get().addLog("Starting as Initiator...");
            peerRepo.initialize(true);
            bindPeerEvents(userId, get, set);
        });

        // DÜZELTME: senderId kullanılmadığı için _ kullanıldı (TS Fix)
        signalingRepo.onSignalReceived((_, signal) => {
            peerRepo.signal(signal);
        });
    },

    joinRoom: async (roomId) => {
        set({ roomId, connectionStatus: 'Connecting...' });
        await signalingRepo.joinRoom(roomId);
        
        get().addLog("Starting as Participant...");
        peerRepo.initialize(false);
        bindPeerEvents("WAITING_FOR_SENDER", get, set);

        signalingRepo.onSignalReceived((senderId, signal) => {
            set({ remotePeerId: senderId });
            peerRepo.signal(signal);
        });
    }
}));

// 4. Helper Function for Event Binding
function bindPeerEvents(targetId: string, get: GetState, set: SetState) {
    peerRepo.onSignal((signal) => {
        const currentTarget = get().remotePeerId || targetId;
        if (currentTarget === "WAITING_FOR_SENDER") return; 
        
        get().addLog(`Signal generated -> Sending`);
        signalingRepo.sendSignal(currentTarget, signal);
    });

    peerRepo.onConnect(() => {
        get().addLog("✅ CONNECTED (P2P)");
        set({ connectionStatus: 'CONNECTED (P2P)' });

        // Auto-Send Logic
        const file = get().selectedFile;
        if (file) {
            get().addLog("Auto-sending started...");
            get().sendFile(file);
        }
    });
    
    peerRepo.onData((data: string | ArrayBuffer | Uint8Array) => {
        const arrayBuffer = data instanceof Uint8Array ? data.buffer : data;
        let isMetadata = false;

        try {
            const textDecoder = new TextDecoder();
            const textData = typeof data === 'string' ? data : textDecoder.decode(arrayBuffer as ArrayBuffer);

            if (textData.includes('METADATA') && textData.includes('payload')) {
                const parsed = JSON.parse(textData);
                if (parsed.type === 'METADATA') {
                    isMetadata = true;
                    get().addLog(`📁 INCOMING FILE: ${parsed.payload.name}`);
                    get().addLog(`💾 Downloading started automatically...`);
                    receiveFileUseCase.initializeTransfer(parsed.payload);
                }
            }
        } catch { 
            // Not a JSON/Text message, probably binary chunk. Continue.
        }

        if (!isMetadata && arrayBuffer instanceof ArrayBuffer) {
             receiveFileUseCase.processChunk(arrayBuffer, (progress) => {
                 set({ progress }); 
                 if (progress === 100) {
                     get().addLog("✅ FILE DOWNLOAD COMPLETED!");
                 }
            });
        }
    });

    // YENİ: Temiz Hata Yönetimi
    peerRepo.onError((err) => {
        console.error("WebRTC Error:", err);
        set({ 
            connectionStatus: 'ERROR: Connection Failed', 
            logs: [...get().logs, `❌ Error: ${err.message}`] 
        });
    });

    // YENİ: Temiz Kapanma Yönetimi
    peerRepo.onClose(() => {
        set({ 
            connectionStatus: 'DISCONNECTED', 
            logs: [...get().logs, '❌ Connection closed'] 
        });
    });
}
