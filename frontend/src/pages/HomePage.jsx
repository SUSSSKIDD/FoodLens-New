// frontend/src/pages/HomePage.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from '../components/DarkModeToggle';

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <DarkModeToggle />
      </div>
      <h1 className="text-2xl font-bold">
        {greeting}, {user?.name || 'User'}! 🌱
      </h1>
      <button
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;
