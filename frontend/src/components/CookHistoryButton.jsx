import React from 'react';
import { useNavigate } from 'react-router-dom';

const CookHistoryButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/history')}
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors duration-200"
    >
      📋 Cook History
    </button>
  );
};

export default CookHistoryButton; 