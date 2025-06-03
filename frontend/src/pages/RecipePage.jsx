import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';

const RecipePage = () => {
  const location = useLocation();
  const detectedVeggies = location.state?.detectedVeggies || [];

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
  const [loading, setLoading] = useState(false);

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

  if (detectedVeggies.length === 0) {
    return (
      <div className="p-4 text-red-600 font-semibold">
        ❌ No vegetables detected. Please go back and scan first.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <DarkModeToggle />
      </div>
      <h1 className="text-2xl font-bold mb-2">🍳 Recipe Generator</h1>

      <PreferencesForm
        preferences={preferences}
        setPreferences={setPreferences}
        onSubmit={handleSubmit}
      />

      {loading && <p className="mt-4">🔄 Generating recipe...</p>}

      {recipe && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">👨‍🍳 Generated Recipe</h2>
          <pre className="whitespace-pre-wrap">{recipe}</pre>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                const title = recipe.split('\n')[0]; // use first line as title
                await axios.post(
                  'http://localhost:5000/api/recipe/save',
                  { title, content: recipe },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('✅ Recipe saved successfully!');
              } catch (err) {
                console.error(err);
                alert('Please Login to save recipe');
              }
            }}
          >
            💾 Save Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipePage;
