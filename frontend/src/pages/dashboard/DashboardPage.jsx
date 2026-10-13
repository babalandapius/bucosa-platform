import { Activity, BookOpen, CalendarDays, CreditCard, LogOut, Newspaper, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const overviewCards = [
  { title: 'Membership', value: 'Active', icon: ShieldCheck, tone: '#2563eb' },
  { title: 'Upcoming Events', value: '3 this month', icon: CalendarDays, tone: '#16a34a' },
  { title: 'News Feed', value: '12 updates', icon: Newspaper, tone: '#7c3aed' },
  { title: 'Study Resources', value: '9 available', icon: BookOpen, tone: '#ea580c' },
];

const quickLinks = [
  'Membership card access',
  'Executive directory',
  'Academic past papers',
  'Campus event updates',
  'News and announcements',
  'Contact BUCoSA support',
];

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const displayName = user?.full_name || user?.username || user?.student_id || 'Student member';
  const role = user?.userType || user?.role || 'student';
  const email = user?.email || 'No email provided';
  const adminRole = String(user?.role || user?.userType || '').toLowerCase();
  const hasAdminAccess = user?.userType === 'admin' || ['admin', 'super_admin', 'executive'].includes(adminRole);
  const canReviewApplications = ['admin', 'super_admin'].includes(adminRole);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#2563eb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>BUCoSA</p>
            <h1 style={{ margin: '8px 0 0', fontSize: '2.3rem' }}>Student dashboard</h1>
          </div>

          {hasAdminAccess && (
            <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {canReviewApplications && <Link to="/admin/memberships" style={{ padding: '10px 13px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Review applications</Link>}
              <Link to="/admin/memberships/new" style={{ padding: '10px 13px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Register a student</Link>
            </nav>
          )}

          <button
            type="button"
            onClick={logout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          {overviewCards.map(({ title, value, icon: Icon, tone }) => (
            <div key={title} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: `${tone}15`, color: tone }}>
                  <Icon size={20} />
                </span>
                <Activity size={16} color="#94a3b8" />
              </div>

              <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>{title}</p>
              <p style={{ margin: '10px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{value}</p>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '22px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: '46px', height: '46px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8' }}>
                <UserRound size={20} />
              </span>
              <div>
                <p style={{ margin: 0, color: '#64748b' }}>Welcome back</p>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.7rem' }}>{displayName}</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Membership status</p>
                <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#0f172a' }}>Verified member</p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Role</p>
                <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{role}</p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Email</p>
                <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#0f172a' }}>{email}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px 18px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <p style={{ margin: 0, color: '#1d4ed8', fontWeight: 700 }}>Platform focus</p>
              <p style={{ margin: '8px 0 0', color: '#1e3a8a', lineHeight: 1.6 }}>
                Stay updated on executive announcements, campus events, academic resources, and membership cards from a single access point.
              </p>
            </div>
          </div>

          <aside style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Quick access</h3>
              <CreditCard size={18} color="#64748b" />
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: '10px' }}>
              {quickLinks.map((link) => (
                <li key={link} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontWeight: 500 }}>
                  {link}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}