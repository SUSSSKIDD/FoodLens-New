import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import RecipePage from './pages/RecipePage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import CookingPage from './pages/CookingPage';
import CookHistoryPage from './pages/CookHistoryPage';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import DarkModeToggle from './components/DarkModeToggle';
import SavedRecipesButton from './components/SavedRecipesButton';
import CookHistoryButton from './components/CookHistoryButton';
import HomeButton from './components/HomeButton';
import LogoutButton from './components/LogoutButton';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name}! 🌱
        </h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <SavedRecipesButton />
          <CookHistoryButton />
          <HomeButton />
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
};

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen transition-all duration-300 bg-white dark:bg-gray-900">
          <div className="text-black dark:text-white">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/home" element={<Layout><HomePage /></Layout>} />
              <Route path="/camera" element={<Layout><CameraPage /></Layout>} />
              <Route path="/recipe" element={<Layout><RecipePage /></Layout>} />
              <Route path="/saved" element={<Layout><SavedRecipesPage /></Layout>} />
              <Route path="/cook" element={<CookingPage />} />
              <Route path="/cook/:id" element={<CookingPage />} />
              <Route path="/history" element={<Layout><CookHistoryPage /></Layout>} />
            </Routes>
          </div>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
