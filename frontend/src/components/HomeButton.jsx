import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeButton = ({ lang = 'en' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/camera')}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
    >
      🏠 {lang === 'hi' ? 'होम' : 'Home'}
    </button>
  );
};

export default HomeButton; 