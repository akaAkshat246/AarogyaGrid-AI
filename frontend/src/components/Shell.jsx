import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../services/api';

const links = [
  ['/dashboard', '⌂', 'Dashboard'],
  ['/phcs', '⌖', 'PHC Centers'],
  ['/inventory', '▣', 'Inventory'],
  ['/predictions', '◒', 'AI Predictions'],
  ['/transfers', '⇄', 'Redistribution'],
  ['/alerts', '!', 'Alerts'],
  ['/map', '◉', 'District Map'],
  ['/copilot', '✦', 'Gemini Copilot']
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([
    { id: 'alt-1', title: 'Critical Insulin Shortage', phc: 'PHC Sector 22 Noida', time: '5m ago', severity: 'CRITICAL' },
    { id: 'alt-2', title: 'Outbreak Bed Overload', phc: 'PHC Muradnagar Rural', time: '18m ago', severity: 'CRITICAL' },
    { id: 'alt-3', title: 'High Dengue Admission Footfall', phc: 'PHC Laxmi Nagar', time: '42m ago', severity: 'HIGH_RISK' }
  ]);

  // Keyboard shortcut '/' for Quick Search
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
    { type: 'Page', title: 'Interactive District Map (Google Maps)', path: '/map' },
    { type: 'Page', title: 'Gemini Operations Copilot', path: '/copilot' },
    { type: 'PHC', title: 'PHC Sector 22 Noida (Gautam Buddha Nagar)', path: '/phcs' },
    { type: 'PHC', title: 'PHC Sector 62 Noida (Surplus Hub)', path: '/phcs' },
    { type: 'PHC', title: 'PHC Laxmi Nagar (East Delhi)', path: '/phcs' },
    { type: 'PHC', title: 'PHC Muradnagar Rural (Ghaziabad)', path: '/phcs' },
    { type: 'Medicine', title: 'Insulin Glargine 100IU (Critical Stock)', path: '/inventory' },
    { type: 'Medicine', title: 'ORS Rehydration Salts (High Demand)', path: '/inventory' },
    { type: 'Medicine', title: 'IV Normal Saline 500ml (Surplus Available)', path: '/inventory' }
  ];

  const filteredSearch = searchItems.filter(item =>
    (item.title + item.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
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
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <b>AarogyaGrid</b>
            <small>AI HEALTH NETWORK</small>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>

        <nav>
          {links.map(([to, icon, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{icon}</span>
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
              <span>{(user?.name || 'D')[0]}</span>
            )}
            <div>
              <b>{user?.name || 'Administrator'}</b>
              <small>{user?.mode === 'google' ? 'Google Authenticated' : user?.mode === 'demo' ? 'Demo Admin' : 'Health Officer'}</small>
            </div>
            <em>↪</em>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-toggle icon-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div>
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
              title="Search PHCs, medicines, pages (Press '/')"
              aria-label="Search"
            >
              ⌕
            </button>

            {/* Notifications Button */}
            <button
              className="icon-btn"
              onClick={() => setAlertsOpen(!alertsOpen)}
              title="View live alerts"
              aria-label="Alerts"
              style={{ position: 'relative' }}
            >
              !
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#e53e3e',
                border: '2px solid #fff'
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
                    View all →
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
                      <small style={{ fontSize: '9px', color: '#777' }}>{a.phc} · {a.time}</small>
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
                <span style={{ fontSize: '18px', color: '#888' }}>⌕</span>
                <input
                  autoFocus
                  placeholder="Search facilities, medicines, pages, or routes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    background: 'transparent'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#999', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>ESC</span>
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
