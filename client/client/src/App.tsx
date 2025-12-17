import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './presentation/pages/HomePage';
import { DownloadPage } from './presentation/pages/DownloadPage';
import { AboutPage } from './presentation/pages/AboutPage';
import { PrivacyPage } from './presentation/pages/PrivacyPage';
import { TermsPage } from './presentation/pages/TermsPage';
import { CookieBanner } from './presentation/components/CookieBanner';
function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Modern Header */}
        <nav style={{ 
          padding: '1.2rem 2rem', 
          background: 'rgba(20, 20, 20, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🚀</span>
            <span style={{ 
              fontWeight: '900', 
              fontSize: '1.5rem', 
              background: 'linear-gradient(90deg, #fff, #aaa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              AirShift
            </span>
          </div>
          </Link>
          <div style={{ display: 'flex', gap: '25px', fontSize: '0.95rem' }}>
            <Link to="/" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#ccc'}>Home</Link>
            <Link to="/about" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#ccc'}>How it Works</Link>
          </div>
        </nav>

        {/* Content */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/download/:roomId" element={<DownloadPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', padding: '2rem', background: '#080808', color: '#555', 
          fontSize: '0.85rem', borderTop: '1px solid #1a1a1a', marginTop: 'auto'
        }}>
          <p style={{ marginBottom: '10px' }}>© {new Date().getFullYear()} AirShift — Serverless, Limitless, Secure.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link to="/privacy" style={{ color: '#555', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#555', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/about" style={{ color: '#555', textDecoration: 'none' }}>About</Link>
            
          </div>
        </footer>
        {/* Cookie Banner */}
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;