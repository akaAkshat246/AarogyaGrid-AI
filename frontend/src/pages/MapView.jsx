import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageTitle from '../components/PageTitle';
import Badge from '../components/Badge';
import { endpoints } from '../services/api';

const defaultCentres = [
  { id: 'phc-noida-sec22', name: 'PHC Sector 22 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5960, lng: 77.3480, status: 'CRITICAL', stock: 'Insulin (1.5 days)', beds: '18/24', occupancy: 75, deficit: 'Insulin Glargine (82u shortfall)', donorId: 'phc-noida-sec62', aiRec: 'Critical shortage detected. Shortest transfer corridor from PHC Sector 62 (via Sector 62 Master Plan Rd).' },
  { id: 'phc-noida-sec62', name: 'PHC Sector 62 Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.6270, lng: 77.3620, status: 'HEALTHY', stock: 'Stable (472u surplus)', beds: '12/32', occupancy: 37, deficit: 'None', donorId: null, aiRec: 'Safe Surplus Hub. Primary donor for Noida and East Delhi clusters.' },
  { id: 'phc-gr-noida-beta', name: 'CHC Beta 1 Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.4720, lng: 77.5080, status: 'HEALTHY', stock: 'Stable', beds: '15/40', occupancy: 38, deficit: 'None', donorId: null, aiRec: 'Safe operational zone. Tertiary capacity available.' },
  { id: 'phc-dadri-rural', name: 'PHC Dadri Rural', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.5530, lng: 77.5540, status: 'WATCH', stock: 'ORS (4.2 days)', beds: '14/16', occupancy: 87, deficit: 'ORS low buffer', donorId: 'phc-gr-noida-beta', aiRec: 'Bed occupancy high (87%). Nearest donor CHC Beta 1 Greater Noida.' },
  { id: 'phc-delhi-east-01', name: 'PHC Laxmi Nagar', district: 'Delhi East', state: 'Delhi', lat: 28.6315, lng: 77.2773, status: 'HIGH_RISK', stock: 'ORS (3.2 days)', beds: '24/24', occupancy: 100, deficit: 'ORS and Paracetamol', donorId: 'phc-delhi-east-02', aiRec: '100% Bed Capacity Overload. Shortest corridor to CHC Mayur Vihar.' },
  { id: 'phc-delhi-east-02', name: 'PHC Mayur Vihar', district: 'Delhi East', state: 'Delhi', lat: 28.6083, lng: 77.2952, status: 'HEALTHY', stock: 'Stable', beds: '11/30', occupancy: 36, deficit: 'None', donorId: null, aiRec: 'Surplus capacity available for East Delhi referral intake.' },
  { id: 'phc-delhi-south-01', name: 'PHC Saket', district: 'Delhi South', state: 'Delhi', lat: 28.5244, lng: 77.2167, status: 'HEALTHY', stock: 'Stable', beds: '14/36', occupancy: 38, deficit: 'None', donorId: null, aiRec: 'South Delhi primary operational hub.' },
  { id: 'phc-delhi-south-02', name: 'PHC Hauz Khas', district: 'Delhi South', state: 'Delhi', lat: 28.5494, lng: 77.2001, status: 'HIGH_RISK', stock: 'IV Saline (2.8 days)', beds: '16/20', occupancy: 80, deficit: 'IV Normal Saline', donorId: 'phc-delhi-south-01', aiRec: 'Evening bed occupancy projected at 80%. Shortest corridor to Saket.' },
  { id: 'phc-delhi-north-01', name: 'PHC Rohini Sec-15', district: 'Delhi North', state: 'Delhi', lat: 28.7180, lng: 77.1264, status: 'HEALTHY', stock: 'Stable', beds: '10/28', occupancy: 35, deficit: 'None', donorId: null, aiRec: 'Stable supply and staff coverage.' },
  { id: 'phc-delhi-central-01', name: 'PHC Karol Bagh', district: 'Delhi Central', state: 'Delhi', lat: 28.6514, lng: 77.1907, status: 'HEALTHY', stock: 'Stable', beds: '9/22', occupancy: 40, deficit: 'None', donorId: null, aiRec: 'Central logistics point running smoothly.' },
  { id: 'phc-ghaziabad-rural', name: 'PHC Muradnagar Rural', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.7770, lng: 77.5020, status: 'CRITICAL', stock: 'ORS (1.8 days)', beds: '20/20', occupancy: 100, deficit: 'ORS and IV Fluids', donorId: 'phc-ghaziabad-rajnagar', aiRec: 'Critical Outbreak. Shortest corridor from CHC Raj Nagar via Meerut Rd.' },
  { id: 'phc-ghaziabad-rajnagar', name: 'CHC Raj Nagar', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6920, lng: 77.4410, status: 'HEALTHY', stock: 'Surplus IV Fluids', beds: '16/40', occupancy: 40, deficit: 'None', donorId: null, aiRec: 'Surplus Hub for Ghaziabad. Nearest safe donor to Muradnagar.' },
  { id: 'phc-ghaziabad-indirapuram', name: 'PHC Indirapuram', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6410, lng: 77.3710, status: 'HIGH_RISK', stock: 'Paracetamol (3.1 days)', beds: '22/24', occupancy: 91, deficit: 'Paracetamol 500mg', donorId: 'phc-noida-sec62', aiRec: 'High footfall pressure. Nearest donor Sector 62.' },
  { id: 'phc-ghaziabad-sahibabad', name: 'PHC Sahibabad', district: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6710, lng: 77.3750, status: 'WATCH', stock: 'IV Saline (4.8 days)', beds: '18/22', occupancy: 81, deficit: 'IV Saline', donorId: 'phc-noida-sec62', aiRec: 'Approaching warning threshold.' },
  { id: 'phc-gurgaon-sec14', name: 'PHC Sector 14 Gurgaon', district: 'Gurgaon', state: 'Haryana', lat: 28.4740, lng: 77.0420, status: 'HEALTHY', stock: 'Stable', beds: '8/24', occupancy: 33, deficit: 'None', donorId: null, aiRec: 'Haryana corridor stable.' },
  { id: 'phc-faridabad-nit', name: 'PHC Faridabad NIT', district: 'Faridabad', state: 'Haryana', lat: 28.3880, lng: 77.3010, status: 'HEALTHY', stock: 'Stable', beds: '12/28', occupancy: 42, deficit: 'None', donorId: null, aiRec: 'Southern NCR corridor operating normally.' }
];

const pinColors = {
  CRITICAL: '#e53e3e',
  HIGH_RISK: '#dd6b20',
  WATCH: '#d69e2e',
  HEALTHY: '#38a169'
};

// Calculate geographic bearing angle (heading) between two points
function calculateBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export default function MapView() {
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const googleMapInstance = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleFullRoutePolylineRef = useRef(null);
  const googleTraveledPolylineRef = useRef(null);
  const googleVehicleMarkerRef = useRef(null);
  const googleInfoWindowRef = useRef(null);

  const markersLayerRef = useRef(null);
  const fullRouteLayerRef = useRef(null);
  const traveledRouteLayerRef = useRef(null);
  const vehicleLayerRef = useRef(null);

  const animationTimerRef = useRef(null);

  const [centres, setCentres] = useState(defaultCentres);
  const [selected, setSelected] = useState(defaultCentres[0]); // PHC Sector 22 (Deficit)
  const [filter, setFilter] = useState('ALL');
  const [mapEngine, setMapEngine] = useState('google'); // 'google' | 'leaflet'
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Live Navigation State
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [totalDistanceText, setTotalDistanceText] = useState('4.8 km');
  const [totalDurationText, setTotalDurationText] = useState('14 mins');
  const [originFacility, setOriginFacility] = useState(defaultCentres[1]); // Sector 62
  const [destFacility, setDestFacility] = useState(defaultCentres[0]); // Sector 22

  // Uber-like Live Tracking State
  const [currentCoordIndex, setCurrentCoordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 4x
  const [autoFollow, setAutoFollow] = useState(true);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(42);
  const [currentManeuver, setCurrentManeuver] = useState('Proceed along corridor');
  const [remainingDistText, setRemainingDistText] = useState('4.8 km');
  const [remainingDurationText, setRemainingDurationText] = useState('14 mins');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isArrived, setIsArrived] = useState(false);

  const nav = useNavigate();

  // 1. Fetch live PHCs from backend
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

  // 2. Check Google Maps JavaScript API availability
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.Map) {
        setIsGoogleReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const timer = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(timer);
      }
    }, 200);

    const fallbackTimeout = setTimeout(() => {
      if (!window.google?.maps?.Map) {
        setMapEngine('leaflet');
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // 3. Fetch Real Driving Route (Google Directions API + High-Precision Real Road Fallback)
  const fetchRealDrivingDirections = useCallback(async (origin, destination) => {
    if (!origin || !destination) return;

    // A. Attempt Google Maps DirectionsService
    if (window.google?.maps?.DirectionsService) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const request = {
          origin: new window.google.maps.LatLng(origin.lat, origin.lng),
          destination: new window.google.maps.LatLng(destination.lat, destination.lng),
          travelMode: window.google.maps.TravelMode.DRIVING
        };

        const result = await new Promise((resolve, reject) => {
          directionsService.route(request, (res, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(res);
            } else {
              reject(new Error(status));
            }
          });
        });

        if (result && result.routes && result.routes[0]) {
          const leg = result.routes[0].legs[0];
          const rawPath = result.routes[0].overview_path.map(p => [p.lat(), p.lng()]);
          const steps = leg.steps.map(s => ({
            instruction: s.instructions.replace(/<[^>]*>?/gm, ''),
            distance: s.distance.text,
            duration: s.duration.text
          }));

          setTotalDistanceText(leg.distance.text);
          setTotalDurationText(leg.duration.text);
          setRouteSteps(steps);
          setRouteCoordinates(rawPath);
          setCurrentCoordIndex(0);
          setIsArrived(false);
          return;
        }
      } catch (err) {
        // Fall through to real-road OSRM engine
      }
    }

    // B. Real-Road Driving Engine Fallback (Real Turn-by-turn road geometry in Delhi-NCR)
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const rawCoords = route.geometry.coordinates.map(c => [c[1], c[0]]); // [lat, lng]
        const distKm = (route.distance / 1000).toFixed(1) + ' km';
        const durMins = Math.max(1, Math.round(route.duration / 60)) + ' mins';

        const steps = route.legs[0]?.steps?.map(s => ({
          instruction: s.maneuver.type === 'arrive' ? 'Arrived at Destination Facility' : (s.name ? `Proceed onto ${s.name}` : `Turn ${s.maneuver.modifier || 'onto corridor'}`),
          distance: (s.distance / 1000).toFixed(1) + ' km',
          duration: Math.round(s.duration / 60) + ' min'
        })) || [];

        setTotalDistanceText(distKm);
        setTotalDurationText(durMins);
        setRouteSteps(steps);
        setRouteCoordinates(rawCoords);
        setCurrentCoordIndex(0);
        setIsArrived(false);
      }
    } catch (e) {
      console.warn('Routing engine notice:', e);
    }
  }, []);

  // Update Route when selected facility changes
  useEffect(() => {
    const target = selected;
    let donor = defaultCentres.find(c => c.id === target.donorId);
    if (!donor) {
      // Find closest healthy surplus facility
      const surplusCentres = centres.filter(c => c.status === 'HEALTHY' && c.id !== target.id);
      donor = surplusCentres[0] || centres[1];
    }

    setOriginFacility(donor);
    setDestFacility(target);
    fetchRealDrivingDirections(donor, target);
  }, [selected, centres, fetchRealDrivingDirections]);

  // 4. Initialize Map Canvas (Google Maps / Leaflet)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Teardown previous maps
    if (leafletMapInstance.current) {
      try { leafletMapInstance.current.remove(); } catch (e) {}
      leafletMapInstance.current = null;
    }
    if (googleMapInstance.current) {
      googleMarkersRef.current.forEach(m => m.setMap(null));
      googleMarkersRef.current = [];
      if (googleFullRoutePolylineRef.current) googleFullRoutePolylineRef.current.setMap(null);
      if (googleTraveledPolylineRef.current) googleTraveledPolylineRef.current.setMap(null);
      if (googleVehicleMarkerRef.current) googleVehicleMarkerRef.current.setMap(null);
      googleMapInstance.current = null;
    }
    mapContainerRef.current.innerHTML = '';

    if (mapEngine === 'google' && isGoogleReady && window.google?.maps) {
      try {
        const gmap = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: 28.6139, lng: 77.3400 },
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'simplified' }] }
          ]
        });

        googleInfoWindowRef.current = new window.google.maps.InfoWindow();
        googleMapInstance.current = gmap;
      } catch (err) {
        setMapEngine('leaflet');
      }
    } else {
      try {
        const lmap = L.map(mapContainerRef.current, {
          center: [28.6139, 77.3400],
          zoom: 12,
          zoomControl: false,
          attributionControl: false
        });

        L.control.zoom({ position: 'topright' }).addTo(lmap);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(lmap);

        markersLayerRef.current = L.layerGroup().addTo(lmap);
        fullRouteLayerRef.current = L.layerGroup().addTo(lmap);
        traveledRouteLayerRef.current = L.layerGroup().addTo(lmap);
        vehicleLayerRef.current = L.layerGroup().addTo(lmap);

        leafletMapInstance.current = lmap;

        setTimeout(() => lmap.invalidateSize(), 150);
      } catch (e) {}
    }

    const handleResize = () => {
      if (leafletMapInstance.current) leafletMapInstance.current.invalidateSize();
      if (googleMapInstance.current && window.google?.maps?.event) {
        window.google.maps.event.trigger(googleMapInstance.current, 'resize');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapEngine, isGoogleReady]);

  // 5. Draw Static PHC Markers
  useEffect(() => {
    const visibleCentres = centres.filter(c => {
      if (filter === 'CRITICAL') return c.status === 'CRITICAL' || c.status === 'HIGH_RISK';
      if (filter === 'SURPLUS') return c.status === 'HEALTHY';
      return true;
    });

    if (mapEngine === 'google' && googleMapInstance.current && window.google?.maps) {
      googleMarkersRef.current.forEach(m => m.setMap(null));
      googleMarkersRef.current = [];

      visibleCentres.forEach(c => {
        const color = pinColors[c.status] || '#38a169';
        const isSelected = selected?.id === c.id;

        const markerSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 36 : 28}" height="${isSelected ? 36 : 28}" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="${isSelected ? 10 : 8}" fill="${color}" stroke="#ffffff" stroke-width="2.5" />
            <circle cx="12" cy="12" r="3" fill="#ffffff" />
          </svg>
        `;

        const marker = new window.google.maps.Marker({
          position: { lat: c.lat, lng: c.lng },
          map: googleMapInstance.current,
          title: c.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`,
            scaledSize: new window.google.maps.Size(isSelected ? 36 : 28, isSelected ? 36 : 28),
            anchor: new window.google.maps.Point(isSelected ? 18 : 14, isSelected ? 18 : 14)
          }
        });

        marker.addListener('click', () => {
          setSelected(c);
          const content = `
            <div style="font-family: 'DM Sans', sans-serif; padding: 6px; min-width: 190px;">
              <b style="font-size: 13px; color: #222; display: block; margin-bottom: 4px;">${c.name}</b>
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #fff; background: ${color}; margin-bottom: 6px;">${c.status}</span>
              <div style="font-size: 11px; color: #555; line-height: 1.4;">
                <div>Beds: <b>${c.beds}</b> (${c.occupancy}% full)</div>
                <div>Stock: <b>${c.stock}</b></div>
              </div>
            </div>
          `;
          googleInfoWindowRef.current.setContent(content);
          googleInfoWindowRef.current.open(googleMapInstance.current, marker);
        });

        googleMarkersRef.current.push(marker);
      });
    } else if (leafletMapInstance.current && markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

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
        marker.on('click', () => setSelected(c));
        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [centres, filter, selected, mapEngine]);

  // 6. Draw Full Route and Setup Vehicle Animation
  useEffect(() => {
    if (!routeCoordinates.length) return;

    if (mapEngine === 'google' && googleMapInstance.current && window.google?.maps) {
      if (googleFullRoutePolylineRef.current) googleFullRoutePolylineRef.current.setMap(null);
      if (googleTraveledPolylineRef.current) googleTraveledPolylineRef.current.setMap(null);

      const path = routeCoordinates.map(c => ({ lat: c[0], lng: c[1] }));

      // Full upcoming route corridor (semi-transparent dashed gray/blue)
      googleFullRoutePolylineRef.current = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#5f6368',
        strokeOpacity: 0.45,
        strokeWeight: 6,
        map: googleMapInstance.current
      });

      // Active traveled path (illuminated solid Google blue)
      googleTraveledPolylineRef.current = new window.google.maps.Polyline({
        path: [path[0]],
        geodesic: true,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.95,
        strokeWeight: 6,
        map: googleMapInstance.current
      });

      // Auto-fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      googleMapInstance.current.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });
    } else if (leafletMapInstance.current && fullRouteLayerRef.current && traveledRouteLayerRef.current) {
      fullRouteLayerRef.current.clearLayers();
      traveledRouteLayerRef.current.clearLayers();

      const fullPolyline = L.polyline(routeCoordinates, {
        color: '#5f6368',
        weight: 6,
        opacity: 0.45,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      fullRouteLayerRef.current.addLayer(fullPolyline);

      const traveledPolyline = L.polyline([routeCoordinates[0]], {
        color: '#1a73e8',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });
      traveledRouteLayerRef.current.addLayer(traveledPolyline);

      leafletMapInstance.current.fitBounds(fullPolyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeCoordinates, mapEngine]);

  // 7. Uber-Style 60FPS Live Vehicle Motion & Turn Tracing Animation Loop
  useEffect(() => {
    if (!routeCoordinates.length || !isPlaying) {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      return;
    }

    const intervalMs = Math.max(30, Math.floor(180 / simSpeed));

    animationTimerRef.current = setInterval(() => {
      setCurrentCoordIndex(prevIdx => {
        if (prevIdx >= routeCoordinates.length - 1) {
          setIsArrived(true);
          setIsPlaying(false);
          clearInterval(animationTimerRef.current);
          return prevIdx;
        }

        const nextIdx = prevIdx + 1;
        const currentCoord = routeCoordinates[nextIdx];
        const prevCoord = routeCoordinates[prevIdx];
        const heading = calculateBearing(prevCoord[0], prevCoord[1], currentCoord[0], currentCoord[1]);

        // Calculate progress percentage
        const pct = Math.min(100, Math.round((nextIdx / (routeCoordinates.length - 1)) * 100));
        setProgressPercent(pct);

        // Dynamic Speed & ETA calculation
        const remainingFraction = 1 - (nextIdx / routeCoordinates.length);
        const totalDistNum = parseFloat(totalDistanceText) || 4.5;
        const remainingKm = (totalDistNum * remainingFraction).toFixed(1);
        const totalDurNum = parseInt(totalDurationText) || 12;
        const remainingMins = Math.max(1, Math.round(totalDurNum * remainingFraction));

        setRemainingDistText(`${remainingKm} km`);
        setRemainingDurationText(`${remainingMins} mins`);
        setCurrentSpeedKmh(Math.floor(38 + Math.sin(nextIdx * 0.4) * 12));

        // Update current maneuver based on step progress
        if (routeSteps.length) {
          const stepIndex = Math.min(routeSteps.length - 1, Math.floor((nextIdx / routeCoordinates.length) * routeSteps.length));
          setCurrentManeuver(routeSteps[stepIndex].instruction || 'Proceeding along emergency route corridor');
        }

        // A. Google Maps Real-Time Vehicle Update
        if (mapEngine === 'google' && googleMapInstance.current && window.google?.maps) {
          const traveledCoords = routeCoordinates.slice(0, nextIdx + 1).map(c => ({ lat: c[0], lng: c[1] }));
          if (googleTraveledPolylineRef.current) {
            googleTraveledPolylineRef.current.setPath(traveledCoords);
          }

          const vehiclePos = { lat: currentCoord[0], lng: currentCoord[1] };

          const vehicleSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="rgba(26,115,232,0.25)" />
              <circle cx="20" cy="20" r="12" fill="#1a73e8" stroke="#ffffff" stroke-width="2.5" />
              <path d="M20 12 L24 22 L20 19 L16 22 Z" fill="#ffffff" transform="rotate(${heading} 20 20)" />
            </svg>
          `;

          if (!googleVehicleMarkerRef.current) {
            googleVehicleMarkerRef.current = new window.google.maps.Marker({
              position: vehiclePos,
              map: googleMapInstance.current,
              title: 'Emergency Medical Dispatch (In Transit)',
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(vehicleSvg)}`,
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
              },
              zIndex: 9999
            });
          } else {
            googleVehicleMarkerRef.current.setPosition(vehiclePos);
            googleVehicleMarkerRef.current.setIcon({
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(vehicleSvg)}`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            });
          }

          if (autoFollow && nextIdx % 4 === 0) {
            googleMapInstance.current.panTo(vehiclePos);
          }
        }

        // B. Leaflet Real-Time Vehicle Update
        else if (leafletMapInstance.current && traveledRouteLayerRef.current && vehicleLayerRef.current) {
          const traveledCoords = routeCoordinates.slice(0, nextIdx + 1);
          traveledRouteLayerRef.current.clearLayers();
          traveledRouteLayerRef.current.addLayer(
            L.polyline(traveledCoords, {
              color: '#1a73e8',
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            })
          );

          vehicleLayerRef.current.clearLayers();

          const vehicleIcon = L.divIcon({
            className: 'live-vehicle-marker',
            html: `
              <div class="live-vehicle-radar"></div>
              <div class="live-vehicle-body" style="transform: rotate(${heading}deg);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 20l8-4 8 4z"/>
                </svg>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });

          const vMarker = L.marker([currentCoord[0], currentCoord[1]], { icon: vehicleIcon, zIndexOffset: 1000 });
          vehicleLayerRef.current.addLayer(vMarker);

          if (autoFollow && nextIdx % 4 === 0) {
            leafletMapInstance.current.panTo([currentCoord[0], currentCoord[1]], { animate: true, duration: 0.2 });
          }
        }

        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [routeCoordinates, isPlaying, simSpeed, autoFollow, mapEngine, totalDistanceText, totalDurationText, routeSteps]);

  // Restart live simulation from the beginning
  const handleRestart = () => {
    setCurrentCoordIndex(0);
    setProgressPercent(0);
    setIsArrived(false);
    setIsPlaying(true);
  };

  const handleCenterSelect = (c) => {
    setSelected(c);
  };

  return (
    <>
      <PageTitle
        title="Live District Resource Map"
        desc="Real-time Google Maps telemetry with live turn-by-turn emergency redistribution tracing."
        action={
          <div className="map-toolbar-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div className="map card" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: '650px', minHeight: '520px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '520px' }} />

          {/* Severity Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '8px 12px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 1000
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#888', letterSpacing: '0.5px' }}>STATUS LEGEND</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span><i style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#e53e3e', marginRight: '4px' }} /> Critical</span>
              <span><i style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#dd6b20', marginRight: '4px' }} /> High Risk</span>
              <span><i style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#d69e2e', marginRight: '4px' }} /> Watch</span>
              <span><i style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#38a169', marginRight: '4px' }} /> Healthy</span>
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
              Select Facility to Trace Live Route
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
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
