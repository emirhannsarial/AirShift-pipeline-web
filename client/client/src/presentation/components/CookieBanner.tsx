import { useState } from 'react';

export const CookieBanner = () => {
  // DÜZELTME: useEffect yerine Lazy Initialization kullanıyoruz.
  // Bu yöntem hem daha hızlıdır hem de ESLint hatasını çözer.
  const [show, setShow] = useState(() => {
    // Tarayıcıda kayıtlı mı diye kontrol et
    const accepted = localStorage.getItem('cookieConsent');
    // Kayıtlı değilse göster (true), kayıtlıysa gösterme (false)
    return !accepted;
  });

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      background: '#111',
      borderTop: '1px solid #333',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      zIndex: 9999,
      flexWrap: 'wrap',
      boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
    }}>
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>
        We use cookies to analyze traffic and show ads. By using our site, you accept our 
        <a href="/privacy" style={{ color: '#646cff', marginLeft: '5px' }}>Privacy Policy</a>.
      </p>
      <button 
        onClick={acceptCookies}
        style={{
          background: '#646cff',
          color: 'white',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Accept
      </button>
    </div>
  );
};