import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <DarkModeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </DarkModeProvider>
);
