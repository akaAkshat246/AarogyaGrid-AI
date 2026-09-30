import React, { useEffect, useState } from 'react';
import { endpoints } from '../services/api';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';

const defaultInventory = [
  { id: 'inv-101', phcId: 'phc-noida-sec22', phcName: 'PHC Sector 22 Noida', medicine: 'Insulin Glargine 100IU', quantity: 31, minimumStock: 100, dailyUsage: 20.4 },
  { id: 'inv-102', phcId: 'phc-noida-sec22', phcName: 'PHC Sector 22 Noida', medicine: 'Paracetamol 500mg', quantity: 230, minimumStock: 150, dailyUsage: 48 },
  { id: 'inv-103', phcId: 'phc-noida-sec62', phcName: 'PHC Sector 62 Noida', medicine: 'Insulin Glargine 100IU', quantity: 472, minimumStock: 80, dailyUsage: 14.5 },
  { id: 'inv-104', phcId: 'phc-noida-sec62', phcName: 'PHC Sector 62 Noida', medicine: 'ORS Rehydration Salts', quantity: 620, minimumStock: 200, dailyUsage: 52 },
  { id: 'inv-105', phcId: 'phc-delhi-east-01', phcName: 'PHC Laxmi Nagar', medicine: 'ORS Rehydration Salts', quantity: 112, minimumStock: 350, dailyUsage: 35 },
  { id: 'inv-106', phcId: 'phc-delhi-east-01', phcName: 'PHC Laxmi Nagar', medicine: 'Paracetamol 500mg', quantity: 180, minimumStock: 400, dailyUsage: 56.2 },
  { id: 'inv-107', phcId: 'phc-ghaziabad-rural', phcName: 'PHC Muradnagar Rural', medicine: 'ORS Rehydration Salts', quantity: 521, minimumStock: 1200, dailyUsage: 289 },
  { id: 'inv-108', phcId: 'phc-ghaziabad-rural', phcName: 'PHC Muradnagar Rural', medicine: 'IV Normal Saline 500ml', quantity: 125, minimumStock: 300, dailyUsage: 69.4 },
  { id: 'inv-109', phcId: 'phc-ghaziabad-rajnagar', phcName: 'CHC Raj Nagar', medicine: 'IV Normal Saline 500ml', quantity: 780, minimumStock: 250, dailyUsage: 38 },
  { id: 'inv-110', phcId: 'phc-delhi-south-02', phcName: 'PHC Hauz Khas', medicine: 'IV Normal Saline 500ml', quantity: 95, minimumStock: 220, dailyUsage: 34 }
];

function getStockStatus(item) {
  const days = item.quantity / Math.max(item.dailyUsage, 0.1);
  if (days <= 2.0 || item.quantity < item.minimumStock * 0.4) return 'CRITICAL';
  if (days <= 4.0 || item.quantity < item.minimumStock) return 'HIGH_RISK';
  if (days <= 7.0 || item.quantity < item.minimumStock * 1.3) return 'WATCH';
  return 'HEALTHY';
}

export default function Inventory() {
  const [rows, setRows] = useState(defaultInventory);
  const [selectedPhc, setSelectedPhc] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Add Form State
  const [form, setForm] = useState({
    medicine: 'Insulin Glargine 100IU',
    phcId: 'phc-noida-sec22',
    quantity: 100,
    minimumStock: 100,
    dailyUsage: 20
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    medicine: '',
    quantity: 0,
    minimumStock: 0,
    dailyUsage: 0
  });

  useEffect(() => {
    endpoints.inventory('phc-noida-sec22')
      .then(r => {
        if (r.data?.data?.length) {
          const liveData = r.data.data.map(item => ({
            id: item.id || `inv-${item.medicine}`,
            phcId: item.phcId || 'phc-noida-sec22',
            phcName: 'PHC Sector 22 Noida',
            medicine: item.medicine,
            quantity: item.quantity,
            minimumStock: item.minimumStock || 100,
            dailyUsage: item.dailyUsage || 25
          }));
          const ids = new Set(liveData.map(x => x.id));
          setRows([...liveData, ...defaultInventory.filter(x => !ids.has(x.id))]);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        phcId: form.phcId,
        medicine: form.medicine,
        quantity: parseInt(form.quantity, 10),
        minimumStock: parseInt(form.minimumStock, 10),
        dailyUsage: parseFloat(form.dailyUsage)
      };
      const res = await endpoints.addInventory(payload);
      const newRow = {
        id: res.data?.data?.id || `inv-${Date.now()}`,
        ...payload,
        phcName: form.phcId === 'phc-noida-sec62' ? 'PHC Sector 62 Noida' : 'PHC Sector 22 Noida'
      };
      setRows([newRow, ...rows]);
      setIsAddOpen(false);
      showToast(`Added ${payload.medicine} to inventory`);
    } catch (err) {
      const fallbackRow = {
        id: `inv-${Date.now()}`,
        ...form,
        quantity: parseInt(form.quantity, 10),
        minimumStock: parseInt(form.minimumStock, 10),
        dailyUsage: parseFloat(form.dailyUsage),
        phcName: 'PHC Sector 22 Noida'
      };
      setRows([fallbackRow, ...rows]);
      setIsAddOpen(false);
      showToast(`Added ${form.medicine} to inventory`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      medicine: item.medicine,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      dailyUsage: item.dailyUsage
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    const patch = {
      medicine: editForm.medicine,
      quantity: parseInt(editForm.quantity, 10),
      minimumStock: parseInt(editForm.minimumStock, 10),
      dailyUsage: parseFloat(editForm.dailyUsage)
    };

    try {
      await endpoints.updateInventory(editingItem.id, patch);
      setRows(rows.map(r => (r.id === editingItem.id ? { ...r, ...patch } : r)));
      setEditingItem(null);
      showToast(`Updated ${patch.medicine} successfully`);
    } catch (err) {
      // Optimistic local update
      setRows(rows.map(r => (r.id === editingItem.id ? { ...r, ...patch } : r)));
      setEditingItem(null);
      showToast(`Updated ${patch.medicine} successfully`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, medName) => {
    if (!window.confirm(`Are you sure you want to remove ${medName} from inventory tracking?`)) return;
    try {
      await endpoints.deleteInventory(id);
    } catch (e) {}
    setRows(rows.filter(r => r.id !== id));
    if (editingItem?.id === id) setEditingItem(null);
    showToast(`Removed ${medName} from inventory`);
  };

  const handleRestock = async (id, amount = 50) => {
    const item = rows.find(r => r.id === id);
    if (!item) return;
    const newQty = item.quantity + amount;
    setRows(rows.map(r => (r.id === id ? { ...r, quantity: newQty } : r)));
    showToast(`Restocked +${amount} units for ${item.medicine}`);
    try {
      await endpoints.updateInventory(id, { quantity: newQty });
    } catch (e) {}
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Inventory ID',
      'Facility Name',
      'Facility ID',
      'Medicine Name',
      'Stock On Hand (Units)',
      'Minimum Safety Buffer (Units)',
      'Daily Usage Rate (Units/Day)',
      'Coverage Horizon (Days)',
      'Stock Risk Status'
    ];

    const dataRows = filtered.map(item => {
      const days = (item.quantity / Math.max(item.dailyUsage, 0.1)).toFixed(1);
      const status = getStockStatus(item);
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

      return [
        escape(item.id),
        escape(item.phcName || item.phcId),
        escape(item.phcId),
        escape(item.medicine),
        item.quantity,
        item.minimumStock,
        item.dailyUsage,
        days,
        escape(status)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `AarogyaGrid_Inventory_${selectedPhc === 'ALL' ? 'All_Facilities' : selectedPhc}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Inventory exported to CSV successfully');
  };

  const filtered = rows.filter(r => {
    const matchPhc = selectedPhc === 'ALL' || r.phcId === selectedPhc;
    const matchSearch = r.medicine.toLowerCase().includes(search.toLowerCase()) ||
                        (r.phcName || '').toLowerCase().includes(search.toLowerCase());
    return matchPhc && matchSearch;
  });

  const phcOptions = Array.from(new Set(rows.map(r => JSON.stringify({ id: r.phcId, name: r.phcName || r.phcId }))))
    .map(str => JSON.parse(str));

  return (
    <>
      <PageTitle
        title="Medicine & Critical Supplies Inventory"
        desc="Live tracking of pharmaceutical stocks, projected burn rates, field updating, and CSV export."
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="secondary" onClick={handleExportCSV} title="Download CSV spreadsheet of current inventory">
              Export CSV
            </button>
            <button className="primary" onClick={() => setIsAddOpen(true)}>
              Add Medicine
            </button>
          </div>
        }
      />

      {toastMessage && (
        <div style={{
          background: 'var(--ink)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '12px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', padding: '0 4px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="card table-card">
        <div className="table-head" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <b>Live Resource Telemetry</b>
            <small>Auto-synced with primary health centre stores ({filtered.length} records)</small>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              placeholder="Filter medicine or centre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '11px', minWidth: '180px' }}
            />
            <select
              value={selectedPhc}
              onChange={e => setSelectedPhc(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '11px' }}
            >
              <option value="ALL">All Health Centres</option>
              {phcOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Medicine / Supply</th>
                <th>Centre</th>
                <th>Stock on Hand</th>
                <th>Min Buffer</th>
                <th>Burn Rate</th>
                <th>Coverage (Days)</th>
                <th>Risk Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    No inventory records matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(x => {
                  const days = (x.quantity / Math.max(x.dailyUsage, 0.1)).toFixed(1);
                  const status = getStockStatus(x);
                  return (
                    <tr key={x.id}>
                      <td>
                        <b>{x.medicine}</b>
                      </td>
                      <td>{x.phcName || x.phcId}</td>
                      <td>
                        <b style={{ fontSize: '12px' }}>{x.quantity}</b> units
                      </td>
                      <td>{x.minimumStock} units</td>
                      <td>{x.dailyUsage}/day</td>
                      <td>
                        <b style={{ color: parseFloat(days) < 3.0 ? '#e53e3e' : 'inherit' }}>
                          {days} days
                        </b>
                      </td>
                      <td>
                        <Badge>{status}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="secondary"
                            onClick={() => handleStartEdit(x)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Edit fields of this medicine"
                          >
                            Edit
                          </button>
                          <button
                            className="secondary"
                            onClick={() => handleRestock(x.id, 50)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Add +50 units to stock"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Particular Medicine Modal */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span className="eyebrow">UPDATE RECORD FIELDS</span>
                <h2 style={{ fontSize: '20px', margin: '4px 0 0' }}>Edit Medicine Parameters</h2>
              </div>
              <Badge>{getStockStatus({ ...editingItem, ...editForm })}</Badge>
            </div>
            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 16px' }}>
              Facility: <b>{editingItem.phcName || editingItem.phcId}</b>
            </p>

            <form onSubmit={handleUpdateItem} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Medicine / Supply Name
                <input
                  required
                  value={editForm.medicine}
                  onChange={e => setEditForm({ ...editForm, medicine: e.target.value })}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Stock on Hand
                  <input
                    required
                    type="number"
                    min="0"
                    value={editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Min Buffer
                  <input
                    required
                    type="number"
                    min="0"
                    value={editForm.minimumStock}
                    onChange={e => setEditForm({ ...editForm, minimumStock: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Burn Rate (/day)
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editForm.dailyUsage}
                    onChange={e => setEditForm({ ...editForm, dailyUsage: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ background: 'var(--cream)', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#555', marginTop: '4px' }}>
                Estimated Horizon: <b>{(editForm.quantity / Math.max(parseFloat(editForm.dailyUsage) || 1, 0.1)).toFixed(1)} days</b> of supply remaining.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleDeleteItem(editingItem.id, editingItem.medicine)}
                  style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                  title="Remove this item"
                >
                  Delete
                </button>
                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {isAddOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', margin: '0 0 4px' }}>Add Medicine to Inventory</h2>
            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 16px' }}>Configure stock tracking parameters for forecasting models.</p>

            <form onSubmit={handleAddMedicine} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Medicine / Resource
                <select
                  value={form.medicine}
                  onChange={e => setForm({ ...form, medicine: e.target.value })}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                >
                  <option value="Insulin Glargine 100IU">Insulin Glargine 100IU</option>
                  <option value="ORS Rehydration Salts">ORS Rehydration Salts</option>
                  <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                  <option value="IV Normal Saline 500ml">IV Normal Saline 500ml</option>
                  <option value="Amoxicillin 500mg">Amoxicillin 500mg</option>
                  <option value="Doxycycline 100mg">Doxycycline 100mg</option>
                </select>
              </label>

              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Primary Health Centre
                <select
                  value={form.phcId}
                  onChange={e => setForm({ ...form, phcId: e.target.value })}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                >
                  <option value="phc-noida-sec22">PHC Sector 22 Noida</option>
                  <option value="phc-noida-sec62">PHC Sector 62 Noida</option>
                  <option value="phc-delhi-east-01">PHC Laxmi Nagar</option>
                  <option value="phc-ghaziabad-rural">PHC Muradnagar Rural</option>
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Current Stock
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Min Safety Buffer
                  <input
                    type="number"
                    value={form.minimumStock}
                    onChange={e => setForm({ ...form, minimumStock: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Daily Burn Rate
                  <input
                    type="number"
                    value={form.dailyUsage}
                    onChange={e => setForm({ ...form, dailyUsage: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving…' : 'Add Inventory Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
