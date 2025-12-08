interface AlertModalProps {
  title: string;
  message: string;
  onAction: () => void;
  actionText?: string;
  type?: 'error' | 'success';
}

export const AlertModal = ({ title, message, onAction, actionText, type = 'error' }: AlertModalProps) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#1e1e1e', padding: '30px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center', border: `1px solid ${type === 'error' ? '#e74c3c' : '#2ecc71'}`
    }}>
      <h2 style={{ color: type === 'error' ? '#e74c3c' : '#fff', marginBottom: '10px' }}>{title}</h2>
      <p style={{ margin: '20px 0', color: '#ccc', lineHeight: '1.5' }}>{message}</p>
      <button onClick={onAction} style={{ background: type === 'error' ? '#e74c3c' : '#2ecc71', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
        {actionText || 'OK'}
      </button>
    </div>
  </div>
);