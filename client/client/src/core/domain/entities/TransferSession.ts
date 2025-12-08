// client/src/core/domain/entities/TransferSession.ts

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'failed' | 'completed';

export interface TransferSession {
    roomId: string;
    peers: string[]; // Odadaki kişilerin ID'leri
    status: ConnectionStatus;
    error?: string;
}