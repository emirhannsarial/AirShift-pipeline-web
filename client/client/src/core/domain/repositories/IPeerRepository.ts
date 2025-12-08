export interface IPeerRepository {
    initialize(isInitiator: boolean): void;
    signal(data: unknown): void;
    onConnect(callback: () => void): void;
    sendData(data: ArrayBuffer | string): void;
    onData(callback: (data: ArrayBuffer | string) => void): void;
    onSignal(callback: (data: unknown) => void): void;
    getBufferedAmount(): number;
    
    // YENİ EKLENEN METODLAR:
    onError(callback: (error: Error) => void): void;
    onClose(callback: () => void): void;
}