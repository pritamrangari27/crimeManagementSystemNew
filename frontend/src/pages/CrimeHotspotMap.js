import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card, Badge, Form, Row, Col } from 'react-bootstrap';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import Sidebar from '../components/Sidebar';
import { dashboardAPI } from '../api/client';
import '../styles/dashboard.css';

// Fix default marker icon issue with webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Color-coded icons per crime type
const crimeIcons = {};
const getIcon = (crimeType) => {
  if (crimeIcons[crimeType]) return crimeIcons[crimeType];

  const colors = {
    'Theft': '#e74c3c', 'Robbery': '#c0392b', 'Assault': '#e67e22',
    'Murder': '#8e44ad', 'Fraud': '#2980b9', 'Cybercrime': '#16a085',
    'Drug Offense': '#d35400', 'Kidnapping': '#c0392b', 'Burglary': '#7f8c8d',
  };
  const color = colors[crimeType] || '#667eea';

  crimeIcons[crimeType] = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background:${color}; width:28px; height:28px; border-radius:50%;
      border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex; align-items:center; justify-content:center;
    "><i class="fas fa-exclamation" style="color:#fff;font-size:12px"></i></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
  return crimeIcons[crimeType];
};

// Heatmap layer component
const HeatmapLayer = ({ points, visible }) => {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
      return;
    }

    if (points.length === 0) return;

    const heatData = points.map(p => [p.latitude, p.longitude, 0.6]);
    if (heatRef.current) map.removeLayer(heatRef.current);
    heatRef.current = L.heatLayer(heatData, {
      radius: 30, blur: 20, maxZoom: 17, max: 1.0,
      gradient: { 0.2: '#2ecc71', 0.4: '#f1c40f', 0.6: '#e67e22', 0.8: '#e74c3c', 1.0: '#8e44ad' }
    }).addTo(map);

    return () => {
      if (heatRef.current) map.removeLayer(heatRef.current);
    };
  }, [map, points, visible]);

  return null;
};

// Marker cluster component
const MarkerClusterGroup = ({ points, visible }) => {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
      return;
    }

    if (points.length === 0) return;

    if (clusterRef.current) map.removeLayer(clusterRef.current);

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        let size = 'small', radius = 30;
        if (count > 50) { size = 'large'; radius = 50; }
        else if (count > 10) { size = 'medium'; radius = 40; }
        return L.divIcon({
          html: `<div style="
            background:${size === 'large' ? '#e74c3c' : size === 'medium' ? '#e67e22' : '#667eea'};
            width:${radius}px; height:${radius}px; border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            color:#fff; font-weight:700; font-size:${radius > 40 ? 14 : 12}px;
            border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(radius, radius),
        });
      }
    });

    points.forEach(p => {
      const marker = L.marker([p.latitude, p.longitude], { icon: getIcon(p.crime_type) });
      const statusColor = p.status === 'Approved' ? '#10b981' : p.status === 'Rejected' ? '#ef4444' : '#f59e0b';
      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,-apple-system,sans-serif">
          <h6 style="margin:0 0 6px;font-size:14px;color:#1a202c;font-weight:700">
            ${p.crime_type || 'Unknown'}
          </h6>
          <p style="margin:0 0 4px;font-size:12px;color:#555">
            <strong>Name:</strong> ${p.name || 'N/A'}
          </p>
          <p style="margin:0 0 4px;font-size:12px;color:#555">
            <strong>Location:</strong> ${p.location || 'N/A'}
          </p>
          <p style="margin:0 0 4px;font-size:12px;color:#555">
            <strong>Source:</strong> ${p.source === 'fir' ? 'FIR' : 'Criminal Record'}
          </p>
          <p style="margin:0 0 4px;font-size:12px">
            <strong>Status:</strong>
            <span style="background:${statusColor};color:#fff;padding:1px 8px;border-radius:10px;font-size:11px;margin-left:4px">
              ${p.status || 'N/A'}
            </span>
          </p>
          <p style="margin:0;font-size:11px;color:#999">
            ${p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
          </p>
        </div>
      `);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) map.removeLayer(clusterRef.current);
    };
  }, [map, points, visible]);

  return null;
};

// Auto-fit bounds when data loads
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, points]);
  return null;
};

const CrimeHotspotMap = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crimeLocations, setCrimeLocations] = useState([]);
  const [viewMode, setViewMode] = useState('cluster'); // 'cluster' | 'heatmap' | 'both'
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/login');
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getCrimeLocations();
        if (res.data.status === 'success') {
          setCrimeLocations(res.data.data || []);
        }
        setError('');
      } catch (err) {
        console.error('Fetch crime locations error:', err);
        setError('Failed to load crime location data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [role, navigate]);

  if (role !== 'Admin') return null;

  const crimeTypes = [...new Set(crimeLocations.map(c => c.crime_type).filter(Boolean))].sort();
  const filteredLocations = filterType
    ? crimeLocations.filter(c => c.crime_type === filterType)
    : crimeLocations;

  const totalCrimes = filteredLocations.length;
  const firCount = filteredLocations.filter(c => c.source === 'fir').length;
  const criminalCount = filteredLocations.filter(c => c.source === 'criminal').length;

  // Default center: India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="with-sidebar">
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-3">Loading crime hotspot data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-3 px-3">
          {/* Header - Single Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            <div>
              <h2 className="fw-bold mb-0" style={{ fontSize: '1.2rem', color: '#1a202c' }}>
                <i className="fas fa-map-marked-alt me-2" style={{ color: '#e74c3c' }}></i>
                Crime Hotspot Map
              </h2>
            </div>
            <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i>Back
            </button>
          </div>

          {error && <Alert variant="danger" className="mb-3" style={{ borderRadius: '10px' }}>{error}</Alert>}

          {/* Stats Grid - 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            <Card className="border-0 shadow-sm" style={{ borderLeft: '5px solid #e74c3c' }}>
              <Card.Body className="py-3 px-3">
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Mapped Crimes</p>
                <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem', color: '#e74c3c' }}>{totalCrimes}</h3>
              </Card.Body>
            </Card>
            <Card className="border-0 shadow-sm" style={{ borderLeft: '5px solid #4e73df' }}>
              <Card.Body className="py-3 px-3">
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>From FIRs</p>
                <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem', color: '#4e73df' }}>{firCount}</h3>
              </Card.Body>
            </Card>
            <Card className="border-0 shadow-sm" style={{ borderLeft: '5px solid #1cc88a' }}>
              <Card.Body className="py-3 px-3">
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Crime Record</p>
                <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem', color: '#1cc88a' }}>{criminalCount}</h3>
              </Card.Body>
            </Card>
            <Card className="border-0 shadow-sm" style={{ borderLeft: '5px solid #f6c23e' }}>
              <Card.Body className="py-3 px-3">
                <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Crime Types</p>
                <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem', color: '#f6c23e' }}>{crimeTypes.length}</h3>
              </Card.Body>
            </Card>
          </div>

          {/* Map Container with Filters on Right */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {/* Map */}
            <div style={{ flex: 1 }}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  {filteredLocations.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-map-marked-alt" style={{ fontSize: '3rem', opacity: 0.15 }}></i>
                      <p className="text-muted mt-3">
                        No geo-tagged crime data found. Add latitude and longitude when filing FIRs or adding criminal records to see them on the map.
                      </p>
                    </div>
                  ) : (
                    <div style={{ height: '280px', width: '100%' }}>
                      <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                        dragging={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitBounds points={filteredLocations} />
                        <MarkerClusterGroup
                          points={filteredLocations}
                          visible={viewMode === 'cluster' || viewMode === 'both'}
                        />
                        <HeatmapLayer
                          points={filteredLocations}
                          visible={viewMode === 'heatmap' || viewMode === 'both'}
                        />
                      </MapContainer>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Filters on Right */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <Form.Label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  <i className="fas fa-layer-group me-1" style={{ color: '#667eea' }}></i>Map View
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  style={{ borderRadius: '6px', border: '1.5px solid #e0e0e0', fontSize: '0.75rem', padding: '5px 8px' }}
                >
                  <option value="cluster">Cluster</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="both">Both</option>
                </Form.Select>
              </div>
              <div>
                <Form.Label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  <i className="fas fa-filter me-1" style={{ color: '#f59e0b' }}></i>Filter Crime
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ borderRadius: '6px', border: '1.5px solid #e0e0e0', fontSize: '0.75rem', padding: '5px 8px' }}
                >
                  <option value="">All ({crimeLocations.length})</option>
                  {crimeTypes.map(t => {
                    const count = crimeLocations.filter(c => c.crime_type === t).length;
                    return <option key={t} value={t}>{t}</option>;
                  })}
                </Form.Select>
              </div>
              <div style={{ padding: '10px 8px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                <Badge bg="secondary" style={{ fontSize: '0.7rem', display: 'block' }}>
                  <i className="fas fa-map-marker-alt me-1"></i>{filteredLocations.length} markers
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default CrimeHotspotMap;
