'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const styles = {
  page: { minHeight: '100vh' },
  content: { maxWidth: 500, margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 },
  avatar: { width: 72, height: 72, borderRadius: '50%', marginBottom: 16, border: '2px solid #e5e7eb' },
  name: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  username: { color: '#6b7280', fontSize: 14, marginBottom: 16 },
  divider: { borderBottom: '1px solid #f3f4f6', margin: '12px 0' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 },
  label: { color: '#6b7280', fontWeight: 500 },
  value: { color: '#111827' },
  roleBadge: { padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 },
  adminBadge: { background: '#fee2e2', color: '#991b1b' },
  analystBadge: { background: '#dbeafe', color: '#1e40af' },
  error: { color: '#dc2626', padding: 12, background: '#fef2f2', borderRadius: 6 }
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        const error = err as any;
        setError(error.response?.data?.message || 'Failed to load account info');
      }
    };
    fetch();
  }, []);

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.content}>
        <h1 style={styles.title}>Account</h1>

        {error && <div style={styles.error}>{error}</div>}
        {!user && !error && <p style={{ color: '#6b7280' }}>Loading...</p>}

        {user && (
          <div style={styles.card}>
            {user.avatar_url && (
              <img src={user.avatar_url} alt={user.username} style={styles.avatar} />
            )}
            <div style={styles.name}>{user.username}</div>
            <div style={styles.username}>@{user.username}</div>

            <div style={styles.divider} />

            <div style={styles.row}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user.email || '—'}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Role</span>
              <span style={{
                ...styles.roleBadge,
                ...(user.role === 'admin' ? styles.adminBadge : styles.analystBadge)
              }}>
                {user.role}
              </span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>User ID</span>
              <span style={{ ...styles.value, fontSize: 12, color: '#9ca3af' }}>{user.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}