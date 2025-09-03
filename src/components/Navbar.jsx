import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getNavLinkClass = ({ isActive }) =>
        isActive
            ? "text-green-600 border-b-2 border-green-600 font-semibold"
            : "text-gray-600 hover:text-green-600 transition-colors";
    
    const getMobileNavLinkClass = ({ isActive }) =>
        isActive
            ? "block py-2 px-4 text-sm bg-green-100 text-green-700 font-semibold"
            : "block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100";

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 py-3">
                <div className="flex justify-between items-center">
                    <NavLink to="/" className="text-2xl font-bold text-green-600 flex items-center">
                        <span role="img" aria-label="recycle" className="mr-2 text-3xl">♻️</span>
                        WasteWise
                    </NavLink>

                    {/* --- Desktop Menu (Now appears on large screens 'lg') --- */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <NavLink to="/" className={getNavLinkClass}>Scan Waste</NavLink>
                        <NavLink to="/map" className={getNavLinkClass}>Disposal Map</NavLink>
                        <NavLink to="/guide" className={getNavLinkClass}>Segregation Guide</NavLink>
                        <NavLink to="/leaderboard" className={getNavLinkClass}>Leaderboard</NavLink>
                        <NavLink to="/articles" className={getNavLinkClass}>Articles</NavLink>
                        {userInfo && !userInfo.isAdmin && (<NavLink to="/report-issue" className={getNavLinkClass}>Report Issue</NavLink>)}
                        {userInfo && userInfo.isAdmin && (<NavLink to="/admin/dashboard" className={getNavLinkClass}>Admin Dashboard</NavLink>)}
                    </div>

                    {/* --- User Info / Login Buttons (Desktop) (Now appears on large screens 'lg') --- */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {userInfo ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{getInitials(userInfo.name)}</div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-gray-700 font-medium">{userInfo.name}</span>
                                        <span className="text-sm font-bold text-yellow-600">{userInfo.points} Points</span>
                                    </div>
                                </Link>
                                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600">Logout</button>
                            </div>
                        ) : (
                            <>
                                <NavLink to="/login" className="text-gray-600 hover:text-green-600 font-semibold">Login</NavLink>
                                <NavLink to="/register" className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700">Register</NavLink>
                            </>
                        )}
                    </div>

                    {/* --- Hamburger Menu Button (Now hides on large screens 'lg') --- */}
                    <div className="lg:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-green-600 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- Mobile Menu (Now hides on large screens 'lg') --- */}
                {isMenuOpen && (
                    <div className="lg:hidden mt-4 bg-white rounded-lg shadow-xl">
                        <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Scan Waste</NavLink>
                        <NavLink to="/map" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Disposal Map</NavLink>
                        <NavLink to="/guide" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Segregation Guide</NavLink>
                        <NavLink to="/leaderboard" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Leaderboard</NavLink>
                        <NavLink to="/articles" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Articles</NavLink>
                        {userInfo && !userInfo.isAdmin && (<NavLink to="/report-issue" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Report Issue</NavLink>)}
                        {userInfo && userInfo.isAdmin && (<NavLink to="/admin/dashboard" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Admin Dashboard</NavLink>)}
                        
                        <div className="border-t border-gray-200 mt-2 pt-2">
                             {userInfo ? (
                                <>
                                    <Link to="/profile" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                                        <div className="font-bold">{userInfo.name}</div>
                                        <div className="text-xs text-yellow-600">{userInfo.points} Points</div>
                                    </Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 font-semibold hover:bg-gray-100">Logout</button>
                                </>
                             ) : (
                                <>
                                    <NavLink to="/login" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                                    <NavLink to="/register" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Register</NavLink>
                                </>
                             )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;

