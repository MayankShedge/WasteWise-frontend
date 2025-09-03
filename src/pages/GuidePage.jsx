import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A reusable component for displaying a list of items
const WasteCategoryCard = ({ title, items, binColor, bgColor, borderColor }) => (
  <div className={`p-6 rounded-lg shadow-md ${bgColor} border-2 ${borderColor}`}>
    <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${binColor}`}>{title}</h3>
    <ul className="space-y-2 text-gray-700">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className={`mr-2 mt-1 ${binColor}`}>✔</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const GuidePage = () => {
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/guide');
        setGuideData(data);
      } catch (err) {
        setError('Failed to load the guide. Please try again later.');
        console.error('Fetch Guide Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Loading Guide...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500 font-bold">{error}</div>;
  }

  return (
    // --- RESPONSIVE CHANGES APPLIED ---
    <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Segregation Guide</h1>
        <p className="text-md sm:text-lg text-gray-600 mt-2">Learn how to segregate your waste correctly in Navi Mumbai.</p>
      </div>

      {guideData && (
        <div className="space-y-12">
          {/* Waste Categories Section: Stacks on mobile, grid on medium screens */}
          <div className="grid md:grid-cols-2 gap-8">
            <WasteCategoryCard
              title={guideData.wetWaste.title}
              items={guideData.wetWaste.items}
              binColor="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-200"
            />
            <WasteCategoryCard
              title={guideData.dryWaste.title}
              items={guideData.dryWaste.items}
              binColor="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
            />
          </div>

          {/* Collection Schedule Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">Waste Collection Schedule</h2>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-4">
              {guideData.schedules.map((schedule, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h4 className="font-semibold text-md sm:text-lg text-gray-700">{schedule.area}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{schedule.collection}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidePage;

