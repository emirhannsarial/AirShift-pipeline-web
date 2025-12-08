import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; // Link import edildi
import { HomePage } from './presentation/pages/HomePage';
import { DownloadPage } from './presentation/pages/DownloadPage';
import { AboutPage } from './presentation/pages/AboutPage'; // Yeni
import { PrivacyPage } from './presentation/pages/PrivacyPage'; // Yeni
import { useEffect } from 'react';

function App() {

  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Sadece transfer devam ediyorsa uyar
      // (Burada store'dan duruma bakabilirsin ama basitçe her zaman soralım)
      e.preventDefault();
      e.returnValue = ''; // Chrome için gerekli
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header (Aynı kalacak) */}
        <nav style={{ 
          padding: '1.5rem 2rem', 
          background: 'rgba(30, 30, 30, 0.8)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            <span style={{ fontWeight: '800', fontSize: '1.5rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PipeLine.web
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <Link to="/about" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>About</Link>
          </div>
        </nav>

        {/* Routes */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/download/:roomId" element={<DownloadPage />} />
            <Route path="/about" element={<AboutPage />} /> {/* Yeni Route */}
            <Route path="/privacy" element={<PrivacyPage />} /> {/* Yeni Route */}
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', padding: '2rem', background: '#0a0a0a', color: '#666', 
          fontSize: '0.9rem', borderTop: '1px solid #222'
        }}>
          <p>© {new Date().getFullYear()} PipeLine.web — Serverless, Limitless, Secure.</p>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <Link to="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/about" style={{ color: '#666', textDecoration: 'none' }}>About Us</Link>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;