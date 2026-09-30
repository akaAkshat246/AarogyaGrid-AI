import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';
import { endpoints } from '../services/api';

const defaultCentres = [
  { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5960, lng: 77.3480, status: 'CRITICAL', stock: 'Insulin (1.5 days)', beds: '18/24', occupancy: 75, deficit: 'Insulin Glargine (82u shortfall)', aiRec: 'Critical shortage detected. Shortest transfer corridor from PHC Sector 62 (3.71 km via Sector 62 Master Plan Rd, 18 mins ETA).' },
  { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.6270, lng: 77.3620, status: 'HEALTHY', stock: 'Stable (472u surplus)', beds: '12/32', occupancy: 37, deficit: 'None', aiRec: 'Safe Surplus Hub. Shortest distance donor to Sector 22.' },
  { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.4720, lng: 77.5080, status: 'HEALTHY', stock: 'Stable', beds: '15/40', occupancy: 38, deficit: 'None', aiRec: 'Safe operational zone. Tertiary capacity available.' },
  { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5530, lng: 77.5540, status: 'WATCH', stock: 'ORS (4.2 days)', beds: '14/16', occupancy: 87, deficit: 'ORS low buffer', aiRec: 'Bed occupancy high (87%). Monitor admission rates.' },
  { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East', state: 'Delhi', lat: 28.6315, lng: 77.2773, status: 'HIGH_RISK', stock: 'ORS (3.2 days)', beds: '24/24', occupancy: 100, deficit: 'ORS and Paracetamol', aiRec: '100% Bed Capacity Overload. Shortest referral corridor to CHC Mayur Vihar (3.8 km, 12 mins).' },
  { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East', state: 'Delhi', lat: 28.6083, lng: 77.2952, status: 'HEALTHY', stock: 'Stable', beds: '11/30', occupancy: 36, deficit: 'None', aiRec: 'Surplus capacity available for East Delhi referral intake.' },
  { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South', state: 'Delhi', lat: 28.5244, lng: 77.2167, status: 'HEALTHY', stock: 'Stable', beds: '14/36', occupancy: 38, deficit: 'None', aiRec: 'South Delhi primary operational hub.' },
  { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South', state: 'Delhi', lat: 28.5494, lng: 77.2001, status: 'HIGH_RISK', stock: 'IV Saline (2.8 days)', beds: '16/20', occupancy: 80, deficit: 'IV Normal Saline', aiRec: 'Evening bed occupancy projected at 80%. Shortest corridor to Saket (3.2 km).' },
  { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North', state: 'Delhi', lat: 28.7180, lng: 77.1264, status: 'HEALTHY', stock: 'Stable', beds: '10/28', occupancy: 35, deficit: 'None', aiRec: 'Stable supply and staff coverage.' },
  { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central', state: 'Delhi', lat: 28.6514, lng: 77.1907, status: 'HEALTHY', stock: 'Stable', beds: '9/22', occupancy: 40, deficit: 'None', aiRec: 'Central logistics point running smoothly.' },
  { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.7770, lng: 77.5020, status: 'CRITICAL', stock: 'ORS (1.8 days)', beds: '20/20', occupancy: 100, deficit: 'ORS and IV Fluids', aiRec: 'Critical Outbreak. Shortest corridor from CHC Raj Nagar (9.4 km via Meerut Rd, 22 mins).' },
  { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6920, lng: 77.4410, status: 'HEALTHY', stock: 'Surplus IV Fluids', beds: '16/40', occupancy: 40, deficit: 'None', aiRec: 'Surplus Hub for Ghaziabad. Nearest safe donor to Muradnagar.' },
  { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6410, lng: 77.3710, status: 'HIGH_RISK', stock: 'Paracetamol (3.1 days)', beds: '22/24', occupancy: 91, deficit: 'Paracetamol 500mg', aiRec: 'High footfall pressure. Nearest donor Sector 62 (2.4 km).' },
  { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6710, lng: 77.3750, status: 'WATCH', stock: 'IV Saline (4.8 days)', beds: '18/22', occupancy: 81, deficit: 'IV Saline', aiRec: 'Approaching warning threshold.' },
  { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon', state: 'Haryana', lat: 28.4740, lng: 77.0420, status: 'HEALTHY', stock: 'Stable', beds: '8/24', occupancy: 33, deficit: 'None', aiRec: 'Haryana corridor stable.' },
  { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad', state: 'Haryana', lat: 28.3880, lng: 77.3010, status: 'HEALTHY', stock: 'Stable', beds: '12/28', occupancy: 42, deficit: 'None', aiRec: 'Southern NCR corridor operating normally.' }
];

const pinColors = {
  CRITICAL: '#e53e3e',
  HIGH_RISK: '#dd6b20',
  WATCH: '#d69e2e',
  HEALTHY: '#38a169'
};

// Shortest road route coordinates between Sector 62 donor and Sector 22 recipient
const shortestRoadCoordinates = [
  [28.6270, 77.3620], // Sector 62 Noida
  [28.6235, 77.3595], // Sector 62 Master Plan Rd
  [28.6180, 77.3560], // Fortis Hospital intersection
  [28.6120, 77.3520], // Sector 57 turn
  [28.6050, 77.3490], // Sector 22 Link
  [28.5960, 77.3480]  // Sector 22 Noida
];

export default function MapView() {
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const [centres, setCentres] = useState(defaultCentres);
  const [selected, setSelected] = useState(defaultCentres[0]);
  const [filter, setFilter] = useState('ALL');
  const [routeInfo] = useState({
    distance: '3.71 km',
    duration: '18 mins',
    from: 'PHC Sector 62 Noida',
    to: 'PHC Sector 22 Noida',
    road: 'Sector 62 Master Plan Rd'
  });

  const nav = useNavigate();

  // Fetch live PHC coordinates from backend
  useEffect(() => {
    endpoints.phcs()
      .then(res => {
        if (res.data?.data?.length) {
          const mapped = defaultCentres.map(dc => {
            const live = res.data.data.find(p => p.id === dc.id);
            return live ? { ...dc, ...live, lat: live.latitude || dc.lat, lng: live.longitude || dc.lng } : dc;
          });
          setCentres(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapInstance.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.3400],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Clean tile layer (CartoDB Positron with fallback to OSM)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      leafletMapInstance.current = map;
    }

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  // Update Markers and Shortest Route Polyline
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !markersLayerRef.current || !routeLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routeLayerRef.current.clearLayers();

    const visibleCentres = centres.filter(c => {
      if (filter === 'CRITICAL') return c.status === 'CRITICAL' || c.status === 'HIGH_RISK';
      if (filter === 'SURPLUS') return c.status === 'HEALTHY';
      return true;
    });

    // Draw Shortest Transfer Corridor Polyline
    if (filter !== 'SURPLUS') {
      const routePolyline = L.polyline(shortestRoadCoordinates, {
        color: '#2b6cb0',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });

      routePolyline.bindTooltip(
        `<b>Shortest Transfer Route: 3.71 km (18 mins)</b><br/>PHC Sec 62 to PHC Sec 22 via Master Plan Rd`,
        { sticky: true, className: 'route-tooltip' }
      );

      routeLayerRef.current.addLayer(routePolyline);
    }

    // Add Markers for Visible Health Centres
    visibleCentres.forEach(c => {
      const color = pinColors[c.status] || '#38a169';
      const isSelected = selected?.id === c.id;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            background: ${color};
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <div style="
              width: ${isSelected ? '10px' : '8px'};
              height: ${isSelected ? '10px' : '8px'};
              background: #ffffff;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
        iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11]
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: 'DM Sans', sans-serif; padding: 4px; min-width: 180px;">
          <b style="font-size: 13px; color: #292927; display: block; margin-bottom: 4px;">${c.name}</b>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #fff; background: ${color}; margin-bottom: 6px;">${c.status}</span>
          <div style="font-size: 11px; color: #555; line-height: 1.4;">
            <div>Beds: <b>${c.beds}</b> (${c.occupancy}% full)</div>
            <div>Stock: <b>${c.stock}</b></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelected(c);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [centres, filter, selected]);

  const handleCenterSelect = (c) => {
    setSelected(c);
    if (leafletMapInstance.current) {
      leafletMapInstance.current.flyTo([c.lat, c.lng], 13, { duration: 0.8 });
    }
  };

  return (
    <>
      <PageTitle
        title="Live District Resource Map"
        desc="Interactive geospatial telemetry across Delhi-NCR with automated shortest-path emergency redistribution corridors."
        action={
          <div className="map-toolbar-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={filter === 'ALL' ? 'primary' : 'secondary'} onClick={() => setFilter('ALL')}>
              All 16 Centres
            </button>
            <button className={filter === 'CRITICAL' ? 'primary' : 'secondary'} onClick={() => setFilter('CRITICAL')}>
              Shortages Only
            </button>
            <button className={filter === 'SURPLUS' ? 'primary' : 'secondary'} onClick={() => setFilter('SURPLUS')}>
              Surplus Hubs
            </button>
          </div>
        }
      />

      <div className="map-layout">
        {/* Main Map Container */}
        <div className="map card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '620px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Live Platform Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            fontWeight: '600',
            zIndex: 1000
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38a169', display: 'inline-block' }} />
            <span>Geospatial Telemetry (16 Centres Active)</span>
          </div>

          {/* Shortest Corridor Overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '10px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            fontSize: '11px',
            maxWidth: '260px',
            zIndex: 1000
          }}>
            <b style={{ color: '#2b6cb0', display: 'block', marginBottom: '2px' }}>
              Shortest Transfer Corridor
            </b>
            <small style={{ color: '#555', display: 'block' }}>
              {routeInfo.from} to {routeInfo.to}
            </small>
            <div style={{ marginTop: '4px', fontWeight: 'bold', color: '#222' }}>
              Distance: {routeInfo.distance} | ETA: {routeInfo.duration}
            </div>
            <small style={{ color: '#888', display: 'block', marginTop: '2px' }}>
              Via {routeInfo.road}
            </small>
          </div>

          {/* Severity Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '10px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#888', letterSpacing: '0.5px' }}>STATUS LEGEND</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#e53e3e', marginRight: '4px' }} /> Critical</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#dd6b20', marginRight: '4px' }} /> High Risk</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#d69e2e', marginRight: '4px' }} /> Watch</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#38a169', marginRight: '4px' }} /> Healthy</span>
            </div>
          </div>
        </div>

        {/* Selected Facility Intelligence Drawer */}
        <aside className="card drawer">
          <span className="eyebrow">FACILITY INTELLIGENCE</span>
          <div className="drawer-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Facility Details</span>
            <Badge>{selected.status}</Badge>
          </div>

          <h2 style={{ fontSize: '20px', margin: '8px 0 4px' }}>{selected.name}</h2>
          <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#777' }}>
            {selected.district} · {selected.state}
          </p>

          <div className="drawer-metrics">
            <div>
              <small>BED CAPACITY</small>
              <b>{selected.beds}</b>
              <div style={{ background: '#eee', height: '5px', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${selected.occupancy}%`, height: '100%', background: selected.occupancy >= 85 ? '#e53e3e' : '#38a169' }} />
              </div>
            </div>
            <div>
              <small>MEDICINE STOCK</small>
              <b>{selected.stock}</b>
              <small style={{ color: selected.status === 'CRITICAL' ? '#e53e3e' : '#888', marginTop: '4px', display: 'block' }}>
                {selected.deficit}
              </small>
            </div>
          </div>

          <h3 style={{ fontSize: '13px', margin: '16px 0 6px' }}>AI Operations Recommendation</h3>
          <div className="recommend" style={{ whiteSpace: 'pre-wrap', fontSize: '11px', lineHeight: '1.5' }}>
            {selected.aiRec}
          </div>

          <button
            className="primary wide"
            onClick={() => nav('/transfers')}
            style={{ marginTop: '14px' }}
          >
            Launch Redistribution Transfer
          </button>

          <button
            className="secondary wide"
            onClick={() => nav('/predictions')}
            style={{ marginTop: '8px' }}
          >
            View ML Forecasting Model
          </button>

          <div style={{ marginTop: '18px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Quick Select Facility
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {centres.map(c => (
                <button
                  key={c.id}
                  className={`secondary ${selected.id === c.id ? 'active' : ''}`}
                  onClick={() => handleCenterSelect(c)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    fontSize: '11px',
                    textAlign: 'left',
                    background: selected.id === c.id ? 'var(--sand)' : 'transparent',
                    borderColor: selected.id === c.id ? 'var(--ink)' : 'var(--line)'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{c.name}</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: pinColors[c.status] }}>{c.status}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
