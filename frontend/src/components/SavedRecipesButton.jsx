import React from 'react';
import { useNavigate } from 'react-router-dom';

const SavedRecipesButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/saved')}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
    >
      📚 Saved Recipes
    </button>
  );
};

export default SavedRecipesButton; 