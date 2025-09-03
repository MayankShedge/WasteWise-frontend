import React from 'react';
import EditSchedule from './EditSchedule';

// This component acts as a wrapper for our schedule editing logic
const ManageSchedules = () => {
    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Manage Collection Schedules</h2>
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <EditSchedule />
            </div>
        </div>
    );
};

export default ManageSchedules;

