import { useState } from 'react';
import { useTransferStore } from '../store/useTransferStore';

export const HomePage = () => {
  const { createRoom, roomId, connectionStatus, progress, selectedFile, selectFile } = useTransferStore();
  const [showToast, setShowToast] = useState(false);
  
  const shareLink = roomId ? `${window.location.origin}/download/${roomId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isConnected = connectionStatus.includes('BAĞLANDI') || connectionStatus.includes('CONNECTED');

  return (
    <div className="container">
      <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Send Files Without Limits</h1>
        <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Direct P2P transfer. No file size limit. No servers. Just you and the receiver.
        </p>
      </div>

      {/* STEP 1: Select File */}
      {!roomId && !selectedFile && (
        <div className="card upload-zone">
          <label style={{ cursor: 'pointer', display: 'block', padding: '40px' }}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>📦</div>
            <h3>Click to Select a File</h3>
            <p style={{ color: '#666' }}>or drag and drop any file here</p>
            <input 
              type="file" 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && selectFile(e.target.files[0])}
            />
          </label>
        </div>
      )}

      {/* STEP 2: Create Link */}
      {!roomId && selectedFile && (
        <div className="card">
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>📄</div>
          <h3 style={{ wordBreak: 'break-all' }}>{selectedFile.name}</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          
          <button onClick={createRoom} style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
            Create Transfer Link ✨
          </button>
          
          <p 
            style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', cursor: 'pointer', textDecoration: 'underline' }} 
            onClick={() => window.location.reload()}
          >
            Cancel
          </p>
        </div>
      )}

      {/* STEP 3: Share Link */}
      {roomId && (
        <div className="card">
          <div className={`status-badge ${isConnected ? 'status-connected' : 'status-waiting'}`}>
            {isConnected ? '🟢 Peer Connected - Transferring' : '🟡 Waiting for Peer...'}
          </div>

          {!isConnected && (
            <>
              <p style={{ marginBottom: '10px' }}>Send this link to the receiver:</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <input type="text" readOnly value={shareLink} onClick={(e) => e.currentTarget.select()} />
                <button onClick={copyToClipboard}>Copy Link</button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '15px' }}>
                ⚠️ Do not close this tab until transfer is complete.
              </p>
            </>
          )}

          {/* Progress Bar */}
          {isConnected && (
            <div style={{ marginTop: '30px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold' }}>
                <span>{progress === 100 ? 'Completed' : 'Sending...'}</span>
                <span>%{progress}</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              {progress === 100 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                   <h3 style={{ color: '#2ecc71' }}>✅ Transfer Successful!</h3>
                   <button onClick={() => window.location.reload()} style={{ marginTop: '10px', background: '#333' }}>Send Another File</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showToast && <div className="toast">✅ Link copied to clipboard!</div>}
    </div>
  );
};