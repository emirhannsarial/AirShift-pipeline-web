import { Socket } from 'socket.io-client';
// DÜZELTME: 'import type' kullanarak sadece tip olduğunu belirtiyoruz
import type { ISignalingRepository } from '../../core/domain/repositories/ISignalingRepository';

export class SocketSignalingRepository implements ISignalingRepository {
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    joinRoom(roomId: string): Promise<void> {
        return new Promise((resolve) => {
            const emitJoin = () => {
                console.log(`Socket Bağlı. Odaya Giriliyor. ID: ${this.socket.id}`);
                this.socket.emit('join-room', roomId, this.socket.id);
                resolve();
            };

            // Eğer zaten bağlıysa direkt gir
            if (this.socket.connected) {
                emitJoin();
            } 
            // Değilse, bağlanmayı bekle sonra gir
            else {
                console.log("Socket henüz bağlanmadı, bekleniyor...");
                this.socket.once('connect', () => {
                    emitJoin();
                });
            }
        });
    }

    onUserConnected(callback: (userId: string) => void): void {
        // Önceki dinleyicileri temizle ki dublike olmasın
        this.socket.off('user-connected'); 
        
        this.socket.on('user-connected', (userId: string) => {
            console.log("Data Layer: Yeni kullanıcı tespit edildi:", userId);
            callback(userId);
        });
    }

    // DÜZELTME: any -> unknown
    sendSignal(targetId: string, signal: unknown): void {
        this.socket.emit('send-signal', { targetId, signal });
    }

    onSignalReceived(callback: (senderId: string, signal: unknown) => void): void {
        this.socket.off('receive-signal');

        this.socket.on('receive-signal', (data: { senderId: string, signal: unknown }) => {
            callback(data.senderId, data.signal);
        });
    }
    
    disconnect(): void {
        this.socket.disconnect();
    }


    onPeerDisconnected(callback: () => void): void {
        this.socket.on('peer-disconnected', () => {
            console.log("Karşı taraf bağlantıyı kopardı.");
            callback();
        });
    }
}