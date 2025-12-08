import SimplePeer, { type Instance } from 'simple-peer';
import type { IPeerRepository } from '../../core/domain/repositories/IPeerRepository';

// Simple-peer kütüphanesinin gizli özelliklerine erişmek için tip tanımı
interface PeerWithInternal extends Instance {
    _channel?: RTCDataChannel;
}

export class WebRTCPeerRepository implements IPeerRepository {
    private peer: Instance | null = null;

    private onConnectCallback: (() => void) | null = null;
    private onDataCallback: ((data: ArrayBuffer | string) => void) | null = null;
    private onSignalCallback: ((data: unknown) => void) | null = null;
    // YENİ CALLBACKLER
    private onErrorCallback: ((error: Error) => void) | null = null;
    private onCloseCallback: (() => void) | null = null;

    initialize(isInitiator: boolean): void {
        console.log(`WebRTC Başlatılıyor. Initiator mı? ${isInitiator}`);

        this.peer = new SimplePeer({
            initiator: isInitiator,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        this.bindEvents();
    }

    private bindEvents(): void {
        if (!this.peer) return;

        this.peer.on('signal', (data) => {
            console.log('Sinyal üretildi (SDP)');
            if (this.onSignalCallback) this.onSignalCallback(data);
        });

        this.peer.on('connect', () => {
            console.log('✅ P2P Tünel Açıldı!');
            if (this.onConnectCallback) this.onConnectCallback();
        });

        this.peer.on('data', (data) => {
            if (this.onDataCallback) this.onDataCallback(data);
        });

        // HATA YÖNETİMİ GÜNCELLENDİ
        this.peer.on('error', (err) => {
            console.error('WebRTC Hatası:', err);
            if (this.onErrorCallback) this.onErrorCallback(err);
        });

        // KAPANMA YÖNETİMİ EKLENDİ
        this.peer.on('close', () => {
            console.log('WebRTC Bağlantısı Kapandı');
            if (this.onCloseCallback) this.onCloseCallback();
        });
    }

    signal(data: unknown): void {
        if (this.peer) {
            this.peer.signal(data as string | SimplePeer.SignalData);
        }
    }

    sendData(data: ArrayBuffer | string): void {
        if (this.peer) {
            this.peer.send(data);
        }
    }

    getBufferedAmount(): number {
        if (!this.peer) return 0;
        const internalPeer = this.peer as PeerWithInternal;
        const channel = internalPeer._channel;
        
        if (channel && channel.bufferedAmount !== undefined) {
            return channel.bufferedAmount;
        }
        return 0;
    }

    // Interface İmplementasyonları
    onConnect(callback: () => void): void {
        this.onConnectCallback = callback;
    }

    onData(callback: (data: ArrayBuffer | string) => void): void {
        this.onDataCallback = callback;
    }

    onSignal(callback: (data: unknown) => void): void {
        this.onSignalCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.onErrorCallback = callback;
    }

    onClose(callback: () => void): void {
        this.onCloseCallback = callback;
    }
}