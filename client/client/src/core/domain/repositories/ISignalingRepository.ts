export interface ISignalingRepository {
    // Bir odaya katıl
    joinRoom(roomId: string): Promise<void>;
    
    // Odaya başkası gelince beni haberdar et (Callback)
    onUserConnected(callback: (userId: string) => void): void;
    
    // Sinyal gönder (unknown kullanarak tip güvenliğini sağlıyoruz)
    sendSignal(targetId: string, signal: unknown): void;
    
    // Sinyal gelince beni haberdar et
    onSignalReceived(callback: (senderId: string, signal: unknown) => void): void;
    
    // Temizlik
    disconnect(): void;
}