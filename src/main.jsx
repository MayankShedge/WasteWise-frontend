import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import App from './App.jsx';
import './index.css';

// Import all components and pages
import AdminRoute from './components/AdminRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import ManageReports from './components/ManageReports.jsx';
import ManageSchedules from './components/ManageSchedules.jsx';
import ManageArticles from './components/ManageArticles.jsx';
import ScannerPage from './pages/ScannerPage.jsx';
import MapPage from './pages/MapPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ReportIssuePage from './pages/ReportIssue.jsx';
import LeaderboardPage from './pages/Leaderboard.jsx';
import AdminAnalyticsPage from './pages/AdminAnalytics.jsx'; 
import ArticlesPage from './pages/Articles.jsx';
import ArticleDetailPage from './pages/ArticleDetail.jsx';

import { AuthProvider } from './context/AuthContext.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Publicly accessible routes
      { index: true, element: <ScannerPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/:id', element: <ArticleDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      
      // Routes protected for any logged-in user
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'report-issue', element: <ReportIssuePage /> }
        ]
      },
      
      // Admin Routes with Tabbed Layout
      {
        path: '/admin/dashboard',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminDashboard />,
            children: [
               { index: true, element: <ManageReports /> }, 
               { path: 'reports', element: <ManageReports /> },
               { path: 'schedules', element: <ManageSchedules /> },
               { path: 'analytics', element: <AdminAnalyticsPage /> },
               { path: 'articles', element: <ManageArticles /> }
            ]
          }
        ]
      }
    ],
  },
  {
    path: '/verify-email/:token',
    element: <VerificationPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

