import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';

const LOCATION_TYPES = [
    'General Recycling', 'E-Waste', 'Battery Drop-off', 'Waste Management',
    'Plastic Recycling', 'Organic Recycling', 'Scrap Metal', 'Environmental Services',
    'Chemical Waste Management', 'Battery Recycling Plant', 'Reuse Donation Shelf',
    'Reuse Donation Box', 'E-Waste Pickup', 'Municipal Waste Collection',
    'Composting Center', 'Construction Waste', 'Bio-Medical Waste',
    'Industrial Waste Management', 'Corporate Waste Management', 'Industrial Recycling',
    'NGO Collection Point', 'Community Collection', 'Multi-Material Recycling',
    'Vehicle Scrap', 'Water Treatment Facility', 'Educational Collection',
    'Transport Collection', 'Event Collection Point', 'Paper Recycling',
    'Mall Collection Point', 'Residential Collection'
];

const emptyForm = {
    name: '',
    address: '',
    locationType: 'General Recycling',
    latitude: '',
    longitude: '',
    operatingHours: '',
};

const ManageLocations = () => {
    const [locations, setLocations]     = useState([]);
    const [form, setForm]               = useState(emptyForm);
    const [editingId, setEditingId]     = useState(null);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg]   = useState('');
    const { userInfo } = useAuth();

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    const fetchLocations = useCallback(async () => {
        try {
            const { data } = await api.get('/api/locations');
            setLocations(data);
        } catch (err) {
            setError('Failed to load locations.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLocations(); }, [fetchLocations]);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleGeocode = async () => {
        if (!form.address) return alert('Enter an address first.');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=1`
            );
            const data = await res.json();
            if (data.length > 0) {
                setForm(prev => ({
                    ...prev,
                    latitude: parseFloat(data[0].lat).toFixed(6),
                    longitude: parseFloat(data[0].lon).toFixed(6),
                }));
                showSuccess('Coordinates auto-filled from address!');
            } else {
                alert('Could not find coordinates for this address. Enter manually.');
            }
        } catch {
            alert('Geocoding failed. Please enter coordinates manually.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.latitude || !form.longitude) {
            return alert('Coordinates are required. Use "Auto-fill" or enter manually.');
        }

        const payload = {
            name: form.name,
            address: form.address,
            locationType: form.locationType,
            operatingHours: form.operatingHours || 'N/A',
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
            },
        };

        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/api/locations/${editingId}`, payload, config);
                showSuccess('Location updated successfully!');
            } else {
                await api.post('/api/locations', payload, config);
                showSuccess('Location added successfully!');
            }
            resetForm();
            fetchLocations();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save location.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (location) => {
        setForm({
            name: location.name,
            address: location.address,
            locationType: location.locationType,
            latitude: location.geometry.coordinates[1],
            longitude: location.geometry.coordinates[0],
            operatingHours: location.operatingHours || '',
        });
        setEditingId(location._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this location permanently?')) return;
        try {
            await api.delete(`/api/locations/${id}`, config);
            showSuccess('Location deleted.');
            fetchLocations();
        } catch {
            alert('Failed to delete location.');
        }
    };

    const filtered = locations.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.locationType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <p>Loading locations...</p>;

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Manage Locations</h2>

            {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
                    ✅ {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    {editingId ? '✏️ Edit Location' : '➕ Add New Location'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            name="name" value={form.name} onChange={handleChange} required
                            placeholder="e.g. Sai Recycling Center"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                        <div className="flex gap-2">
                            <input
                                name="address" value={form.address} onChange={handleChange} required
                                placeholder="e.g. Shop 4, Sector 17, Vashi, Navi Mumbai"
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none"
                            />
                            <button
                                type="button" onClick={handleGeocode}
                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                            >
                                📍 Auto-fill Coords
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                        <input
                            name="latitude" value={form.latitude} onChange={handleChange}
                            type="number" step="any" required
                            placeholder="e.g. 19.0330"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                        <input
                            name="longitude" value={form.longitude} onChange={handleChange}
                            type="number" step="any" required
                            placeholder="e.g. 73.0297"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location Type *</label>
                        <select
                            name="locationType" value={form.locationType} onChange={handleChange} required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none bg-white"
                        >
                            {LOCATION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                        <input
                            name="operatingHours" value={form.operatingHours} onChange={handleChange}
                            placeholder="e.g. 10:00 AM – 6:30 PM (Closed Sunday)"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button
                        type="submit" disabled={saving}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : editingId ? 'Update Location' : 'Add Location'}
                    </button>
                    {editingId && (
                        <button
                            type="button" onClick={resetForm}
                            className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <p className="text-sm text-gray-500">{filtered.length} of {locations.length} locations</p>
                <input
                    type="text"
                    placeholder="Search by name, address, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none text-sm"
                />
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-3">
                {filtered.length > 0 ? filtered.map(location => (
                    <div key={location._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg shadow gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{location.name}</p>
                            <p className="text-sm text-gray-500 truncate">{location.address}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    {location.locationType}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    🕐 {location.operatingHours}
                                </span>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                    📍 {location.geometry.coordinates[1].toFixed(4)}, {location.geometry.coordinates[0].toFixed(4)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 self-end sm:self-center">
                            <button
                                onClick={() => handleEdit(location)}
                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(location._id)}
                                className="text-red-600 hover:text-red-900 font-semibold text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">No locations found.</p>
                )}
            </div>
        </div>
    );
};

export default ManageLocations;