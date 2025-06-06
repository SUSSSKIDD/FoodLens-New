import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const detectedVeggies = location.state?.detectedVeggies || [];
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [preferences, setPreferences] = useState({
    servingSize: 2,
    cuisine: 'Indian',
    mealType: 'Lunch',
    diet: 'Veg',
    allergy: '',
    lactose: 'Yes',
    diabetic: 'No',
    cookingTime: '<30 mins',
    healthGoal: '',
    spicyLevel: 2
  });

  const [recipe, setRecipe] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/recipe/generate', {
        ingredients: detectedVeggies.map((d) => d.label),
        preferences
      });
      setRecipe(res.data.recipe);
    } catch (err) {
      console.error(err);
      alert('Failed to generate recipe');
    }
    setLoading(false);
  };

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const title = recipe.split('\n')[0]; // use first line as title
      const res = await axios.post(
        'http://localhost:5000/api/recipe/save',
        { title, content: recipe },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipeId(res.data.recipe._id);
      alert('✅ Recipe saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Please Login to save recipe');
    }
  };

  const handleStartCooking = (language) => {
    const title = recipe.split('\n')[0];
    const content = recipe.split('\n').slice(1).join('\n');
    navigate('/cook', { 
      state: { 
        recipe: { title, content },
        lang: language
      }
    });
  };

  if (detectedVeggies.length === 0) {
    return (
      <div className="p-4 text-red-600 font-semibold">
        ❌ No vegetables detected. Please go back and scan first.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name}! 🌱
        </h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <SavedRecipesButton />
          <LogoutButton />
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Recipe Page</h2>
      <PreferencesForm
        preferences={preferences}
        setPreferences={setPreferences}
        onSubmit={handleSubmit}
      />

      {loading && <p className="mt-4">🔄 Generating recipe...</p>}

      {recipe && (
        <>
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">👨‍🍳 Generated Recipe</h2>
            <pre className="whitespace-pre-wrap">{recipe}</pre>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleSaveRecipe}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                💾 Save Recipe
              </button>

              <button
                onClick={() => setShowLanguageSelect(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                🍳 Let's get our meal ready
              </button>
            </div>

            {showLanguageSelect && (
              <div className="mt-4 p-4 bg-white rounded shadow">
                <h3 className="text-lg font-semibold mb-3">Select Language</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStartCooking('en')}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    English 🇬🇧
                  </button>
                  <button
                    onClick={() => handleStartCooking('hi')}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Hindi 🇮🇳
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecipePage;
