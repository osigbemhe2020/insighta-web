'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import api from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number | null;
  age: number | null;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number | null;
  created_at: string;
}

interface Field {
  label: string;
  key: keyof Profile;
  format?: (value: any) => string;
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: '100vh' },
  content: { maxWidth: 600, margin: '0 auto', padding: '32px 24px' },
  back: { color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  label: { color: '#6b7280', fontWeight: 500 },
  value: { color: '#111827' },
  error: { color: '#dc2626', padding: 12, background: '#fef2f2', borderRadius: 6 }
};

const fields: Field[] = [
  { label: 'ID', key: 'id' },
  { label: 'Name', key: 'name' },
  { label: 'Gender', key: 'gender' },
  { label: 'Gender Probability', key: 'gender_probability', format: (v: number | null) => v != null ? `${Math.round(v * 100)}%` : '—' },
  { label: 'Age', key: 'age', format: (v: number | null) => v != null ? v.toString() : '—' },
  { label: 'Age Group', key: 'age_group' },
  { label: 'Country', key: 'country_id' },
  { label: 'Country Name', key: 'country_name' },
  { label: 'Country Probability', key: 'country_probability', format: (v: number | null) => v != null ? `${Math.round(v * 100)}%` : '—' },
  { label: 'Created', key: 'created_at', format: (v: string) => v ? new Date(v).toLocaleString() : '—' }
];

export default function ProfileDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/profiles/${id}`);
        setProfile(res.data.data);
      } catch (err: any) {
        setError(err.response?.status === 404 ? 'Profile not found.' : err.response?.data?.message || 'Failed to load profile');
      }
    };
    fetch();
  }, [id]);

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.content}>
        <button style={styles.back} onClick={() => router.push('/profiles')}>← Back to profiles</button>
        <h1 style={styles.title}>Profile Detail</h1>

        {error && <div style={styles.error}>{error}</div>}
        {!profile && !error && <p style={{ color: '#6b7280' }}>Loading...</p>}

        {profile && (
          <div style={styles.card}>
            {fields.map(({ label, key, format }) => (
              <div style={styles.row} key={key}>
                <span style={styles.label}>{label}</span>
                <span style={styles.value}>
                  {format ? format(profile[key]) : (profile[key] || '—')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}