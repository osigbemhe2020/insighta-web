'use client';

const BACKEND_URL = 'https://site--hng14-backend--nlrjqkv9zhwn.code.run'

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '40px 48px', width: 360, textAlign: 'center' as const, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  subtitle: { color: '#6b7280', marginBottom: 32, fontSize: 14 },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '10px 0', background: '#24292f', color: 'white', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' },
  footer: { marginTop: 24, fontSize: 12, color: '#9ca3af' }
};

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Insighta Labs+</h1>
        <p style={styles.subtitle}>Profile Intelligence System</p>

        <button style={styles.btn} onClick={handleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <p style={styles.footer}>You'll be redirected to GitHub to authenticate</p>
      </div>
    </div>
  );
}
