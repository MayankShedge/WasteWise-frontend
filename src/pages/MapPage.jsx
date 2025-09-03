import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- Custom Icon Logic (remains the same) ---
const baseIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
});
const greenIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' });
const blueIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' });
const goldIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png' });
const redIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });
const purpleIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png' });
const orangeIcon = new baseIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png' });

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


const MapPage = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // --- NEW: State to hold the map instance ---
    const [map, setMap] = useState(null);

    const naviMumbaiPosition = [19.0330, 73.0297];

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/locations');
                setLocations(data);
            } catch (err) {
                setError('Failed to load disposal locations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // --- NEW: useEffect to handle window resizing ---
    useEffect(() => {
        const handleResize = () => {
            if (map) {
                // This command tells Leaflet to re-calculate its size
                map.invalidateSize();
            }
        };

        // Set up the event listener
        window.addEventListener('resize', handleResize);

        // Also invalidate size right after the map is created to fix initial render issues
        if (map) {
            setTimeout(() => map.invalidateSize(), 100);
        }

        // Clean up the event listener when the component is unmounted
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [map]); // This effect will run whenever the map instance is ready


    if (loading) return <div className="text-center p-8 text-gray-500">Loading Map...</div>;
    if (error) return <div className="text-center p-8 text-red-500 font-bold">{error}</div>;

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Disposal Map</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Find the nearest recycling and disposal centers in Navi Mumbai.</p>
            </div>
            <div className="h-[500px] md:h-[600px] w-full rounded-lg shadow-lg overflow-hidden border">
                <MapContainer
                    center={naviMumbaiPosition}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    // --- NEW: Get a reference to the map instance ---
                    ref={setMap}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {locations.map(location => (
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
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;

