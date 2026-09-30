import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';
import { endpoints } from '../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

const defaultCentres = [
  { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5960, lng: 77.3480, status: 'CRITICAL', stock: 'Insulin · 1.5d', beds: '18/24', occupancy: 75, deficit: 'Insulin Glargine (82u shortfall)', aiRec: 'Critical shortage! AI recommends 82 units transfer from PHC Sector 62 (3.7 km away).' },
  { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.6270, lng: 77.3620, status: 'HEALTHY', stock: 'Stable (472u surplus)', beds: '12/32', occupancy: 37, deficit: 'None', aiRec: 'Safe Surplus Hub. Can safely donate 82 units of Insulin while retaining 7-day reserve.' },
  { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.4720, lng: 77.5080, status: 'HEALTHY', stock: 'Stable', beds: '15/40', occupancy: 38, deficit: 'None', aiRec: 'Safe operational zone. Tertiary capacity available.' },
  { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5530, lng: 77.5540, status: 'WATCH', stock: 'ORS · 4.2d', beds: '14/16', occupancy: 87, deficit: 'ORS low buffer', aiRec: 'Bed occupancy high (87%). Monitor admission rates.' },
  { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East', state: 'Delhi', lat: 28.6315, lng: 77.2773, status: 'HIGH_RISK', stock: 'ORS · 3.2d', beds: '24/24', occupancy: 100, deficit: 'ORS & Paracetamol', aiRec: '100% Bed Capacity Overload & ORS deficit. Divert non-critical patients to CHC Mayur Vihar.' },
  { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East', state: 'Delhi', lat: 28.6083, lng: 77.2952, status: 'HEALTHY', stock: 'Stable', beds: '11/30', occupancy: 36, deficit: 'None', aiRec: 'Surplus capacity available for East Delhi referral intake.' },
  { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South', state: 'Delhi', lat: 28.5244, lng: 77.2167, status: 'HEALTHY', stock: 'Stable', beds: '14/36', occupancy: 38, deficit: 'None', aiRec: 'South Delhi primary operational hub.' },
  { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South', state: 'Delhi', lat: 28.5494, lng: 77.2001, status: 'HIGH_RISK', stock: 'IV Saline · 2.8d', beds: '16/20', occupancy: 80, deficit: 'IV Normal Saline', aiRec: 'Evening bed occupancy projected at 80%. Prepare replenishment order.' },
  { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North', state: 'Delhi', lat: 28.7180, lng: 77.1264, status: 'HEALTHY', stock: 'Stable', beds: '10/28', occupancy: 35, deficit: 'None', aiRec: 'Stable supply & staff coverage.' },
  { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central', state: 'Delhi', lat: 28.6514, lng: 77.1907, status: 'HEALTHY', stock: 'Stable', beds: '9/22', occupancy: 40, deficit: 'None', aiRec: 'Central logistics point running smoothly.' },
  { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.7770, lng: 77.5020, status: 'CRITICAL', stock: 'ORS · 1.8d', beds: '20/20', occupancy: 100, deficit: 'ORS (1071u shortfall) & IV Fluids', aiRec: 'Critical Outbreak Overload! Emergency surge transfer required from CHC Raj Nagar.' },
  { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6920, lng: 77.4410, status: 'HEALTHY', stock: 'Surplus IV Fluids', beds: '16/40', occupancy: 40, deficit: 'None', aiRec: 'Surplus Hub for Ghaziabad. Sourcing 250 units IV Saline to Muradnagar.' },
  { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6410, lng: 77.3710, status: 'HIGH_RISK', stock: 'Paracetamol · 3.1d', beds: '22/24', occupancy: 91, deficit: 'Paracetamol 500mg', aiRec: 'High footfall pressure. Coordinate buffer with Sector 62.' },
  { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6710, lng: 77.3750, status: 'WATCH', stock: 'IV Saline · 4.8d', beds: '18/22', occupancy: 81, deficit: 'IV Saline', aiRec: 'Approaching warning threshold.' },
  { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon', state: 'Haryana', lat: 28.4740, lng: 77.0420, status: 'HEALTHY', stock: 'Stable', beds: '8/24', occupancy: 33, deficit: 'None', aiRec: 'Haryana corridor stable.' },
  { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad', state: 'Haryana', lat: 28.3880, lng: 77.3010, status: 'HEALTHY', stock: 'Stable', beds: '12/28', occupancy: 42, deficit: 'None', aiRec: 'Southern NCR corridor operating normally.' }
];

const pinColors = {
  CRITICAL: '#e53e3e',
  HIGH_RISK: '#dd6b20',
  WATCH: '#d69e2e',
  HEALTHY: '#38a169'
};

export default function MapView() {
  const mapRef = useRef(null);
  const [googleMap, setGoogleMap] = useState(null);
  const [centres, setCentres] = useState(defaultCentres);
  const [selected, setSelected] = useState(defaultCentres[0]);
  const [filter, setFilter] = useState('ALL');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  // Fetch live PHC list if available
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

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      console.warn('Google Maps CDN failed to load, falling back to interactive vector map.');
      setMapError(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.3300 }, // Central NCR
        zoom: 11,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'water', stylers: [{ color: '#c9e8f0' }] },
          { featureType: 'landscape', stylers: [{ color: '#f5f5f1' }] }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });

      setGoogleMap(map);
    } catch (err) {
      console.error('Google Maps initialization error:', err);
      setMapError(true);
    }
  }, [mapLoaded]);

  // Render Markers & Routes
  useEffect(() => {
    if (!googleMap || !window.google || !window.google.maps) return;

    // Clear previous markers & lines
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    const visibleCentres = centres.filter(c => {
      if (filter === 'CRITICAL') return c.status === 'CRITICAL' || c.status === 'HIGH_RISK';
      if (filter === 'SURPLUS') return c.status === 'HEALTHY';
      return true;
    });

    visibleCentres.forEach(c => {
      const color = pinColors[c.status] || '#38a169';
      const isSelected = selected?.id === c.id;

      // Custom SVG Pin
      const svgMarker = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: isSelected ? 3 : 1.5,
        strokeColor: isSelected ? '#111' : '#ffffff',
        scale: isSelected ? 2.2 : 1.7,
        anchor: new window.google.maps.Point(12, 22)
      };

      const marker = new window.google.maps.Marker({
        position: { lat: c.lat, lng: c.lng },
        map: googleMap,
        title: `${c.name} (${c.status})`,
        icon: svgMarker,
        animation: c.status === 'CRITICAL' ? window.google.maps.Animation.BOUNCE : null
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:'DM Sans',sans-serif;padding:6px 8px;max-width:220px;">
            <b style="font-size:13px;color:#292927;display:block;margin-bottom:4px;">${c.name}</b>
            <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;color:#fff;background:${color};margin-bottom:6px;">${c.status}</span>
            <div style="font-size:11px;color:#555;line-height:1.4;">
              <div>🛏️ Beds: <b>${c.beds}</b> (${c.occupancy}% full)</div>
              <div>💊 Stock: <b>${c.stock}</b></div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        setSelected(c);
        infoWindow.open(googleMap, marker);
        googleMap.panTo({ lat: c.lat, lng: c.lng });
      });

      markersRef.current.push(marker);
    });

    // Draw AI Redistribution Transit Polyline (Sector 62 -> Sector 22)
    const donor = centres.find(c => c.id === 'phc-noida-sec62');
    const deficit = centres.find(c => c.id === 'phc-noida-sec22');
    if (donor && deficit && filter !== 'SURPLUS') {
      const routeLine = new window.google.maps.Polyline({
        path: [
          { lat: donor.lat, lng: donor.lng },
          { lat: deficit.lat, lng: deficit.lng }
        ],
        geodesic: true,
        strokeColor: '#38a169',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        icons: [{
          icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: '#38a169', fillOpacity: 1 },
          offset: '50%'
        }],
        map: googleMap
      });
      polylinesRef.current.push(routeLine);
    }
  }, [googleMap, centres, filter, selected]);

  return (
    <>
      <PageTitle
        title="Live District Resource Map"
        desc="Google Maps live geospatial view of PHC resource stocks, bed occupancy, and AI transfer corridors."
        action={
          <div className="map-toolbar-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className={filter === 'ALL' ? 'primary' : 'secondary'} onClick={() => setFilter('ALL')}>
              All 16 Centres
            </button>
            <button className={filter === 'CRITICAL' ? 'primary' : 'secondary'} onClick={() => setFilter('CRITICAL')}>
              🚨 Shortages Only
            </button>
            <button className={filter === 'SURPLUS' ? 'primary' : 'secondary'} onClick={() => setFilter('SURPLUS')}>
              🌱 Surplus Hubs
            </button>
          </div>
        }
      />

      <div className="map-layout">
        {/* Main Map Container */}
        <div className="map card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '620px' }}>
          {/* Live Google Map Container */}
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

          {/* Fallback / Loading Overlay if maps is initializing or offline */}
          {(!mapLoaded || mapError) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#f5f4ed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🗺️</div>
              <h3 style={{ margin: '0 0 6px' }}>{mapError ? 'Interactive Vector Mode Active' : 'Loading Google Maps…'}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#777', maxWidth: '380px' }}>
                {mapError
                  ? 'Google Maps API offline. Displaying real-time PHC network coordinates in native vector mode.'
                  : 'Connecting to Google Maps JavaScript API with live geospatial coordinates…'}
              </p>
              {mapError && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', maxWidth: '500px', justifyContent: 'center' }}>
                  {centres.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      className={`secondary ${selected.id === c.id ? 'primary' : ''}`}
                      style={{ fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => setSelected(c)}
                    >
                      {c.name} ({c.status})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map Overlay Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38a169', display: 'inline-block' }} />
            <span>Google Maps Platform · Live Telemetry (16 Centres)</span>
          </div>

          {/* Corridor Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            padding: '10px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#888', letterSpacing: '0.5px' }}>SEVERITY LEGEND</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#e53e3e', marginRight: '4px' }} /> Critical</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#dd6b20', marginRight: '4px' }} /> High Risk</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#d69e2e', marginRight: '4px' }} /> Watch</span>
              <span><i style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#38a169', marginRight: '4px' }} /> Safe</span>
            </div>
          </div>
        </div>

        {/* Selected Centre Drawer */}
        <aside className="card drawer">
          <span className="eyebrow">FACILITY INTELLIGENCE</span>
          <div className="drawer-title">
            <div className="pin large" style={{ background: '#f5f5f1' }}>⌖</div>
            <Badge>{selected.status}</Badge>
          </div>

          <h2>{selected.name}</h2>
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
              <small style={{ color: selected.status === 'CRITICAL' ? '#e53e3e' : '#888', marginTop: '4px' }}>
                {selected.deficit}
              </small>
            </div>
          </div>

          <h3>AI Operations Recommendation</h3>
          <div className="recommend" style={{ whiteSpace: 'pre-wrap', fontSize: '11px', lineHeight: '1.5' }}>
            {selected.aiRec}
          </div>

          {selected.status === 'CRITICAL' && (
            <Link to="/transfers" className="primary wide" style={{ display: 'block', textAlign: 'center', marginTop: '12px' }}>
              ⚡ Launch Redistribution Transfer →
            </Link>
          )}

          <Link to="/predictions" className="secondary wide" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
            View ML Forecasting Model →
          </Link>
        </aside>
      </div>
    </>
  );
}
