WasteWise - Your Smart Waste Segregation Guide ♻️
This repository contains the complete frontend for the WasteWise application, a modern, responsive, and feature-rich platform designed to help the residents of Navi Mumbai manage their waste more effectively. Built with React and Vite, this application provides a seamless user experience on both desktop and mobile devices.

Live Site URL: https://wastewise-navi-mumbai.vercel.app/ (Note: This is your live site URL, feel free to share it!)

Key Features
Custom AI-Powered Waste Scanner: The core feature of the app! Users can upload a photo of a waste item, and a custom-trained AI model (built using Teachable Machine and TensorFlow.js) classifies it as "Wet Waste" or "Dry Waste" directly in the browser, providing instant feedback.

Interactive Disposal Map: A fully interactive map (built with React Leaflet) that displays the locations of various disposal centers across Navi Mumbai. The map features color-coded pins for different categories like E-Waste, General Recycling, and Battery Drop-offs.

Complete Gamification System: To encourage user engagement, the app includes:

Points System: Users earn points for every item they scan.

Badge System: Users unlock badges at different point milestones, which are displayed on their profile.

Public Leaderboard: A page showcasing the top contributors, fostering a sense of community.

Personalized User Profiles: Logged-in users have a dedicated "My Impact" page where they can view their total points, current badge, and a complete history of all the items they've scanned.

Full Admin Dashboard: A secure, role-protected section of the app with a tabbed interface where administrators can:

View and manage all user-submitted community reports.

Create, edit, and delete waste collection schedules.

Create, edit, and delete educational articles.

View an Analytics Dashboard with charts (built with Chart.js) displaying key metrics like daily scans and category breakdowns.

Community & Educational Features:

Users can report local waste issues by uploading a photo.

A public "Tips & Articles" section where users can read educational content managed by the admin.

Fully Responsive Design: The entire application is built with a mobile-first approach using Tailwind CSS, ensuring a seamless experience on any device.

Tech Stack
Framework: React with Vite

Styling: Tailwind CSS

Routing: React Router DOM

API Communication: Axios

Mapping: React Leaflet

Charting: Chart.js

AI/ML: TensorFlow.js

Local Setup & Installation
To run this frontend application locally, follow these steps:

Clone the repository:

git clone [https://github.com/your-username/WasteWise-frontend.git](https://github.com/your-username/WasteWise-frontend.git)
cd WasteWise-frontend

Install dependencies:

npm install

Set up Environment Variables:
Create a .env file in the root directory and add the following variable. This should point to your locally running backend server.

VITE_API_URL=http://localhost:5001

Start the development server:

npm run dev

The application will now be running on http://localhost:5173.