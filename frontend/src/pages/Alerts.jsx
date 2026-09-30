import React, { useState } from 'react';
import { endpoints } from '../services/api';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';

const initialAlerts = [
  { id: 'alt-001', severity: 'CRITICAL', title: 'Insulin Glargine stockout predicted in 1.5 days', text: 'PHC Sector 22 Noida · Current stock: 31 units | Predicted demand tomorrow: 20.4 units. Shortfall: 82 units.', time: '2 min ago', phcId: 'phc-noida-sec22' },
  { id: 'alt-002', severity: 'CRITICAL', title: 'Bed Capacity Overload (100% occupied)', text: 'PHC Muradnagar Rural · 0 of 20 beds available. Dengue intake rising +45%.', time: '14 min ago', phcId: 'phc-ghaziabad-rural' },
  { id: 'alt-003', severity: 'HIGH_RISK', title: 'ORS Rehydration Salts below safety buffer', text: 'PHC Laxmi Nagar · Only 3.2 days of ORS remaining. High pediatric outpatient footfall.', time: '38 min ago', phcId: 'phc-delhi-east-01' },
  { id: 'alt-004', severity: 'WATCH', title: 'Evening Bed Occupancy Approaching 80%', text: 'PHC Hauz Khas · 16 of 20 beds currently occupied.', time: '1 hour ago', phcId: 'phc-delhi-south-02' }
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolved, setResolved] = useState([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [simulating, setSimulating] = useState(false);

  const handleResolve = async (id) => {
    const item = alerts.find(x => x.id === id);
    if (!item) return;
    try {
      await endpoints.resolveAlert(id);
    } catch {}
    setAlerts(alerts.filter(x => x.id !== id));
    setResolved([{ ...item, resolvedAt: 'Just now' }, ...resolved]);
  };

  const handleSimulateSurge = async () => {
    setSimulating(true);
    try {
      const res = await endpoints.emergency();
      const newSurgeAlert = {
        id: `alt-surge-${Date.now()}`,
        severity: 'CRITICAL',
        title: 'DENGUE OUTBREAK SURGE SIMULATION TRIGGERED',
        text: `Footfall spiked +45% across East Delhi & Ghaziabad. Projected IV Fluids shortfall: 250 units at Muradnagar.`,
        time: 'Just now',
        phcId: 'phc-ghaziabad-rural'
      };
      setAlerts([newSurgeAlert, ...alerts]);
      alert('Emergency Dengue Surge triggered! New critical alerts and logistics transfer orders generated.');
    } catch (e) {
      const fallbackAlert = {
        id: `alt-surge-${Date.now()}`,
        severity: 'CRITICAL',
        title: 'DENGUE OUTBREAK SURGE SIMULATION TRIGGERED',
        text: `Footfall spiked +45%. Rapid IV Fluids & ORS consumption increase simulated.`,
        time: 'Just now',
        phcId: 'phc-ghaziabad-rural'
      };
      setAlerts([fallbackAlert, ...alerts]);
    } finally {
      setSimulating(false);
    }
  };

  const visibleAlerts = filter === 'ACTIVE' ? alerts : filter === 'CRITICAL' ? alerts.filter(a => a.severity === 'CRITICAL') : resolved;

  return (
    <>
      <PageTitle
        title="Alerts & Operational Action Items"
        desc="Prioritized early warning signals requiring administrative attention or stock redistribution."
        action={
          <button className="primary" onClick={handleSimulateSurge} disabled={simulating}>
            {simulating ? 'Simulating…' : 'Simulate Dengue Outbreak Surge'}
          </button>
        }
      />

      <div className="toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={filter === 'ACTIVE' ? 'primary' : 'secondary'}
          onClick={() => setFilter('ACTIVE')}
        >
          Active Alerts ({alerts.length})
        </button>
        <button
          className={filter === 'CRITICAL' ? 'primary' : 'secondary'}
          onClick={() => setFilter('CRITICAL')}
        >
          Critical ({alerts.filter(a => a.severity === 'CRITICAL').length})
        </button>
        <button
          className={filter === 'RESOLVED' ? 'primary' : 'secondary'}
          onClick={() => setFilter('RESOLVED')}
        >
          Resolved Archive ({resolved.length})
        </button>
      </div>

      <div className="alert-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {visibleAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>All Clear</div>
            <b>No alerts matching this filter.</b>
            <p style={{ fontSize: '11px', margin: '4px 0 0' }}>All primary health facilities are within normal operational limits.</p>
          </div>
        ) : (
          visibleAlerts.map(a => (
            <div className="card alert-item" key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px' }}>
              <div
                className={`alert-dot ${a.severity.toLowerCase()}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: '800',
                  fontSize: '11px',
                  color: '#fff',
                  background: a.severity === 'CRITICAL' ? '#e53e3e' : a.severity === 'HIGH_RISK' ? '#dd6b20' : '#d69e2e'
                }}
              >
                {a.severity === 'CRITICAL' ? 'CRIT' : 'WARN'}
              </div>

              <div className="alert-main" style={{ flex: 1 }}>
                <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px' }}>{a.title}</h3>
                  <Badge>{a.severity}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666', lineHeight: '1.4' }}>{a.text}</p>
                <small style={{ fontSize: '9px', color: '#999', display: 'block', marginTop: '4px' }}>
                  {a.time || a.resolvedAt}
                </small>
              </div>

              {filter !== 'RESOLVED' && (
                <button
                  className="secondary"
                  onClick={() => handleResolve(a.id)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
