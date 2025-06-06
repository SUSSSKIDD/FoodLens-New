import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';
import { useNavigate } from 'react-router-dom';

const SavedRecipesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [recipes, setRecipes] = useState([]);
  const [language, setLanguage] = useState({});
  const [showLanguageSelect, setShowLanguageSelect] = useState({});

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/recipe/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data.recipes);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch saved recipes');
      }
    };

    fetchRecipes();
  }, []);

  const updateRecipe = async (id, title, content) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/recipe/${id}`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('✅ Recipe updated!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update recipe');
    }
  };

  const deleteRecipe = async (id) => {
    const confirm = window.confirm('Delete this recipe?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/recipe/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete recipe');
    }
  };

  const handleChange = (id, field, value) => {
    setRecipes((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    );
  };

  const toggleLanguage = (id) => {
    setLanguage((prev) => ({
      ...prev,
      [id]: prev[id] === 'hi' ? 'en' : 'hi',
    }));
  };

  const getLanguageContent = (recipe, lang) => {
    const parts = recipe.content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    return lang === 'hi'
      ? parts[1]?.trim() || '❌ Hindi version not available.'
      : parts[0]?.trim();
  };

  const extractNutrition = (content) => {
    const block = content.split(/[*]{2}Approximate Nutritional Value.*[*]{2}/i)[1];
    if (!block) return [];
  
    const nutritionLines = [];
    const lines = block.trim().split('\n');
  
    for (let line of lines) {
      if (!line.trim().startsWith('*')) break; // stop at first non-* line
      const [label, value] = line.replace('*', '').split(':');
      if (label && value) {
        nutritionLines.push({
          label: label.trim(),
          value: value.trim()
        });
      }
    }
  
    return nutritionLines;
  };

  const handleStartCooking = async (recipe, selectedLang) => {
    try {
      const token = localStorage.getItem('token');
      // Save to cook history
      await axios.post(
        'http://localhost:5000/api/recipe/cooked',
        {
          title: recipe.title,
          content: recipe.content,
          language: selectedLang
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Set up localStorage progress for this recipe
      const recipeKey = recipe.title.replace(/\s+/g, '_');
      localStorage.setItem(
        `cookingProgress_${recipeKey}`,
        JSON.stringify({
          recipe: { title: recipe.title, content: recipe.content },
          currentStep: 0,
          lang: selectedLang,
          lastLeftAt: new Date().toISOString()
        })
      );
      localStorage.setItem('cookingProgress', JSON.stringify({
        recipe: { title: recipe.title, content: recipe.content },
        currentStep: 0,
        lang: selectedLang
      }));
      localStorage.setItem('cookingLang', selectedLang);
      // Navigate to cooking page
      navigate('/cook', {
        state: {
          recipe: { title: recipe.title, content: recipe.content },
          lang: selectedLang
        }
      });
    } catch (err) {
      console.error(err);
      alert('Please Login to start cooking');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Saved Recipes Page</h2>

      {recipes.length === 0 ? (
        <p className="text-center">No saved recipes yet.</p>
      ) : (
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-8">
            {recipes.map((r) => (
              <li
                key={r._id}
                className="bg-white border p-4 rounded shadow-lg space-y-2"
              >
                {/* Title + Save/Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <input
                    className="text-lg font-semibold border-b p-1 flex-1 sm:mr-4"
                    value={r.title}
                    onChange={(e) =>
                      handleChange(r._id, 'title', e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                      onClick={() =>
                        updateRecipe(r._id, r.title, r.content)
                      }
                    >
                      💾 Save
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                      onClick={() => deleteRecipe(r._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Language Toggle */}
                <div className="text-right">
                  <button
                    className="text-blue-600 text-sm underline"
                    onClick={() => toggleLanguage(r._id)}
                  >
                    {language[r._id] === 'hi'
                      ? '🔁 Show English'
                      : '🔁 Show Hindi'}
                  </button>
                </div>

                {/* Recipe Text Area */}
                <textarea
                  className="w-full border rounded p-3 text-sm resize-none overflow-y-auto 
                             h-52 sm:h-64 md:h-80 lg:h-96"
                  style={{ lineHeight: '1.5' }}
                  value={getLanguageContent(r, language[r._id] || 'en')}
                  onChange={(e) =>
                    handleChange(r._id, 'content', e.target.value)
                  }
                />

                {/* Start Cooking Button */}
                <button
                  onClick={() => setShowLanguageSelect({ ...showLanguageSelect, [r._id]: true })}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  🍳 Let's get our meal ready
                </button>

                {/* Language Selection Modal */}
                {showLanguageSelect[r._id] && (
                  <div className="mt-4 p-4 bg-white rounded shadow border">
                    <h3 className="text-lg font-semibold mb-3">Select Language</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleStartCooking(r, 'en')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        English 🇬🇧
                      </button>
                      <button
                        onClick={() => handleStartCooking(r, 'hi')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Hindi 🇮🇳
                      </button>
                    </div>
                  </div>
                )}

                {/* Nutrition Block */}
                <div className="mt-3">
                  <h4 className="font-semibold mb-1">
                    🥗 Nutrition (per serving):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractNutrition(r.content).map((n, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full border border-green-300"
                      >
                        {n.label}: {n.value}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SavedRecipesPage;
