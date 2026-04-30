'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import api from '@/lib/api';

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: '100vh' },
  content: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700 },
  filters: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 20, padding: 16, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8 },
  select: { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, background: 'white' },
  input: { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, width: 100 },
  btn: { padding: '6px 14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  resetBtn: { padding: '6px 14px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '10px 16px', fontSize: 14, borderBottom: '1px solid #f3f4f6' },
  link: { color: '#2563eb', textDecoration: 'none', cursor: 'pointer' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 14 },
  pageBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14 },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  error: { color: '#dc2626', padding: 12, background: '#fef2f2', borderRadius: 6, marginBottom: 16 },
  empty: { textAlign: 'center', padding: 40, color: '#6b7280' }
};

interface Profile {
  id: string;
  name: string;
  gender: string;
  age: number | null;
  age_group: string;
  country_id: string | null;
  country_name?: string;
  gender_probability: number | null;
}

interface Meta {
  total: number;
  total_pages: number;
}

interface Links {
  prev: string | null;
  next: string | null;
}

interface Filters {
  gender: string;
  country_id: string;
  age_group: string;
  min_age: string;
  max_age: string;
  sort_by: string;
  order: string;
}

const INITIAL_FILTERS: Filters = { gender: '', country_id: '', age_group: '', min_age: '', max_age: '', sort_by: 'created_at', order: 'desc' };

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<Meta>({ total: 0, total_pages: 1 });
  const [links, setLinks] = useState<Links>({ prev: null, next: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async (currentFilters: Filters, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page: currentPage, limit: 20, ...currentFilters };
      // Remove empty strings
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);

      const res = await api.get('/api/profiles', { params });
      setProfiles(res.data.data);
      setMeta({ total: res.data.total, total_pages: res.data.total_pages });
      setLinks({ prev: res.data.links?.prev || null, next: res.data.links?.next || null });
    } catch (err) {
      setError((err as any).response?.data?.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(filters, page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles(filters, 1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
    fetchProfiles(INITIAL_FILTERS, 1);
  };

  const handlePrevPage = async () => {
    if (links.prev) {
      try {
        setLoading(true);
        const res = await api.get(links.prev);
        setProfiles(res.data.data);
        setMeta({ total: res.data.total, total_pages: res.data.total_pages });
        setLinks({ prev: res.data.links?.prev || null, next: res.data.links?.next || null });
        setPage(res.data.meta?.current_page || page - 1);
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to load previous page');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNextPage = async () => {
    if (links.next) {
      try {
        setLoading(true);
        const res = await api.get(links.next);
        setProfiles(res.data.data);
        setMeta({ total: res.data.total, total_pages: res.data.total_pages });
        setLinks({ prev: res.data.links?.prev || null, next: res.data.links?.next || null });
        setPage(res.data.meta?.current_page || page + 1);
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to load next page');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Profiles</h1>
          <span style={{ fontSize: 14, color: '#6b7280' }}>{meta.total.toLocaleString()} total</span>
        </div>

        {/* Filters */}
        <form style={styles.filters} onSubmit={handleSearch}>
          <select style={styles.select} value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}>
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select style={styles.select} value={filters.age_group} onChange={e => setFilters(f => ({ ...f, age_group: e.target.value }))}>
            <option value="">All age groups</option>
            <option value="child">Child</option>
            <option value="teenager">Teenager</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <input style={styles.input} placeholder="Country (NG)" value={filters.country_id} onChange={e => setFilters(f => ({ ...f, country_id: e.target.value }))} />
          <input style={styles.input} placeholder="Min age" type="number" value={filters.min_age} onChange={e => setFilters(f => ({ ...f, min_age: e.target.value }))} />
          <input style={styles.input} placeholder="Max age" type="number" value={filters.max_age} onChange={e => setFilters(f => ({ ...f, max_age: e.target.value }))} />
          <select style={styles.select} value={filters.sort_by} onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value }))}>
            <option value="created_at">Sort: Date</option>
            <option value="age">Sort: Age</option>
            <option value="gender_probability">Sort: Confidence</option>
          </select>
          <select style={styles.select} value={filters.order} onChange={e => setFilters(f => ({ ...f, order: e.target.value }))}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button type="submit" style={styles.btn}>Filter</button>
          <button type="button" style={styles.resetBtn} onClick={handleReset}>Reset</button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {/* Table */}
        {loading
          ? <p style={{ color: '#6b7280' }}>Loading...</p>
          : profiles.length === 0
            ? <div style={styles.empty}>No profiles found.</div>
            : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Gender</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Age Group</th>
                    <th style={styles.th}>Country</th>
                    <th style={styles.th}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id}>
                      <td style={styles.td}>
                        <span style={styles.link} onClick={() => router.push(`/profiles/${p.id}`)}>
                          {p.name}
                        </span>
                      </td>
                      <td style={styles.td}>{p.gender || '—'}</td>
                      <td style={styles.td}>{p.age != null ? p.age : '—'}</td>
                      <td style={styles.td}>{p.age_group || '—'}</td>
                      <td style={styles.td}>{p.country_id ? `${p.country_id}${p.country_name ? ` (${p.country_name})` : ''}` : '—'}</td>
                      <td style={styles.td}>{p.gender_probability != null ? `${Math.round(p.gender_probability * 100)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

        {/* Pagination */}
        {meta.total_pages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, ...(!links.prev ? styles.pageBtnDisabled : {}) }}
              onClick={handlePrevPage}
              disabled={!links.prev || loading}
            >
              ← Prev
            </button>
            <span style={{ color: '#6b7280' }}>Page {page} of {meta.total_pages}</span>
            <button
              style={{ ...styles.pageBtn, ...(!links.next ? styles.pageBtnDisabled : {}) }}
              onClick={handleNextPage}
              disabled={!links.next || loading}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}