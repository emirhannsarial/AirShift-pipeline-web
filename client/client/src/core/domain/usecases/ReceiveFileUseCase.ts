// DÜZELTME: 'import type' ekledik
import type { FileMetadata } from "../entities/FileMetadata";
import streamSaver from 'streamsaver';

export class ReceiveFileUseCase {
    private fileWriter: WritableStreamDefaultWriter | null = null;
    private receivedBytes: number = 0;
    private metadata: FileMetadata | null = null;

    // 1. Metadata Geldiğinde: İndirme işlemini başlat (Dosya oluştur)
    initializeTransfer(metadata: FileMetadata) {
        this.metadata = metadata;
        this.receivedBytes = 0;

        console.log(`İndirme başlatılıyor: ${metadata.name}`);

        // StreamSaver ile sanal bir dosya akışı oluştur
        const fileStream = streamSaver.createWriteStream(metadata.name, {
            size: metadata.size
        });

        this.fileWriter = fileStream.getWriter();
    }

    // 2. Parça Geldiğinde: Dosyanın içine yaz
    async processChunk(chunk: ArrayBuffer, onProgress: (percent: number) => void) {
        if (!this.fileWriter || !this.metadata) {
            console.error("Dosya akışı başlatılmamış!");
            return;
        }

        // Binary veriyi diske yaz (RAM'de tutmaz)
        await this.fileWriter.write(new Uint8Array(chunk));

        this.receivedBytes += chunk.byteLength;

        // Yüzdeyi hesapla
        const progress = Math.round((this.receivedBytes / this.metadata.size) * 100);
        onProgress(progress);

        // 3. Dosya Bitti mi?
        if (this.receivedBytes === this.metadata.size) {
            console.log("Dosya tamamen indi, kapatılıyor...");
            await this.fileWriter.close(); // await eklemek iyidir
            this.fileWriter = null;
            this.metadata = null;
        }
    }
}