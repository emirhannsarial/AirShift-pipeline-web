import type { FileMetadata } from "../entities/FileMetadata";
import streamSaver from 'streamsaver';

export class ReceiveFileUseCase {
    private fileWriter: WritableStreamDefaultWriter | null = null;
    private receivedBytes: number = 0;
    private metadata: FileMetadata | null = null;

    // YENİ FONKSİYON İSMİ: startDownload (Eskiden initializeTransfer idi)
    async startDownload(metadata: FileMetadata): Promise<void> {
        this.metadata = metadata;
        this.receivedBytes = 0;

        console.log(`İndirme izni istendi: ${metadata.name}`);

        // StreamSaver ile sanal bir dosya akışı oluştur
        const fileStream = streamSaver.createWriteStream(metadata.name, {
            size: metadata.size
        });

        this.fileWriter = fileStream.getWriter();
        
        // Writer hazır olana kadar bekle
        await this.fileWriter.ready;
    }

    async processChunk(chunk: ArrayBuffer, onProgress: (percent: number) => void) {
        if (!this.fileWriter || !this.metadata) {
            return;
        }

        try {
            await this.fileWriter.write(new Uint8Array(chunk));
            this.receivedBytes += chunk.byteLength;
            
            const progress = Math.round((this.receivedBytes / this.metadata.size) * 100);
            onProgress(progress);

            if (this.receivedBytes === this.metadata.size) {
                console.log("İndirme bitti.");
                await this.fileWriter.close();
                this.fileWriter = null;
                this.metadata = null;
            }
        } catch (error) {
            console.error("Yazma hatası:", error);
            // Hata durumunda writer'ı temizle
            this.fileWriter = null;
            throw error;
        }
    }
}