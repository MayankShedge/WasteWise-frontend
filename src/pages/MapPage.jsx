import React, { useState, useEffect} from 'react';
import api from '../api/axios.js';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const baseIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41],
        popupAnchor: [1, -34], shadowSize: [41, 41]
    }
});
const greenIcon   = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' });
const blueIcon    = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' });
const goldIcon    = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png' });
const redIcon     = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });
const purpleIcon  = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png' });
const orangeIcon  = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png' });
const userIcon    = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [30, 45], iconAnchor: [15, 45], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const getIcon = (locationType) => {
    if (locationType.includes('General') || locationType.includes('Plastic') || locationType.includes('Organic') || locationType.includes('Scrap')) return greenIcon;
    if (locationType.includes('E-Waste')) return blueIcon;
    if (locationType.includes('Battery')) return goldIcon;
    if (locationType.includes('Donation')) return purpleIcon;
    if (locationType.includes('Chemical') || locationType.includes('Hazardous')) return redIcon;
    return orangeIcon;
};
const getPopupTextColor = (locationType) => {
    if (locationType.includes('General') || locationType.includes('Plastic') || locationType.includes('Organic') || locationType.includes('Scrap')) return '#28a745';
    if (locationType.includes('E-Waste')) return '#007bff';
    if (locationType.includes('Battery')) return '#b8860b';
    if (locationType.includes('Donation')) return '#8A2BE2';
    if (locationType.includes('Chemical') || locationType.includes('Hazardous')) return '#DC143C';
    return '#FF8C00';
};
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
};


const severityConfig = {
    high:   { color: '#DC2626', fillColor: '#FCA5A5', label: 'High Activity' },
    medium: { color: '#D97706', fillColor: '#FCD34D', label: 'Medium Activity' },
    low:    { color: '#2563EB', fillColor: '#93C5FD', label: 'Low Activity' },
};


const HeatmapLayer = ({ clusters }) => {
    const map = useMap();

    useEffect(() => {
        if (!clusters.length) return;

        const points = clusters.map(c => [c.lat, c.lng, Math.min(c.count / 5, 1)]);

        const heatLayer = L.heatLayer(points, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            gradient: { 0.2: '#3B82F6', 0.5: '#F59E0B', 0.8: '#EF4444' }
        }).addTo(map);

        return () => map.removeLayer(heatLayer);
    }, [clusters, map]);

    return null;
};

const MapController = ({ selectedLocation }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedLocation) {
            map.setView([selectedLocation.geometry.coordinates[1], selectedLocation.geometry.coordinates[0]], 15);
        }
    }, [selectedLocation, map]);
    return null;
};

const MapPage = () => {
    const [locations, setLocations]             = useState([]);
    const [clusters, setClusters]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState('');
    const [map, setMap]                         = useState(null);
    const [userLocation, setUserLocation]       = useState(null);
    const [locationPermission, setLocationPermission] = useState('pending');
    const [nearbyLocations, setNearbyLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery]         = useState('');
    const [showNearbyPanel, setShowNearbyPanel] = useState(false);

    const [activeLayer, setActiveLayer] = useState('centers'); // 'centers' | 'reports'

    const naviMumbaiPosition = [19.0330, 73.0297];

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data } = await api.get('/api/locations');
                setLocations(data);
            } catch (err) {
                setError('Failed to load disposal locations.');
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchClusters = async () => {
            try {
                const { data } = await api.get('/api/locations/report-clusters');
                setClusters(data);
            } catch (err) {
                console.error('Could not load report clusters:', err.message);
            }
        };
        fetchClusters();
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            setLocationPermission('requesting');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(userPos);
                    setLocationPermission('granted');
                    if (map) map.setView([userPos.lat, userPos.lng], 13);
                    fetchNearbyLocations(userPos.lat, userPos.lng);
                },
                () => {
                    setLocationPermission('denied');
                    setError('Location access denied. Showing default area.');
                }
            );
        } else {
            setLocationPermission('unavailable');
        }
    };

    const fetchNearbyLocations = async (lat, lng) => {
        try {
            const { data } = await api.get(`/api/locations/nearby?lat=${lat}&lng=${lng}&maxDistance=10000`);
            setNearbyLocations(data);
        } catch (err) {
            const withDist = locations
                .map(l => ({ ...l, distanceKm: calculateDistance(lat, lng, l.geometry.coordinates[1], l.geometry.coordinates[0]) }))
                .sort((a, b) => a.distanceKm - b.distanceKm)
                .slice(0, 10);
            setNearbyLocations(withDist);
        }
    };

    useEffect(() => { getUserLocation(); }, []);

    useEffect(() => {
        const handleResize = () => { if (map) map.invalidateSize(); };
        window.addEventListener('resize', handleResize);
        if (map) setTimeout(() => map.invalidateSize(), 100);
        return () => window.removeEventListener('resize', handleResize);
    }, [map]);

    const filteredLocations = locations.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.locationType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center p-8 text-gray-500">Loading Map...</div>;

    return (
        <div className="relative h-screen flex flex-col bg-gray-50">

            <div className="bg-white shadow-sm p-4 z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-800">
                        ← Back
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-800">Find Waste Centers</h1>
                        <p className="text-sm text-gray-600">
                            Navi Mumbai • {nearbyLocations.length} centers nearby
                            {activeLayer === 'reports' && ` • ${clusters.length} hotspots`}
                        </p>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search centers, addresses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                        />
                        <div className="absolute right-3 top-3 text-gray-400">🔍</div>
                    </div>
                </div>

                <div className="mt-3 flex space-x-2">
                    <button
                        onClick={() => setActiveLayer('centers')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            activeLayer === 'centers'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        ♻️ Waste Centers
                    </button>
                    <button
                        onClick={() => setActiveLayer('reports')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors relative ${
                            activeLayer === 'reports'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        🔥 Report Heatmap
                        {clusters.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {clusters.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 relative">
                <MapContainer
                    center={userLocation ? [userLocation.lat, userLocation.lng] : naviMumbaiPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={setMap}
                >
                    <MapController selectedLocation={selectedLocation} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                            <Popup>
                                <div className="font-sans">
                                    <h4 className="font-bold text-md text-blue-600">📍 Your Location</h4>
                                    <p className="text-sm text-gray-600">Current position</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {activeLayer === 'centers' && (searchQuery ? filteredLocations : locations).map(location => (
                        <Marker
                            key={location._id}
                            position={[location.geometry.coordinates[1], location.geometry.coordinates[0]]}
                            icon={getIcon(location.locationType)}
                        >
                            <Popup>
                                <div className="font-sans">
                                    <h4 className="font-bold text-md">{location.name}</h4>
                                    <p className="text-sm text-gray-600">{location.address}</p>
                                    <p className="text-sm font-semibold mt-1" style={{ color: getPopupTextColor(location.locationType) }}>
                                        {location.locationType}
                                    </p>
                                    {userLocation && location.distanceKm && (
                                        <p className="text-xs text-gray-500 mt-1">📍 {location.distanceKm} km away</p>
                                    )}
                                    <button
                                        onClick={() => window.open(`https://maps.google.com/?q=${location.geometry.coordinates[1]},${location.geometry.coordinates[0]}`, '_blank')}
                                        className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {activeLayer === 'reports' && (
                        <>
                            <HeatmapLayer clusters={clusters} />

                            {clusters.map((cluster, index) => {
                                const cfg = severityConfig[cluster.severity];
                                return (
                                    <Circle
                                        key={index}
                                        center={[cluster.lat, cluster.lng]}
                                        radius={300}
                                        pathOptions={{
                                            color: cfg.color,
                                            fillColor: cfg.fillColor,
                                            fillOpacity: 0.5,
                                            weight: 2,
                                        }}
                                    >
                                        <Popup>
                                            <div className="font-sans min-w-[160px]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-sm text-gray-800">
                                                        🗺️ Issue Hotspot
                                                    </h4>
                                                    <span
                                                        className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                                                        style={{ backgroundColor: cfg.color }}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    <strong>{cluster.count}</strong> unresolved report{cluster.count > 1 ? 's' : ''} in this area
                                                </p>
                                                {cluster.reports.map((r, i) => (
                                                    <div key={i} className="text-xs text-gray-500 border-t pt-1 mt-1">
                                                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${r.status === 'new' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                                                        {r.description.slice(0, 50)}{r.description.length > 50 ? '...' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </Popup>
                                    </Circle>
                                );
                            })}
                        </>
                    )}
                </MapContainer>

                {activeLayer === 'reports' && clusters.length === 0 && (
                        <div
                            className="absolute top-24 left-1/2 transform -translate-x-1/2
                                    bg-white shadow-lg rounded-lg px-4 py-3 z-[1000]"
                        >
                            <p className="text-sm text-gray-600">
                            No report hotspots available yet.
                            </p>
                        </div>
                )}

                <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                    <button
                        onClick={getUserLocation}
                        className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        title="Get my location"
                    >
                        📍
                    </button>
                    <button
                        onClick={() => setShowNearbyPanel(!showNearbyPanel)}
                        className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        title="Show nearby centers"
                    >
                        📋
                    </button>
                </div>

                {activeLayer === 'reports' && (
                    <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-3 z-10 text-xs">
                        <p className="font-semibold text-gray-700 mb-2">Report Activity</p>
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-gray-600">High (5+ reports)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <span className="text-gray-600">Medium (2–4 reports)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="text-gray-600">Low (1 report)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showNearbyPanel && nearbyLocations.length > 0 && (
                <div className="bg-white border-t border-gray-200 max-h-64 overflow-y-auto z-10">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">Nearest Centers</h3>
                            <button onClick={() => setShowNearbyPanel(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-3">
                            {nearbyLocations.slice(0, 5).map((location) => (
                                <div
                                    key={location._id}
                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedLocation(location); setShowNearbyPanel(false); }}
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPopupTextColor(location.locationType) }}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{location.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{location.locationType}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-sm font-medium text-gray-900">{location.distanceKm} km</p>
                                        <p className="text-xs text-gray-500">~{Math.round(location.distanceKm * 3)} min</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {locationPermission === 'denied' && (
                <div className="absolute top-20 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg z-10">
                    <p className="text-sm">
                        📍 Enable location access to find the nearest waste centers.
                        <button onClick={getUserLocation} className="ml-2 underline font-medium hover:no-underline">
                            Try Again
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

export default MapPage;