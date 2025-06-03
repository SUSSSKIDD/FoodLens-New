import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import RecipePage from './pages/RecipePage';
import SavedRecipesPage from './pages/SavedRecipesPage';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen transition-all duration-300 bg-white dark:bg-gray-900">
          <div className="text-black dark:text-white">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/recipe" element={<RecipePage />} />
              <Route path="/saved" element={<SavedRecipesPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
