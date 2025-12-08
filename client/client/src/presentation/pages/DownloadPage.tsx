import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTransferStore } from '../store/useTransferStore';

export const DownloadPage = () => {
  const { roomId } = useParams();
  const { joinRoom, connectionStatus, logs } = useTransferStore();
  const hasJoined = useRef(false);
  
  // Log metinleri de değişeceği için basit kontrol yapıyoruz
  // Not: Loglar store'dan Türkçe gelebilir, bu yüzden includes kontrolünü geniş tutuyoruz veya
  // Store'daki logları da İngilizce yapmamız gerekir. (Adım 5'te yapacağız)
  const isDownloading = logs.some(l => l.includes('Downloading') || l.includes('İndirme'));
  const isFinished = logs.some(l => l.includes('COMPLETED') || l.includes('KAYDEDİLDİ'));

  useEffect(() => {
    if (roomId && !hasJoined.current) {
      hasJoined.current = true;
      joinRoom(roomId);
    }
  }, [roomId, joinRoom]);

  const isConnected = connectionStatus.includes('CONNECTED') || connectionStatus.includes('BAĞLANDI');

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px 20px' }}>
        
        {/* Icons */}
        <div style={{ fontSize: '80px', marginBottom: '30px' }}>
          {!isConnected && '⏳'}
          {isConnected && !isDownloading && !isFinished && '🔗'}
          {isDownloading && !isFinished && '⬇️'}
          {isFinished && '🎉'}
        </div>

        {/* Status Messages */}
        {!isConnected && (
            <div>
                <h2>Connecting to Peer...</h2>
                <p style={{ color: '#666' }}>Establishing secure P2P tunnel.</p>
            </div>
        )}
        
        {isConnected && !isDownloading && !isFinished && (
          <div>
            <h2 style={{ color: '#2ecc71' }}>Connected!</h2>
            <p>Waiting for sender to select the file...</p>
            <div className="loader" style={{ marginTop: '20px', color: '#666' }}>Ready to receive</div>
          </div>
        )}

        {isDownloading && !isFinished && (
          <div>
            <h2 style={{ color: '#646cff' }}>Downloading File...</h2>
            <p style={{ color: '#aaa', marginTop: '10px' }}>Please check your browser's download manager.</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Do not close this tab.</p>
          </div>
        )}

        {isFinished && (
          <div>
            <h2 style={{ color: '#2ecc71' }}>Transfer Completed!</h2>
            <p>File has been saved to your downloads folder.</p>
          </div>
        )}

      </div>
    </div>
  );
};