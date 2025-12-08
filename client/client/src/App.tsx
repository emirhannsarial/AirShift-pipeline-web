import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './presentation/pages/HomePage';
import { DownloadPage } from './presentation/pages/DownloadPage';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Modern Header (Glassmorphism) */}
        <nav style={{ 
          padding: '1.5rem 2rem', 
          background: 'rgba(30, 30, 30, 0.8)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            <span style={{ fontWeight: '800', fontSize: '1.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PipeLine.web
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.8'}>Home</a>
            <a href="https://github.com/emirhannsarial" target="_blank" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>GitHub</a>
          </div>
        </nav>

        {/* Ana İçerik */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/download/:roomId" element={<DownloadPage />} />
          </Routes>
        </main>

        {/* Modern Footer */}
        <footer style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          background: '#0a0a0a', 
          color: '#666', 
          fontSize: '0.9rem',
          borderTop: '1px solid #222'
        }}>
          <p>© {new Date().getFullYear()} PipeLine.web — Serverless, Limitless, Secure.</p>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;