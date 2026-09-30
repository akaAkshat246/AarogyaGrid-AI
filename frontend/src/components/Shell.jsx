import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/phcs', label: 'PHC Centers' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/predictions', label: 'AI Predictions' },
  { to: '/transfers', label: 'Redistribution' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/map', label: 'District Map' },
  { to: '/copilot', label: 'Gemini Copilot' }
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [recentAlerts] = useState([
    { id: 'alt-1', title: 'Critical Insulin Shortage', phc: 'PHC Sector 22 Noida', time: '5m ago', severity: 'CRITICAL' },
    { id: 'alt-2', title: 'Outbreak Bed Overload', phc: 'PHC Muradnagar Rural', time: '18m ago', severity: 'CRITICAL' },
    { id: 'alt-3', title: 'High Dengue Admission Footfall', phc: 'PHC Laxmi Nagar', time: '42m ago', severity: 'HIGH_RISK' }
  ]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setAlertsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchItems = [
    { type: 'Page', title: 'Dashboard Overview', path: '/dashboard' },
    { type: 'Page', title: 'PHC Health Centers Directory', path: '/phcs' },
    { type: 'Page', title: 'Medicine Stock Inventory', path: '/inventory' },
    { type: 'Page', title: 'AI Demand Predictions & Ridge ML', path: '/predictions' },
    { type: 'Page', title: 'Smart Redistribution & Transfers', path: '/transfers' },
    { type: 'Page', title: 'Interactive District Map', path: '/map' },
    { type: 'Page', title: 'Gemini Operations Copilot', path: '/copilot' },
    { type: 'Facility', title: 'PHC Sector 22 Noida', path: '/phcs' },
    { type: 'Facility', title: 'PHC Sector 62 Noida', path: '/phcs' },
    { type: 'Facility', title: 'PHC Laxmi Nagar', path: '/phcs' },
    { type: 'Facility', title: 'PHC Muradnagar Rural', path: '/phcs' },
    { type: 'Resource', title: 'Insulin Glargine 100IU', path: '/inventory' },
    { type: 'Resource', title: 'ORS Rehydration Salts', path: '/inventory' },
    { type: 'Resource', title: 'IV Normal Saline 500ml', path: '/inventory' }
  ];

  const filteredSearch = searchItems.filter(item =>
    (item.title + item.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <b>AarogyaGrid</b>
            <small>AI HEALTH NETWORK</small>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title="Collapse navigation menu"
            aria-label="Collapse navigation menu"
          >
            <span className="hamburger-box">
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </span>
          </button>
        </div>

        <nav>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="nav-dot" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="status">
            <i /> Services online
          </div>
          <button
            className="profile"
            onClick={() => {
              if (window.confirm('Do you want to log out of AarogyaGrid AI?')) {
                logout();
                nav('/login');
              }
            }}
            title="Click to log out"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span>{(user?.name || 'A')[0]}</span>
            )}
            <div>
              <b>{user?.name || 'Administrator'}</b>
              <small>{user?.mode === 'google' ? 'Google Authenticated' : user?.mode === 'demo' ? 'Demo Administrator' : 'Health Officer'}</small>
            </div>
            <em style={{ fontSize: '11px', color: '#999' }}>Exit</em>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Hamburger button visible only when sidebar is closed/collapsed */}
            <button
              className={`menu-btn-extreme-left ${!sidebarCollapsed ? 'hidden-on-desktop' : ''}`}
              onClick={toggleSidebar}
              aria-label="Open navigation menu"
              title="Open navigation menu"
            >
              <span className="hamburger-box">
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </span>
            </button>
            <div className="topbar-headings">
              <span className="eyebrow">NATIONAL HEALTH RESOURCE NETWORK</span>
              <h1>Predict. Share. Respond.</h1>
            </div>
          </div>

          <div className="top-actions" style={{ position: 'relative' }}>
            <span className="live">
              <i /> Live monitoring
            </span>

            {/* Quick Search Button */}
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(true)}
              title="Search facilities, medicines, pages (Press '/')"
              aria-label="Search"
              style={{ fontSize: '11px', fontWeight: 'bold' }}
            >
              Search
            </button>

            {/* Notifications Button */}
            <button
              className="icon-btn"
              onClick={() => setAlertsOpen(!alertsOpen)}
              title="View live alerts"
              aria-label="Alerts"
              style={{ position: 'relative', fontSize: '11px', fontWeight: 'bold' }}
            >
              Alerts
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#e53e3e'
              }} />
            </button>

            {/* Alerts Dropdown Modal */}
            {alertsOpen && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '320px',
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b style={{ fontSize: '13px' }}>Active System Alerts</b>
                  <NavLink to="/alerts" onClick={() => setAlertsOpen(false)} style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 'bold' }}>
                    View all
                  </NavLink>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentAlerts.map(a => (
                    <div
                      key={a.id}
                      onClick={() => { setAlertsOpen(false); nav('/alerts'); }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: a.severity === 'CRITICAL' ? '#fdf2f2' : '#fefaf0',
                        borderLeft: `3px solid ${a.severity === 'CRITICAL' ? '#e53e3e' : '#dd6b20'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <b style={{ fontSize: '11px', display: 'block', color: '#333' }}>{a.title}</b>
                      <small style={{ fontSize: '9px', color: '#777' }}>{a.phc} - {a.time}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Global Quick Search Modal */}
        {searchOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(3px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '80px'
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="card"
              style={{
                width: '560px',
                maxWidth: '92%',
                maxHeight: '75vh',
                overflow: 'hidden',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#888' }}>FIND</span>
                <input
                  autoFocus
                  placeholder="Search facilities, medicines, pages, or corridors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    background: 'transparent'
                  }}
                />
                <span style={{ fontSize: '10px', color: '#999', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>ESC</span>
              </div>

              <div style={{ marginTop: '12px', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredSearch.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchOpen(false);
                      nav(item.path);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <b style={{ fontSize: '13px', color: 'var(--ink)' }}>{item.title}</b>
                    </div>
                    <span style={{ fontSize: '10px', color: '#888', background: '#f5f5f1', padding: '3px 7px', borderRadius: '6px' }}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
