import '../../App.css';

export const AboutPage = () => (
  <div className="container" style={{ paddingBottom: '100px' }}>
    
    {/* Hero Section */}
    <div style={{ textAlign: 'center', margin: '60px 0' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>How It Works?</h1>
      <p style={{ color: '#aaa', fontSize: '1.2rem' }}>The magic behind serverless file transfer.</p>
    </div>

    {/* Steps Container */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
      
      {/* Step 1 */}
      <div className="card" style={{ padding: '30px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '80px', position: 'absolute', right: '20px', top: '10px', opacity: 0.1 }}>1</div>
        <h2 style={{ color: '#646cff' }}>P2P Tunneling</h2>
        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
          Traditional services upload your file to a cloud server. 
          <strong>PipeLine.web</strong> creates a direct tunnel between two browsers using WebRTC technology.
        </p>
      </div>

      {/* Step 2 */}
      <div className="card" style={{ padding: '30px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '80px', position: 'absolute', right: '20px', top: '10px', opacity: 0.1 }}>2</div>
        <h2 style={{ color: '#42b883' }}>Unlimited Speed</h2>
        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
          Since there is no server in the middle, the transfer speed is only limited by your internet connection. 
          Your data takes the shortest path.
        </p>
      </div>

      {/* Step 3 */}
      <div className="card" style={{ padding: '30px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '80px', position: 'absolute', right: '20px', top: '10px', opacity: 0.1 }}>3</div>
        <h2 style={{ color: '#e74c3c' }}>End-to-End Encryption</h2>
        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
          Your files are encrypted using DTLS protocol. No one (including us) can see what you are sending. 
          Nothing is stored on our servers.
        </p>
      </div>

    </div>

    {/* Visual Animation (CSS ile basit bir bağlantı simülasyonu) */}
    <div style={{ marginTop: '80px', padding: '40px', background: '#1a1a1a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '50px' }}>💻</div>
        <p>Sender</p>
      </div>
      
      <div style={{ flex: 1, height: '4px', background: '#333', margin: '0 20px', position: 'relative', minWidth: '100px' }}>
        <div style={{ 
          width: '20px', height: '20px', background: '#646cff', borderRadius: '50%', 
          position: 'absolute', top: '-8px', left: '0',
          animation: 'movePacket 2s infinite linear' 
        }}></div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '50px' }}>📱</div>
        <p>Receiver</p>
      </div>
    </div>

    {/* Animation Keyframes (Bunu App.css'e de ekleyebilirsin ama burada style tagiyle verdim) */}
    <style>{`
      @keyframes movePacket {
        0% { left: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
      }
    `}</style>

  </div>
);