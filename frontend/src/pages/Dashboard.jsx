import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { endpoints } from '../services/api';
import Kpi from '../components/Kpi';
import Badge from '../components/Badge';
import PageTitle from '../components/PageTitle';

const defaultDashboardData = {
  phcs: 16,
  totalPatients: 1840,
  availableBeds: 112,
  doctorsPresent: 128,
  medicineShortages: 3,
  activeAlerts: 2,
  pendingTransfers: 2,
  occupiedBeds: 300
};

const chart = [
  { day: 'Today', stock: 38, demand: 29 },
  { day: 'Day 2', stock: 9, demand: 31 },
  { day: 'Day 3', stock: 0, demand: 34 },
  { day: 'Day 4', stock: 0, demand: 30 },
  { day: 'Day 5', stock: 0, demand: 33 },
  { day: 'Day 6', stock: 0, demand: 36 },
  { day: 'Day 7', stock: 0, demand: 38 }
];

export default function Dashboard() {
  const [data, setData] = useState(defaultDashboardData);

  useEffect(() => {
    endpoints.dashboard()
      .then(r => setData({ ...defaultDashboardData, ...r.data?.data }))
      .catch(() => {});
  }, []);

  return (
    <>
      <PageTitle
        title="Network Overview"
        desc="Real-time resource telemetry and risk detection across your connected primary health facilities."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="icon-btn"
              onClick={() => {
                import('../services/pdfReportGenerator').then(m => {
                  m.generateDistrictAuditPdf({
                    district: 'Delhi-NCR Central Hub',
                    generatedBy: 'District Health Administrator'
                  });
                });
              }}
              style={{ fontWeight: 'bold' }}
            >
              Export PDF Audit
            </button>
            <Link className="primary" to="/predictions">
              Run AI Forecast
            </Link>
          </div>
        }
      />

      <div className="kpi-grid">
        <Kpi label="Patients Today" value={data.totalPatients?.toLocaleString()} sub="Across 16 centres" icon="PT" />
        <Kpi label="Available Beds" value={data.availableBeds} sub={`${data.occupiedBeds} currently occupied`} icon="BD" />
        <Kpi label="Doctors Present" value={data.doctorsPresent} sub="Of 136 total" icon="DR" />
        <Kpi label="Critical Medicines" value={data.medicineShortages} sub="Need attention" icon="MD" tone="warn" />
        <Kpi label="Predicted Shortages" value="2" sub="Next 7 days" icon="RS" tone="risk" />
        <Kpi label="Resource Health" value="78%" sub="Network healthy" icon="HL" tone="good" />
      </div>

      <div className="grid-2">
        <section className="card chart-card">
          <div className="card-head">
            <div>
              <h3>7-Day Demand vs Stock Trajectory</h3>
              <p>Insulin Glargine - PHC Sector 22 Noida</p>
            </div>
            <Badge>CRITICAL</Badge>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={245}>
              <AreaChart data={chart}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="demand" fill="#FFDCDC" stroke="#D8A2A2" name="Predicted Demand" />
                <Area type="monotone" dataKey="stock" fill="#FFF9D6" stroke="#8EA66B" name="Remaining Stock" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            <span><i className="rose" /> Predicted demand</span>
            <span><i className="sage" /> Remaining stock</span>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <h3>Medicine Risk Monitor</h3>
              <p>Ridge regression shortage detection</p>
            </div>
            <Link to="/inventory">View all</Link>
          </div>

          <div className="risk-row">
            <div>
              <b>Insulin Glargine 100IU</b>
              <small>PHC Sector 22 - 31 units on hand</small>
            </div>
            <Badge>CRITICAL</Badge>
            <strong>1.5d</strong>
          </div>

          <div className="risk-row">
            <div>
              <b>ORS Rehydration Salts</b>
              <small>PHC Laxmi Nagar - 112 units on hand</small>
            </div>
            <Badge>HIGH_RISK</Badge>
            <strong>3.2d</strong>
          </div>

          <div className="risk-row">
            <div>
              <b>Paracetamol 500mg</b>
              <small>PHC Sector 62 - 230 units on hand</small>
            </div>
            <Badge>HEALTHY</Badge>
            <strong>12d</strong>
          </div>
        </section>
      </div>

      <section className="card alert-banner">
        <div className="alert-icon" style={{ fontSize: '12px', fontWeight: 'bold' }}>ALT</div>
        <div>
          <b>Critical shortage detected</b>
          <p>Insulin Glargine at PHC Sector 22 is projected to stock out in <strong>1.5 days</strong>.</p>
        </div>
        <Link className="secondary" to="/transfers">
          View redistribution
        </Link>
      </section>
    </>
  );
}
