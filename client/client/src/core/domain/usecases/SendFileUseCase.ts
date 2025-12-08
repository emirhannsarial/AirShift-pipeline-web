import type { FileMetadata } from "../entities/FileMetadata";
import type { IPeerRepository } from "../repositories/IPeerRepository";

const CHUNK_SIZE = 64 * 1024; // 64 KB (WebRTC için ideal boyut)

export class SendFileUseCase {
    private peerRepo: IPeerRepository;

    constructor(peerRepo: IPeerRepository) {
        this.peerRepo = peerRepo;
    }

    async execute(file: File, onProgress: (progress: number) => void) {
        // 1. Önce Metadata (Kimlik) Gönder
        const metadata: FileMetadata = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type
        };
        console.log("UseCase: Metadata gönderiliyor...", metadata);
        this.peerRepo.sendData(JSON.stringify({ type: 'METADATA', payload: metadata }));

        let offset = 0;
        const MAX_BUFFER_SIZE = 64 * 1024; // 64 KB (Tampon limiti)

        while (offset < file.size) {
            // --- YENİ EKLENEN AKIŞ KONTROLÜ (BACKPRESSURE) ---
            // Eğer tarayıcının tamponu doluysa, boşalana kadar bekle.
            // Bu sayede "Queue is full" hatası almayız.
            while (this.peerRepo.getBufferedAmount() > MAX_BUFFER_SIZE) {
                // 10ms bekle ve tekrar kontrol et
                await new Promise(r => setTimeout(r, 10));
            }
            // ------------------------------------------------

            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            const arrayBuffer = await chunk.arrayBuffer();

            this.peerRepo.sendData(arrayBuffer);

            offset += CHUNK_SIZE;

            const progress = Math.round((offset / file.size) * 100);
            onProgress(progress > 100 ? 100 : progress);
            
            // Buradaki sabit gecikmeyi kaldırabiliriz artık, yukarıdaki kontrol yeterli.
            // Ama CPU'yu rahatlatmak için minik bir nefes payı bırakabiliriz.
            // await new Promise(r => setTimeout(r, 1)); 
        }

        console.log("UseCase: Dosya gönderimi bitti!");
    }
}
