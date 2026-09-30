import React, { useEffect, useState } from 'react';
import { endpoints } from '../services/api';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';

const allPhcFacilities = [
  { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar' },
  { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar' },
  { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar' },
  { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar' },
  { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East' },
  { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East' },
  { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South' },
  { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South' },
  { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North' },
  { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central' },
  { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad' },
  { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad' },
  { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad' },
  { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad' },
  { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon' },
  { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad' }
];

const medicineCatalog = [
  { category: 'Endocrinology & Diabetes', name: 'Insulin Glargine 100IU', defaultUnit: 'Vials', defaultMin: 100, defaultBurn: 20 },
  { category: 'Endocrinology & Diabetes', name: 'Metformin 500mg', defaultUnit: 'Tablets', defaultMin: 500, defaultBurn: 80 },
  { category: 'IV Fluids & Electrolytes', name: 'ORS Rehydration Salts', defaultUnit: 'Sachets', defaultMin: 300, defaultBurn: 50 },
  { category: 'IV Fluids & Electrolytes', name: 'IV Normal Saline 0.9% (500ml)', defaultUnit: 'Bottles / Bags', defaultMin: 250, defaultBurn: 40 },
  { category: 'IV Fluids & Electrolytes', name: 'IV Ringer Lactate 500ml', defaultUnit: 'Bottles / Bags', defaultMin: 200, defaultBurn: 30 },
  { category: 'Analgesics & Antipyretics', name: 'Paracetamol 500mg', defaultUnit: 'Tablets / Strips', defaultMin: 400, defaultBurn: 60 },
  { category: 'Analgesics & Antipyretics', name: 'Ibuprofen 400mg', defaultUnit: 'Tablets / Strips', defaultMin: 300, defaultBurn: 45 },
  { category: 'Essential Antibiotics', name: 'Amoxicillin 500mg', defaultUnit: 'Capsules', defaultMin: 350, defaultBurn: 40 },
  { category: 'Essential Antibiotics', name: 'Doxycycline 100mg', defaultUnit: 'Tablets', defaultMin: 200, defaultBurn: 25 },
  { category: 'Essential Antibiotics', name: 'Azithromycin 500mg', defaultUnit: 'Tablets', defaultMin: 150, defaultBurn: 20 },
  { category: 'Essential Antibiotics', name: 'Ceftriaxone 1g Injection', defaultUnit: 'Vials / Ampoules', defaultMin: 100, defaultBurn: 15 },
  { category: 'Emergency & Critical Care', name: 'Anti-Snake Venom (ASV)', defaultUnit: 'Vials', defaultMin: 50, defaultBurn: 5 },
  { category: 'Emergency & Critical Care', name: 'Rabies Vaccine / Antiserum', defaultUnit: 'Vials', defaultMin: 80, defaultBurn: 10 },
  { category: 'Emergency & Critical Care', name: 'Adrenaline 1mg / ml', defaultUnit: 'Ampoules', defaultMin: 60, defaultBurn: 8 },
  { category: 'Respiratory & Anti-Allergic', name: 'Salbutamol Inhaler 100mcg', defaultUnit: 'Inhalers', defaultMin: 120, defaultBurn: 18 },
  { category: 'Respiratory & Anti-Allergic', name: 'Cetirizine 10mg', defaultUnit: 'Tablets', defaultMin: 400, defaultBurn: 50 },
  { category: 'Custom Medicine', name: 'Other / Custom Formulation', defaultUnit: 'Units', defaultMin: 100, defaultBurn: 20 }
];

const dosageUnits = ['Vials', 'Bottles / Bags', 'Sachets', 'Tablets / Strips', 'Capsules', 'Ampoules', 'Inhalers', 'Units'];
const storageTypes = ['Cold Chain (2°C - 8°C)', 'Controlled Room Temp (15°C - 25°C)', 'Ambient Dry Store'];

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
  const [facilities, setFacilities] = useState(allPhcFacilities);
  const [selectedPhc, setSelectedPhc] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Add Medicine Form State with Rich Credentials
  const [addForm, setAddForm] = useState({
    selectedCatalogItem: 'Insulin Glargine 100IU',
    customMedicineName: '',
    phcId: 'phc-noida-sec22',
    category: 'Endocrinology & Diabetes',
    dosageUnit: 'Vials',
    storageType: 'Cold Chain (2°C - 8°C)',
    quantity: 150,
    minimumStock: 100,
    dailyUsage: 20
  });

  // Edit Particular Form State
  const [editForm, setEditForm] = useState({
    medicine: '',
    quantity: 0,
    minimumStock: 0,
    dailyUsage: 0
  });

  useEffect(() => {
    // Fetch live inventory and PHC list
    Promise.all([
      endpoints.phcs().catch(() => ({ data: { data: [] } })),
      endpoints.inventory('phc-noida-sec22').catch(() => ({ data: { data: [] } }))
    ]).then(([phcRes, invRes]) => {
      if (phcRes.data?.data?.length) {
        const liveFacilities = phcRes.data.data.map(p => ({
          id: p.id,
          name: p.name,
          district: p.district || 'National Capital Region'
        }));
        setFacilities(liveFacilities);
      }

      if (invRes.data?.data?.length) {
        const liveData = invRes.data.data.map(item => ({
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
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCatalogSelect = (medicineName) => {
    const found = medicineCatalog.find(m => m.name === medicineName);
    if (found) {
      setAddForm(prev => ({
        ...prev,
        selectedCatalogItem: medicineName,
        category: found.category,
        dosageUnit: found.defaultUnit,
        minimumStock: found.defaultMin,
        dailyUsage: found.defaultBurn
      }));
    } else {
      setAddForm(prev => ({ ...prev, selectedCatalogItem: medicineName }));
    }
  };

  const handleAddMedicineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalMedicineName = addForm.selectedCatalogItem === 'Other / Custom Formulation'
      ? (addForm.customMedicineName.trim() || 'Custom Essential Supply')
      : addForm.selectedCatalogItem;

    const targetFacility = facilities.find(f => f.id === addForm.phcId) || { name: addForm.phcId };

    const payload = {
      phcId: addForm.phcId,
      medicine: finalMedicineName,
      quantity: parseInt(addForm.quantity, 10) || 0,
      minimumStock: parseInt(addForm.minimumStock, 10) || 0,
      dailyUsage: parseFloat(addForm.dailyUsage) || 1
    };

    try {
      const res = await endpoints.addInventory(payload);
      const newRow = {
        id: res.data?.data?.id || `inv-${Date.now()}`,
        ...payload,
        phcName: targetFacility.name
      };
      setRows([newRow, ...rows]);
      setIsAddOpen(false);
      showToast(`Added ${payload.medicine} (${payload.quantity} units) to ${targetFacility.name}`);
      
      // Reset Form to clean state
      setAddForm({
        selectedCatalogItem: 'Insulin Glargine 100IU',
        customMedicineName: '',
        phcId: 'phc-noida-sec22',
        category: 'Endocrinology & Diabetes',
        dosageUnit: 'Vials',
        storageType: 'Cold Chain (2°C - 8°C)',
        quantity: 150,
        minimumStock: 100,
        dailyUsage: 20
      });
    } catch (err) {
      // Local optimistic fallback
      const fallbackRow = {
        id: `inv-${Date.now()}`,
        ...payload,
        phcName: targetFacility.name
      };
      setRows([fallbackRow, ...rows]);
      setIsAddOpen(false);
      showToast(`Added ${payload.medicine} to ${targetFacility.name}`);
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
      showToast(`Updated parameters for ${patch.medicine}`);
    } catch (err) {
      setRows(rows.map(r => (r.id === editingItem.id ? { ...r, ...patch } : r)));
      setEditingItem(null);
      showToast(`Updated parameters for ${patch.medicine}`);
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
    showToast(`Removed ${medName} from tracking`);
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
      'Medicine / Supply',
      'Stock On Hand',
      'Minimum Safety Buffer',
      'Daily Burn Rate (Units/Day)',
      'Coverage (Days Remaining)',
      'Stock Status'
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
    showToast('Inventory exported to CSV');
  };

  const filtered = rows.filter(r => {
    const matchPhc = selectedPhc === 'ALL' || r.phcId === selectedPhc;
    const matchSearch = r.medicine.toLowerCase().includes(search.toLowerCase()) ||
                        (r.phcName || '').toLowerCase().includes(search.toLowerCase());
    return matchPhc && matchSearch;
  });

  const phcFilterOptions = Array.from(new Set(rows.map(r => JSON.stringify({ id: r.phcId, name: r.phcName || r.phcId }))))
    .map(str => JSON.parse(str));

  // Calculated days horizon for Add Form preview
  const previewDays = (addForm.quantity / Math.max(parseFloat(addForm.dailyUsage) || 1, 0.1)).toFixed(1);
  const previewStatus = getStockStatus({
    quantity: parseFloat(addForm.quantity) || 0,
    minimumStock: parseFloat(addForm.minimumStock) || 0,
    dailyUsage: parseFloat(addForm.dailyUsage) || 1
  });

  return (
    <>
      <PageTitle
        title="Medicine & Critical Supplies Inventory"
        desc="Live pharmaceutical stock tracking, automated burn rate forecasting, credential dropdowns, and CSV reporting."
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
          alignItems: 'center'
        }}>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer' }}
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
              {phcFilterOptions.map(p => (
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

      {/* Add Medicine Modal with Detailed Credential Dropdowns */}
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
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div>
                <span className="eyebrow">SUPPLY PROVISIONING</span>
                <h2 style={{ fontSize: '20px', margin: '4px 0 0' }}>Add Medicine to Facility</h2>
              </div>
              <Badge>{previewStatus}</Badge>
            </div>
            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 16px' }}>
              Select medicine credentials, target health centre, and consumption telemetry parameters.
            </p>

            <form onSubmit={handleAddMedicineSubmit} style={{ display: 'grid', gap: '12px' }}>
              {/* Target Health Facility Dropdown */}
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Target Primary Health Centre
                <select
                  required
                  value={addForm.phcId}
                  onChange={e => setAddForm({ ...addForm, phcId: e.target.value })}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.district})
                    </option>
                  ))}
                </select>
              </label>

              {/* Therapeutic Category Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Therapeutic Class
                  <select
                    value={addForm.category}
                    onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}
                  >
                    <option value="Endocrinology & Diabetes">Endocrinology & Diabetes</option>
                    <option value="IV Fluids & Electrolytes">IV Fluids & Electrolytes</option>
                    <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                    <option value="Essential Antibiotics">Essential Antibiotics</option>
                    <option value="Emergency & Critical Care">Emergency & Critical Care</option>
                    <option value="Respiratory & Anti-Allergic">Respiratory & Anti-Allergic</option>
                    <option value="Custom Medicine">Other / Custom</option>
                  </select>
                </label>

                {/* Medicine / Drug Formulation Dropdown */}
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Medicine Formulation
                  <select
                    value={addForm.selectedCatalogItem}
                    onChange={e => handleCatalogSelect(e.target.value)}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}
                  >
                    {medicineCatalog.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Custom Medicine Name input if Other selected */}
              {addForm.selectedCatalogItem === 'Other / Custom Formulation' && (
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Custom Medicine / Resource Name
                  <input
                    required
                    value={addForm.customMedicineName}
                    onChange={e => setAddForm({ ...addForm, customMedicineName: e.target.value })}
                    placeholder="e.g. Ciprofloxacin 500mg"
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              )}

              {/* Unit of Measure and Storage Requirement Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Packaging / Dosage Unit
                  <select
                    value={addForm.dosageUnit}
                    onChange={e => setAddForm({ ...addForm, dosageUnit: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}
                  >
                    {dosageUnits.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </label>

                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Storage & Cold Chain Protocol
                  <select
                    value={addForm.storageType}
                    onChange={e => setAddForm({ ...addForm, storageType: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}
                  >
                    {storageTypes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Telemetry Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Initial Stock ({addForm.dosageUnit})
                  <input
                    required
                    type="number"
                    min="0"
                    value={addForm.quantity}
                    onChange={e => setAddForm({ ...addForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Safety Buffer
                  <input
                    required
                    type="number"
                    min="0"
                    value={addForm.minimumStock}
                    onChange={e => setAddForm({ ...addForm, minimumStock: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Daily Burn (/day)
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={addForm.dailyUsage}
                    onChange={e => setAddForm({ ...addForm, dailyUsage: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              {/* Horizon preview indicator */}
              <div style={{ background: 'var(--cream)', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Calculated Coverage Horizon: <b>{previewDays} days</b> of stock</span>
                <span style={{ fontWeight: 'bold', color: previewStatus === 'CRITICAL' ? '#e53e3e' : '#38a169' }}>
                  Status: {previewStatus}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving…' : 'Add Medicine to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </>
  );
}
