// client/src/core/domain/entities/FileMetadata.ts

export interface FileMetadata {
    id: string;       // Her dosya için benzersiz ID (uuid)
    name: string;     // Dosya adı (video.mp4)
    size: number;     // Byte cinsinden boyut
    type: string;     // Mime type (video/mp4)
}