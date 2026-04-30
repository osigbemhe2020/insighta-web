'use client';

import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

const BACKEND_URL = 'http://localhost:3002';

const styles = {
  nav: { background: '#1e293b', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  brand: { fontWeight: 700, fontSize: 16, color: 'white', textDecoration: 'none' },
  links: { display: 'flex', gap: 4, alignItems: 'center' },
  link: { color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 14 },
  activeLink: { color: 'white', background: '#334155' },
  logoutBtn: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }
};

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/search', label: 'Search' },
  { href: '/account', label: 'Account' }
];

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    router.push('/');
  };

  return (
    <nav style={styles.nav}>
      <a href="/dashboard" style={styles.brand}>Insighta Labs+</a>
      <div style={styles.links}>
        {navLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            style={{ ...styles.link, ...(pathname === href ? styles.activeLink : {}) }}
          >
            {label}
          </a>
        ))}
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}