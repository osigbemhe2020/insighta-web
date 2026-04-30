'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import api from '@/lib/api';

interface ProfileStats {
  total: number;
  male: number;
  female: number;
  topCountries: [string, number][];
  ageGroups: Record<string, number>;
}

const styles = {
  page: { minHeight: '100vh' },
  content: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px 24px' },
  cardLabel: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  cardValue: { fontSize: 28, fontWeight: 700, color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  th: { textAlign: 'left' as const, padding: '10px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '10px 16px', fontSize: 14, borderBottom: '1px solid #f3f4f6' },
  error: { color: '#dc2626', padding: 16, background: '#fef2f2', borderRadius: 6 }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Make API calls sequentially to avoid race conditions with token refresh
        const all = await api.get('/api/profiles?limit=1');
        const male = await api.get('/api/profiles?limit=1&gender=male');
        const female = await api.get('/api/profiles?limit=1&gender=female');
        const countries = await api.get('/api/profiles?limit=100&sort_by=country_id');
        const ageSample = await api.get('/api/profiles?limit=200');

        // Build country frequency map
        const countryMap: Record<string, number> = {};
        countries.data.data.forEach((p: any) => {
          if (p.country_id) {
            const key = p.country_name ? `${p.country_id} — ${p.country_name}` : p.country_id;
            countryMap[key] = (countryMap[key] || 0) + 1;
          }
        });

        const topCountries = Object.entries(countryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        // Calculate age group distribution
        const ageGroups: Record<string, number> = {
          '18-24': 0,
          '25-34': 0,
          '35-44': 0,
          '45-54': 0,
          '55+': 0
        };

        ageSample.data.data.forEach((p: any) => {
          if (p.age) {
            if (p.age <= 24) ageGroups['18-24']++;
            else if (p.age <= 34) ageGroups['25-34']++;
            else if (p.age <= 44) ageGroups['35-44']++;
            else if (p.age <= 54) ageGroups['45-54']++;
            else ageGroups['55+']++;
          }
        });

        setStats({
          total: all.data.total,
          male: male.data.total,
          female: female.data.total,
          topCountries,
          ageGroups
        });
      } catch (err) {
        const error = err as any;
        setError(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.content}>
        <h1 style={styles.title}>Dashboard</h1>

        {error && <div style={styles.error}>{error}</div>}

        {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

        {stats && (
          <>
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Total Profiles</div>
                <div style={styles.cardValue}>{stats.total.toLocaleString()}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Male</div>
                <div style={styles.cardValue}>{stats.male.toLocaleString()}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Female</div>
                <div style={styles.cardValue}>{stats.female.toLocaleString()}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Other/Unknown</div>
                <div style={styles.cardValue}>
                  {(stats.total - stats.male - stats.female).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div>
                <h2 style={styles.sectionTitle}>Top Countries</h2>
                {stats.topCountries.length === 0
                  ? <p style={{ color: '#6b7280', fontSize: 14 }}>No country data available.</p>
                  : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Country</th>
                          <th style={styles.th}>Profiles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topCountries.map(([country, count]) => (
                          <tr key={country}>
                            <td style={styles.td}>{country}</td>
                            <td style={styles.td}>{count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>

              <div>
                <h2 style={styles.sectionTitle}>Age Group Distribution</h2>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Age Group</th>
                      <th style={styles.th}>Count</th>
                      <th style={styles.th}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.ageGroups).map(([group, count]) => {
                      const countNum = count as number;
                      const percentage = stats.total > 0 ? ((countNum / stats.total) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={group}>
                          <td style={styles.td}>{group}</td>
                          <td style={styles.td}>{countNum}</td>
                          <td style={styles.td}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};