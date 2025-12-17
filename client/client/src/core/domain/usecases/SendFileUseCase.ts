
import type { IPeerRepository } from "../repositories/IPeerRepository";

const CHUNK_SIZE = 64 * 1024; // 64 KB (WebRTC için ideal boyut)

export class SendFileUseCase {
    private peerRepo: IPeerRepository;

    constructor(peerRepo: IPeerRepository) {
        this.peerRepo = peerRepo;
    }

    async execute(file: File, onProgress: (progress: number) => void) {
        // DÜZELTME: Buradaki Metadata gönderme kodunu SİLDİK.
        // Çünkü Metadata zaten Store tarafında (Handshake sırasında) gönderildi.
        // Tekrar gönderirsek alıcı "Yeni dosya geldi" sanıp indirmeyi iptal ediyor.

        console.log("UseCase: Dosya akışı başlatılıyor...");

        let offset = 0;
        const MAX_BUFFER_SIZE = 64 * 1024; 

        while (offset < file.size) {
            // Backpressure (Hız Kontrolü)
            while (this.peerRepo.getBufferedAmount() > MAX_BUFFER_SIZE) {
                await new Promise(r => setTimeout(r, 10));
            }

            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            const arrayBuffer = await chunk.arrayBuffer();

            // Sadece Binary veriyi gönder
            this.peerRepo.sendData(arrayBuffer);

            offset += CHUNK_SIZE;

            const progress = Math.round((offset / file.size) * 100);
            onProgress(progress > 100 ? 100 : progress);
        }

        console.log("UseCase: Dosya gönderimi bitti!");
    }
}