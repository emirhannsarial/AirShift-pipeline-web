import { useState } from 'react';
import { useTransferStore } from '../store/useTransferStore';
import QRCode from "react-qr-code";
import { AlertModal } from '../components/AlertModal';

export const HomePage = () => {
  const { 
    createRoom, 
    roomId, 
    connectionStatus, 
    progress, 
    selectedFile, 
    selectFile, 
    transferState, 
    resetTransfer, 
    peerLeft,
  } = useTransferStore();
  
  const [showToast, setShowToast] = useState(false);
  
  // Akordiyon State'i (Hangi başlık açık?)
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const shareLink = roomId ? `${window.location.origin}/download/${roomId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const isConnected = connectionStatus.includes('CONNECTED') || connectionStatus.includes('BAĞLANDI');

  // SEO İçerik Verisi
  const seoContent = [
    {
      title: "Why Choose AirShift for File Transfer?",
      content: "In the digital age, sharing large files shouldn't be complicated. AirShift offers a revolutionary approach to file sharing by utilizing WebRTC technology. Unlike traditional services like WeTransfer or Google Drive, we do not store your files on any server. It's strictly peer-to-peer."
    },
    {
      title: "🚀 Is it Truly Unlimited?",
      content: "Yes. Most email services limit attachments to 25MB. Cloud services often require you to pay for extra storage. With AirShift, the only limit is your device's storage. Whether you are sending a 100GB video project or a massive database backup, our P2P pipeline handles it with ease."
    },
    {
      title: "🔒 How Secure is End-to-End Encryption?",
      content: "Your privacy is our priority. Since your files are streamed directly from the sender to the receiver, there is no 'middleman'. We cannot see your files, and hackers cannot intercept them from a central server because there isn't one. All data is encrypted using DTLS (Datagram Transport Layer Security) standards."
    },
    {
      title: "⚡ Why is P2P Faster?",
      content: "Why wait for a file to upload to a server, only to wait again for it to download? AirShift streams data in real-time. If you are on the same Wi-Fi network, transfers happen at local network speeds (LAN), which can be up to 10x faster than cloud uploads."
    },
    {
      title: "📱 Do I Need to Register?",
      content: "No. We believe in simplicity. You don't need to create an account, verify an email, or remember another password. Just select a file, copy the secure link, and share it. It works on Windows, macOS, Android, and iOS directly from the browser."
    }
  ];

  return (
    <div className="container">
      <div className="main-layout">
        
        <div className="ad-sidebar">📢 Ad Space (160x600)</div>

        <div className="content-area">
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Send Files Without Limits</h1>
            <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
              Direct P2P transfer. No file size limit. No servers. Just you and the receiver.
            </p>
          </div>

          {/* ALICI KAÇTI MODALI */}
          {peerLeft && (
            <AlertModal 
              title="Receiver Disconnected" 
              message="The receiver has closed the tab or lost connection."
              actionText="Reload Page"
              type="error"
              onAction={() => window.location.reload()}
            />
          )}

          {/* DURUM 1: Dosya Seç */}
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

          {/* DURUM 2: Link Oluştur */}
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

          {/* DURUM 3: Paylaş ve Aktar */}
          {roomId && (
            <div className="card">
              <div className={`status-badge ${isConnected ? 'status-connected' : 'status-waiting'}`}>
                {isConnected ? '🟢 Peer Connected' : '🟡 Waiting for Peer...'}
              </div>

              {!isConnected && (
                <>
                  <p style={{ marginBottom: '10px' }}>Send this link to the receiver:</p>
                  
                  <div style={{ background: 'white', padding: '10px', width: 'fit-content', margin: '0 auto 20px auto', borderRadius: '8px' }}>
                      <QRCode value={shareLink} size={128} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <input type="text" readOnly value={shareLink} onClick={(e) => e.currentTarget.select()} />
                    <button onClick={copyToClipboard}>Copy Link</button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '15px' }}>
                    ⚠️ Do not close this tab until transfer is complete.
                  </p>
                </>
              )}

              {isConnected && (
                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                  
                  {transferState === 'REJECTED' ? (
                    <div style={{ textAlign: 'center', color: '#e74c3c' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚫</div>
                      <h3>Receiver Rejected</h3>
                      <p>The receiver chose not to download this file.</p>
                      <button onClick={resetTransfer} style={{ marginTop: '15px', background: '#333' }}>
                        Try Again / Select New File
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold' }}>
                        <span>
                          {transferState === 'COMPLETED' ? 'Completed' : 
                           transferState === 'TRANSFERRING' ? 'Sending...' : 
                           'Waiting for receiver to accept...'}
                        </span>
                        <span>%{progress}</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%`, background: transferState === 'ERROR' ? '#e74c3c' : '#28a745' }}></div>
                      </div>
                    </>
                  )}

                  {transferState === 'COMPLETED' && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                       <h3 style={{ color: '#2ecc71' }}>✅ Transfer Successful!</h3>
                       <button onClick={() => window.location.reload()} style={{ marginTop: '10px', background: '#333' }}>Send Another File</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- SEO ACCORDION SECTION (MODERN) --- */}
          <div style={{ marginTop: '60px', textAlign: 'left' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#fff' }}>Frequently Asked Questions</h2>
            
            {seoContent.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  background: '#1a1a1a', 
                  marginBottom: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #333',
                  overflow: 'hidden'
                }}
              >
                <button 
                  onClick={() => toggleAccordion(index)}
                  style={{ 
                    width: '100%', 
                    padding: '15px 20px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#fff', 
                    textAlign: 'left', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {item.title}
                  <span style={{ color: '#646cff' }}>{activeAccordion === index ? '−' : '+'}</span>
                </button>
                
                {activeAccordion === index && (
                  <div style={{ padding: '0 20px 20px 20px', color: '#aaa', lineHeight: '1.6' }}>
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* ------------------------------------- */}

        </div>

        <div className="ad-sidebar">📢 Ad Space (160x600)</div>
      </div>

      {showToast && <div className="toast">✅ Link copied to clipboard!</div>}
    </div>
  );
};