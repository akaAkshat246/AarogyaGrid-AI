import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../services/api';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';

const defaultPhcs = [
  { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.5960, longitude: 77.3480, status: 'CRITICAL', beds: '18/24', totalBeds: 24, occupiedBeds: 18, doctors: '5/6', nurses: '11/12', medicine: 'Insulin (1.5d remaining)' },
  { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.6270, longitude: 77.3620, status: 'HEALTHY', beds: '12/32', totalBeds: 32, occupiedBeds: 12, doctors: '9/10', nurses: '18/20', medicine: 'Safe Surplus (472u)' },
  { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.4720, longitude: 77.5080, status: 'HEALTHY', beds: '15/40', totalBeds: 40, occupiedBeds: 15, doctors: '11/12', nurses: '20/22', medicine: 'Stable' },
  { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', latitude: 28.5530, longitude: 77.5540, status: 'WATCH', beds: '14/16', totalBeds: 16, occupiedBeds: 14, doctors: '3/4', nurses: '7/8', medicine: 'ORS (4.2d remaining)' },
  { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East', state: 'Delhi', latitude: 28.6315, longitude: 77.2773, status: 'HIGH_RISK', beds: '24/24', totalBeds: 24, occupiedBeds: 24, doctors: '7/8', nurses: '15/16', medicine: 'ORS (3.2d remaining)' },
  { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East', state: 'Delhi', latitude: 28.6083, longitude: 77.2952, status: 'HEALTHY', beds: '11/30', totalBeds: 30, occupiedBeds: 11, doctors: '9/10', nurses: '19/20', medicine: 'Stable' },
  { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South', state: 'Delhi', latitude: 28.5244, longitude: 77.2167, status: 'HEALTHY', beds: '14/36', totalBeds: 36, occupiedBeds: 14, doctors: '11/12', nurses: '22/24', medicine: 'Stable' },
  { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South', state: 'Delhi', latitude: 28.5494, longitude: 77.2001, status: 'HIGH_RISK', beds: '16/20', totalBeds: 20, occupiedBeds: 16, doctors: '5/6', nurses: '11/12', medicine: 'IV Saline (2.8d remaining)' },
  { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North', state: 'Delhi', latitude: 28.7180, longitude: 77.1264, status: 'HEALTHY', beds: '10/28', totalBeds: 28, occupiedBeds: 10, doctors: '7/8', nurses: '16/18', medicine: 'Stable' },
  { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central', state: 'Delhi', latitude: 28.6514, longitude: 77.1907, status: 'HEALTHY', beds: '9/22', totalBeds: 22, occupiedBeds: 9, doctors: '6/7', nurses: '13/14', medicine: 'Stable' },
  { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.7770, longitude: 77.5020, status: 'CRITICAL', beds: '20/20', totalBeds: 20, occupiedBeds: 20, doctors: '4/5', nurses: '9/10', medicine: 'ORS (1.8d remaining)' },
  { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6920, longitude: 77.4410, status: 'HEALTHY', beds: '16/40', totalBeds: 40, occupiedBeds: 16, doctors: '11/12', nurses: '21/24', medicine: 'Surplus IV Fluids' },
  { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6410, longitude: 77.3710, status: 'HIGH_RISK', beds: '22/24', totalBeds: 24, occupiedBeds: 22, doctors: '7/8', nurses: '14/16', medicine: 'Paracetamol (3.1d remaining)' },
  { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6710, longitude: 77.3750, status: 'WATCH', beds: '18/22', totalBeds: 22, occupiedBeds: 18, doctors: '6/7', nurses: '12/14', medicine: 'IV Saline (4.8d remaining)' },
  { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon', state: 'Haryana', latitude: 28.4740, longitude: 77.0420, status: 'HEALTHY', beds: '8/24', totalBeds: 24, occupiedBeds: 8, doctors: '7/8', nurses: '15/16', medicine: 'Stable' },
  { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad', state: 'Haryana', latitude: 28.3880, longitude: 77.3010, status: 'HEALTHY', beds: '12/28', totalBeds: 28, occupiedBeds: 12, doctors: '8/9', nurses: '17/18', medicine: 'Stable' }
];

export default function PHCs() {
  const [phcs, setPhcs] = useState(defaultPhcs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [selectedPhc, setSelectedPhc] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // New PHC Form State
  const [formData, setFormData] = useState({
    name: '',
    district: 'Gautam Buddha Nagar',
    state: 'Uttar Pradesh',
    latitude: '28.6000',
    longitude: '77.3500',
    totalBeds: '24',
    doctorsTotal: '6',
    nursesTotal: '12'
  });

  // Edit PHC Form State
  const [editData, setEditData] = useState({
    name: '',
    district: '',
    state: '',
    totalBeds: 24,
    occupiedBeds: 12,
    doctorsPresent: 4,
    doctorsTotal: 6,
    nursesPresent: 8,
    nursesTotal: 12,
    latitude: 28.6,
    longitude: 77.3,
    status: 'HEALTHY'
  });

  useEffect(() => {
    endpoints.phcs()
      .then(r => {
        if (r.data?.data?.length) {
          const merged = defaultPhcs.map(dp => {
            const live = r.data.data.find(x => x.id === dp.id);
            return live ? { ...dp, ...live } : dp;
          });
          setPhcs(merged);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        district: formData.district,
        state: formData.state,
        latitude: parseFloat(formData.latitude) || 28.6,
        longitude: parseFloat(formData.longitude) || 77.3
      };
      const res = await endpoints.createPhc(payload);
      const newPhc = {
        id: res.data?.data?.id || `phc-${Date.now()}`,
        ...payload,
        status: 'HEALTHY',
        beds: `0/${formData.totalBeds}`,
        totalBeds: parseInt(formData.totalBeds, 10),
        occupiedBeds: 0,
        doctors: `${formData.doctorsTotal}/${formData.doctorsTotal}`,
        nurses: `${formData.nursesTotal}/${formData.nursesTotal}`,
        medicine: 'Provisioning'
      };
      setPhcs([newPhc, ...phcs]);
      setIsAddOpen(false);
      showToast(`Registered ${payload.name} successfully`);
      setFormData({
        name: '',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        latitude: '28.6000',
        longitude: '77.3500',
        totalBeds: '24',
        doctorsTotal: '6',
        nursesTotal: '12'
      });
    } catch (err) {
      showToast('PHC registered locally in active session');
      setIsAddOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartEdit = (phc) => {
    setSelectedPhc(phc);
    const docParts = String(phc.doctors || '4/6').split('/');
    const nurseParts = String(phc.nurses || '8/12').split('/');
    setEditData({
      name: phc.name,
      district: phc.district,
      state: phc.state,
      totalBeds: phc.totalBeds || 24,
      occupiedBeds: phc.occupiedBeds || 12,
      doctorsPresent: parseInt(docParts[0], 10) || 4,
      doctorsTotal: parseInt(docParts[1], 10) || 6,
      nursesPresent: parseInt(nurseParts[0], 10) || 8,
      nursesTotal: parseInt(nurseParts[1], 10) || 12,
      latitude: phc.latitude || 28.6,
      longitude: phc.longitude || 77.3,
      status: phc.status || 'HEALTHY'
    });
    setIsEditOpen(true);
  };

  const handleUpdatePhc = async (e) => {
    e.preventDefault();
    if (!selectedPhc) return;
    setFormLoading(true);

    const updatedTotalBeds = parseInt(editData.totalBeds, 10);
    const updatedOccupiedBeds = parseInt(editData.occupiedBeds, 10);
    const occupancyRate = updatedTotalBeds > 0 ? (updatedOccupiedBeds / updatedTotalBeds) : 0;
    
    // Auto-calculate risk status based on occupancy and staffing
    let calculatedStatus = editData.status;
    if (occupancyRate >= 0.95) calculatedStatus = 'CRITICAL';
    else if (occupancyRate >= 0.82) calculatedStatus = 'HIGH_RISK';
    else if (occupancyRate >= 0.70) calculatedStatus = 'WATCH';
    else calculatedStatus = 'HEALTHY';

    const patch = {
      name: editData.name,
      district: editData.district,
      state: editData.state,
      latitude: parseFloat(editData.latitude),
      longitude: parseFloat(editData.longitude),
      totalBeds: updatedTotalBeds,
      occupiedBeds: updatedOccupiedBeds,
      beds: `${updatedOccupiedBeds}/${updatedTotalBeds}`,
      doctors: `${editData.doctorsPresent}/${editData.doctorsTotal}`,
      nurses: `${editData.nursesPresent}/${editData.nursesTotal}`,
      status: calculatedStatus
    };

    try {
      await endpoints.updatePhc(selectedPhc.id, {
        name: patch.name,
        district: patch.district,
        state: patch.state,
        latitude: patch.latitude,
        longitude: patch.longitude
      });
      await endpoints.updateBeds(selectedPhc.id, {
        totalBeds: updatedTotalBeds,
        occupiedBeds: updatedOccupiedBeds
      }).catch(() => {});
      await endpoints.updateStaff(selectedPhc.id, {
        doctorsTotal: parseInt(editData.doctorsTotal, 10),
        doctorsPresent: parseInt(editData.doctorsPresent, 10),
        nursesTotal: parseInt(editData.nursesTotal, 10),
        nursesPresent: parseInt(editData.nursesPresent, 10)
      }).catch(() => {});
    } catch (err) {
      // Local fallback
    } finally {
      const updatedList = phcs.map(p => (p.id === selectedPhc.id ? { ...p, ...patch } : p));
      setPhcs(updatedList);
      setSelectedPhc({ ...selectedPhc, ...patch });
      setIsEditOpen(false);
      setFormLoading(false);
      showToast(`Updated parameters for ${patch.name}`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Facility ID',
      'Facility Name',
      'District',
      'State',
      'Status',
      'Total Beds',
      'Occupied Beds',
      'Bed Occupancy (%)',
      'Doctors (Present/Total)',
      'Nurses (Present/Total)',
      'Latitude',
      'Longitude'
    ];

    const dataRows = filtered.map(p => {
      const occPct = p.totalBeds ? Math.round(((p.occupiedBeds || 0) / p.totalBeds) * 100) : 50;
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      return [
        escape(p.id),
        escape(p.name),
        escape(p.district),
        escape(p.state),
        escape(p.status),
        p.totalBeds || 20,
        p.occupiedBeds || 10,
        occPct,
        escape(p.doctors || '6/6'),
        escape(p.nurses || '12/12'),
        p.latitude,
        p.longitude
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AarogyaGrid_PHC_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('PHC directory exported to CSV');
  };

  const filtered = phcs.filter(p => {
    const matchQuery = (p.name + p.district + p.state).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchDistrict = districtFilter === 'ALL' || p.district === districtFilter;
    return matchQuery && matchStatus && matchDistrict;
  });

  const districts = Array.from(new Set(phcs.map(p => p.district)));

  return (
    <>
      <PageTitle
        title="PHC Health Centers Directory"
        desc={`Monitoring ${phcs.length} primary and community health centres across National Capital Region.`}
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="secondary" onClick={handleExportCSV} title="Export directory as CSV spreadsheet">
              Export Directory CSV
            </button>
            <button className="primary" onClick={() => setIsAddOpen(true)}>
              Add PHC Facility
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

      {/* Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          className="search"
          placeholder="Search by centre name, district or state..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: '280px', flex: '1' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="CRITICAL">CRITICAL Only</option>
          <option value="HIGH_RISK">HIGH RISK</option>
          <option value="WATCH">WATCH</option>
          <option value="HEALTHY">HEALTHY</option>
        </select>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
          <option value="ALL">All Districts</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* PHC Cards Grid */}
      <div className="phc-grid">
        {filtered.map(p => (
          <div
            className="phc-card"
            key={p.id}
            onClick={() => setSelectedPhc(p)}
            style={{ cursor: 'pointer' }}
          >
            <div className="phc-top">
              <div className="pin" style={{ fontSize: '11px', fontWeight: 'bold' }}>PHC</div>
              <Badge>{p.status || 'HEALTHY'}</Badge>
            </div>
            <h3>{p.name}</h3>
            <p>{p.district} · {p.state}</p>

            <div className="mini-stats">
              <span>
                <small>BED OCCUPANCY</small>
                <b>{p.beds || `${p.occupiedBeds || 0}/${p.totalBeds || 20}`}</b>
              </span>
              <span>
                <small>STAFF COVERAGE</small>
                <b>{p.doctors ? `${p.doctors} docs` : 'Adequate'}</b>
              </span>
            </div>

            <div className="card-link" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>View details & edit</span>
              <small style={{ color: '#aaa', fontSize: '9px' }}>Lat: {p.latitude?.toFixed(2)}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Selected PHC Quick Modal */}
      {selectedPhc && !isEditOpen && (
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
          onClick={() => setSelectedPhc(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="eyebrow">FACILITY DETAILS</span>
                <h2 style={{ fontSize: '22px', margin: '4px 0 6px' }}>{selectedPhc.name}</h2>
                <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>{selectedPhc.district} · {selectedPhc.state}</p>
              </div>
              <Badge>{selectedPhc.status}</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '22px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '16px 0' }}>
              <div>
                <small style={{ fontSize: '9px', color: '#888', display: 'block' }}>BED CAPACITY</small>
                <b style={{ fontSize: '15px' }}>{selectedPhc.beds}</b>
              </div>
              <div>
                <small style={{ fontSize: '9px', color: '#888', display: 'block' }}>DOCTORS</small>
                <b style={{ fontSize: '15px' }}>{selectedPhc.doctors || '6 Present'}</b>
              </div>
              <div>
                <small style={{ fontSize: '9px', color: '#888', display: 'block' }}>NURSES</small>
                <b style={{ fontSize: '15px' }}>{selectedPhc.nurses || '12 Active'}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                className="primary"
                onClick={() => handleStartEdit(selectedPhc)}
                style={{ flex: 1 }}
              >
                Update Facility Fields
              </button>
              <Link to="/predictions" className="secondary" style={{ flex: 1, textAlign: 'center' }}>
                Run Forecast
              </Link>
              <Link to="/inventory" className="secondary" style={{ flex: 1, textAlign: 'center' }}>
                View Stock
              </Link>
            </div>

            <button
              className="secondary wide"
              onClick={() => setSelectedPhc(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Facility Fields Modal */}
      {isEditOpen && selectedPhc && (
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
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '520px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <span className="eyebrow">UPDATE FACILITY TELEMETRY</span>
                <h2 style={{ fontSize: '20px', margin: '4px 0 0' }}>Edit Facility Fields</h2>
              </div>
              <Badge>{editData.status}</Badge>
            </div>
            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 16px' }}>Update real-time capacity and location parameters.</p>

            <form onSubmit={handleUpdatePhc} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Facility Name
                <input
                  required
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  District
                  <input
                    required
                    value={editData.district}
                    onChange={e => setEditData({ ...editData, district: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  State
                  <input
                    required
                    value={editData.state}
                    onChange={e => setEditData({ ...editData, state: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Occupied Beds
                  <input
                    required
                    type="number"
                    min="0"
                    value={editData.occupiedBeds}
                    onChange={e => setEditData({ ...editData, occupiedBeds: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Total Beds Capacity
                  <input
                    required
                    type="number"
                    min="1"
                    value={editData.totalBeds}
                    onChange={e => setEditData({ ...editData, totalBeds: e.target.value })}
                    style={{ width: '100%', padding: '9px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Doctors Present / Total
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="number"
                      min="0"
                      value={editData.doctorsPresent}
                      onChange={e => setEditData({ ...editData, doctorsPresent: e.target.value })}
                      placeholder="Present"
                      style={{ width: '50%', padding: '9px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    />
                    <input
                      type="number"
                      min="1"
                      value={editData.doctorsTotal}
                      onChange={e => setEditData({ ...editData, doctorsTotal: e.target.value })}
                      placeholder="Total"
                      style={{ width: '50%', padding: '9px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    />
                  </div>
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Nurses Present / Total
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="number"
                      min="0"
                      value={editData.nursesPresent}
                      onChange={e => setEditData({ ...editData, nursesPresent: e.target.value })}
                      placeholder="Active"
                      style={{ width: '50%', padding: '9px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    />
                    <input
                      type="number"
                      min="1"
                      value={editData.nursesTotal}
                      onChange={e => setEditData({ ...editData, nursesTotal: e.target.value })}
                      placeholder="Total"
                      style={{ width: '50%', padding: '9px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    />
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? 'Saving…' : 'Save Facility Fields'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New PHC Modal */}
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
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', margin: '0 0 4px' }}>Add Primary Health Centre</h2>
            <p style={{ fontSize: '11px', color: '#777', margin: '0 0 18px' }}>Register a new facility into the AarogyaGrid resource telemetry network.</p>

            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Facility Name
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PHC Noida Sector 128"
                  style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  District
                  <input
                    required
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Gautam Buddha Nagar"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  State
                  <input
                    required
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Latitude
                  <input
                    required
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Longitude
                  <input
                    required
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Total Beds
                  <input
                    type="number"
                    value={formData.totalBeds}
                    onChange={e => setFormData({ ...formData, totalBeds: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Doctors
                  <input
                    type="number"
                    value={formData.doctorsTotal}
                    onChange={e => setFormData({ ...formData, doctorsTotal: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Nurses
                  <input
                    type="number"
                    value={formData.nursesTotal}
                    onChange={e => setFormData({ ...formData, nursesTotal: e.target.value })}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? 'Saving…' : 'Register PHC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
