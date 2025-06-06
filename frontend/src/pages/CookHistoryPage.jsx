import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CookHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState({});
  const [showLanguageSelect, setShowLanguageSelect] = useState({});
  const [langModal, setLangModal] = useState({ show: false, recipe: null, step: 0, defaultLang: 'en' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/recipe/cooked', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.history);
      } catch (err) {
        console.error(err);
        alert('Failed to load cook history');
      }
    };
    fetchHistory();
  }, []);

  const getLanguageContent = (recipe, lang) => {
    const parts = recipe.content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    return lang === 'hi'
      ? parts[1]?.trim() || '❌ Hindi version not available.'
      : parts[0]?.trim();
  };

  const toggleLanguage = (id) => {
    setLanguage((prev) => {
      const newLang = prev[id] === 'hi' ? 'en' : 'hi';
      setLangPref(newLang);
      return {
        ...prev,
        [id]: newLang,
      };
    });
  };

  // Get last step for a recipe from localStorage
  const getLastStep = (id) => {
    const progress = localStorage.getItem(`cookingProgress_${id}`);
    if (progress) {
      try {
        const { currentStep } = JSON.parse(progress);
        return typeof currentStep === 'number' ? currentStep : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  // Save language preference
  const setLangPref = (lang) => {
    localStorage.setItem('cookingLang', lang);
  };
  // Get language preference
  const getLangPref = () => {
    return localStorage.getItem('cookingLang') || 'en';
  };

  // Check if recipe is completed (last step)
  const isCompleted = (id, instructions) => {
    const lastStep = getLastStep(id);
    return lastStep >= instructions.length - 1;
  };

  // Parse instructions from recipe content
  const getInstructions = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const contentToUse = lang === 'hi' ? parts[1] || '' : parts[0];
    const match = contentToUse.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*?)(?=\*\*Approximate|$)/i);
    if (match) {
      return match[1]
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.trim().replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  };

  // Get continue-later info for a recipe from localStorage
  const getContinueLaterInfo = (recipe) => {
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    const progress = localStorage.getItem(`cookingProgress_${recipeKey}`);
    if (progress) {
      try {
        const { currentStep, lastLeftAt, lang } = JSON.parse(progress);
        return { currentStep, lastLeftAt, lang };
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleContinueCooking = (recipe, lang, step) => {
    // Save progress to localStorage for CookingPage to pick up
    localStorage.setItem('cookingProgress', JSON.stringify({
      recipe: { title: recipe.title, content: recipe.content },
      currentStep: step,
      lang
    }));
    localStorage.setItem('cookingLang', lang);
    navigate('/cook', {
      state: {
        recipe: { title: recipe.title, content: recipe.content },
        lang
      }
    });
  };

  const handleCookAgain = async (recipe, lang, id) => {
    // Update cookedAt in backend
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/recipe/cooked/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Optionally handle error
    }
    // Reset progress to step 0
    localStorage.setItem('cookingProgress', JSON.stringify({
      recipe: { title: recipe.title, content: recipe.content },
      currentStep: 0,
      lang
    }));
    setLangPref(lang);
    navigate('/cook', {
      state: {
        recipe: { title: recipe.title, content: recipe.content },
        lang
      }
    });
  };

  // Handler for yellow Continue Cooking button
  const handlePromptLanguage = (recipe, continueInfo) => {
    // If continueInfo exists, use its step and lang, otherwise start from step 0 and use global lang
    const stepToResume = continueInfo?.currentStep || 0;
    const langToUse = continueInfo?.lang || getLangPref() || 'en';

    setLangModal({
      show: true,
      recipe,
      step: stepToResume,
      defaultLang: langToUse
    });
  };

  // Handler for language selection
  const handleSelectLang = (lang) => {
    if (!langModal.recipe) return;
    handleContinueCooking(langModal.recipe, lang, langModal.step);
    setLangModal({ show: false, recipe: null, step: 0, defaultLang: 'en' });
  };

  // Save to Saved Recipes handler
  const handleSaveToSavedRecipes = async (recipe) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/recipe/save',
        { title: recipe.title, content: recipe.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Recipe saved to your saved recipes!');
    } catch (err) {
      alert('❌ Failed to save recipe. Please login.');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {history.length === 0 ? (
        <p className="text-center text-gray-500">You haven't cooked any recipes yet.</p>
      ) : (
        <ul className="space-y-8">
          {history.map((r) => {
            // Determine language for this recipe card
            const lang = language[r._id] || r.language || 'en';
            const instructions = getInstructions(r.content, lang);
            const completed = isCompleted(r._id, instructions);
            const continueInfo = getContinueLaterInfo(r);
            return (
              <li
                key={r._id}
                className="bg-white border p-4 rounded shadow-lg space-y-2"
              >
                {/* Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <input
                    className="text-lg font-semibold border-b p-1 flex-1 sm:mr-4"
                    value={r.title}
                    readOnly
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      className="text-blue-600 text-sm underline"
                      onClick={() => toggleLanguage(r._id)}
                    >
                      {lang === 'hi' ? '🔁 Show English' : '🔁 Show Hindi'}
                    </button>
                    {/* Continue Cooking button */}
                    {!completed && (
                      <button
                        onClick={() => handlePromptLanguage(r, continueInfo)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                      >
                        ▶️ Continue Cooking
                      </button>
                    )}
                  </div>
                </div>
                {/* Recipe Name Display */}
                <div className="font-bold mb-1">
                  {lang === 'hi' ? 'नाम: ' : 'Name: '}
                  {r.title}
                </div>
                {/* Recipe Text Area */}
                <textarea
                  className="w-full border rounded p-3 text-sm resize-none overflow-y-auto h-52 sm:h-64 md:h-80 lg:h-96"
                  style={{ lineHeight: '1.5' }}
                  value={getLanguageContent(r, lang)}
                  readOnly
                />
                {/* Save this Recipe Button (after completion) */}
                {isCompleted(r._id, getInstructions(r.content, lang)) && (
                  <button
                    onClick={() => handleSaveToSavedRecipes(r)}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    💾 Save this Recipe
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {/* Language Selection Modal */}
      {langModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-xs w-full">
            <h3 className="text-lg font-semibold mb-3 text-center">Select Language</h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleSelectLang('en')}
                className={`flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${langModal.defaultLang === 'en' ? 'ring-2 ring-blue-400' : ''}`}
              >
                English 🇬🇧
              </button>
              <button
                onClick={() => handleSelectLang('hi')}
                className={`flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${langModal.defaultLang === 'hi' ? 'ring-2 ring-blue-400' : ''}`}
              >
                Hindi 🇮🇳
              </button>
            </div>
            <button
              onClick={() => setLangModal({ show: false, recipe: null, step: 0, defaultLang: 'en' })}
              className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookHistoryPage;
