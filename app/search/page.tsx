'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import api from '@/lib/api';

interface SearchResult {
  id: string;
  name: string;
  gender: string;
  age: number | null;
  age_group: string;
  country_id: string;
}

interface SearchResponse {
  data: SearchResult[];
  total: number;
  total_pages: number;
  interpreted_as: any;
}

interface Styles {
  [key: string]: React.CSSProperties;
}

const styles: Styles = {
  page: { minHeight: '100vh' },
  content: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  subtitle: { color: '#6b7280', fontSize: 14, marginBottom: 24 },
  form: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 },
  btn: { padding: '10px 20px', background: '#1e293b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  interpreted: { padding: '10px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, fontSize: 13, color: '#0369a1', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '10px 16px', fontSize: 14, borderBottom: '1px solid #f3f4f6' },
  nameLink: { color: '#2563eb', cursor: 'pointer' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 14 },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14 },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  error: { color: '#dc2626', padding: 12, background: '#fef2f2', borderRadius: 6, marginBottom: 16 },
  empty: { textAlign: 'center', padding: 40, color: '#6b7280' },
  examples: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { padding: '4px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 99, fontSize: 12, color: '#475569', cursor: 'pointer' }
};

const EXAMPLES = [
  'young males from nigeria',
  'adult women from kenya',
  'senior males above 65',
  'female teenagers',
  'people from ghana',
  'males above 30 from south africa'
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [lastQuery, setLastQuery] = useState<string>('');

  const doSearch = async (q: string, p: number = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/profiles/search', { params: { q: q.trim(), page: p, limit: 20 } });
      setResults(res.data);
      setLastQuery(q.trim());
      setPage(p);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    doSearch(query, 1);
  };

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.content}>
        <h1 style={styles.title}>Natural Language Search</h1>
        <p style={styles.subtitle}>Search profiles using plain English</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder='e.g. "young males from nigeria"'
            value={query}
            onChange={e => setQuery((e.target as HTMLInputElement).value)}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div style={styles.examples}>
          {EXAMPLES.map(ex => (
            <span
              key={ex}
              style={styles.chip}
              onClick={() => { setQuery(ex); doSearch(ex, 1); }}
            >
              {ex}
            </span>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {results && (
          <>
            <div style={styles.interpreted}>
              <strong>Interpreted as:</strong> {JSON.stringify(results.interpreted_as)}
              <span style={{ marginLeft: 16, color: '#0ea5e9' }}>{results.total} result{results.total !== 1 ? 's' : ''}</span>
            </div>

            {results.data.length === 0
              ? <div style={styles.empty}>No profiles matched your query.</div>
              : (
                <>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Gender</th>
                        <th style={styles.th}>Age</th>
                        <th style={styles.th}>Age Group</th>
                        <th style={styles.th}>Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.map(p => (
                        <tr key={p.id}>
                          <td style={styles.td}>
                            <span style={styles.nameLink} onClick={() => router.push(`/profiles/${p.id}`)}>
                              {p.name}
                            </span>
                          </td>
                          <td style={styles.td}>{p.gender || '—'}</td>
                          <td style={styles.td}>{p.age != null ? p.age : '—'}</td>
                          <td style={styles.td}>{p.age_group || '—'}</td>
                          <td style={styles.td}>{p.country_id || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {results.total_pages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
                        onClick={() => doSearch(lastQuery, page - 1)}
                        disabled={page === 1}
                      >← Prev</button>
                      <span style={{ color: '#6b7280' }}>Page {page} of {results.total_pages}</span>
                      <button
                        style={{ ...styles.pageBtn, ...(page >= results.total_pages ? styles.pageBtnDisabled : {}) }}
                        onClick={() => doSearch(lastQuery, page + 1)}
                        disabled={page >= results.total_pages}
                      >Next →</button>
                    </div>
                  )}
                </>
              )}
          </>
        )}
      </div>
    </div>
  );
}