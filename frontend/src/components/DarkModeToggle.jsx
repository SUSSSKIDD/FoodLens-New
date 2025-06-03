import React, { useContext } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const DarkModeToggle = () => {
  const { isDark, setIsDark } = useContext(DarkModeContext);

  const handleToggle = () => {
    console.log('Current dark mode:', isDark);
    setIsDark(!isDark);
    console.log('New dark mode value:', !isDark);
  };

  return (
    <button
      onClick={handleToggle}
      className="transition-all duration-200 px-4 py-2 rounded-lg border-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
    >
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;
