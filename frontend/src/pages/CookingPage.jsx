import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';
import CookHistoryButton from '../components/CookHistoryButton';

const CookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lang, setLang] = useState('en');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('cookingProgress');
    if (savedProgress) {
      const { recipe: savedRecipe, currentStep: savedStep, lang: savedLang } = JSON.parse(savedProgress);
      setRecipe(savedRecipe);
      setCurrentStep(savedStep);
      setLang(savedLang);
    } else {
      const recipeData = location.state?.recipe;
      const language = location.state?.lang || 'en';
      
      if (recipeData) {
        setRecipe(recipeData);
        setLang(language);
      } else {
        navigate('/camera');
      }
    }
  }, [location.state, navigate]);

  // Save progress whenever it changes
  useEffect(() => {
    if (recipe) {
      localStorage.setItem('cookingProgress', JSON.stringify({
        recipe,
        currentStep,
        lang
      }));
    }
  }, [recipe, currentStep, lang]);

  // Parse recipe content when recipe changes
  useEffect(() => {
    if (recipe) {
      const content = recipe.content;
      
      // Split content into English and Hindi sections
      const sections = content.split(/\*\*Hindi Translation\*\*/i);
      const englishContent = sections[0];
      const hindiContent = sections[1] || '';
      
      // Extract ingredients and instructions based on language
      const contentToUse = lang === 'hi' ? hindiContent : englishContent;
      
      // Extract ingredients
      const ingredientsMatch = contentToUse.match(/\*\*(?:Ingredients|सामग्री):\*\*\s*\n\*([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|\*\*Approximate|$)/i);
      if (ingredientsMatch) {
        const ingredientsList = ingredientsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.trim().replace(/^\*\s*/, '').trim());
        setIngredients(ingredientsList);
      }

      // Extract instructions
      const instructionsMatch = contentToUse.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*?)(?=\*\*Approximate|$)/i);
      if (instructionsMatch) {
        const instructionsList = instructionsMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.trim().replace(/^\d+\.\s*/, '').trim());
        setInstructions(instructionsList);
      }
    }
  }, [recipe, lang]);

  const startTimer = (minutes) => {
    if (timer) {
      clearInterval(timer);
    }
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
    const newTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const extractTimeFromStep = (step) => {
    if (!step) return null;
    const timeMatch = step.match(/(\d+)\s*(?:minutes|mins|min|मिनट)/i);
    return timeMatch ? parseInt(timeMatch[1]) : null;
  };

  // Add Continue Later handler
  const handleContinueLater = () => {
    if (!recipe) return;
    // Use a unique key for this recipe (by title+content hash or just title if unique)
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    localStorage.setItem(
      `cookingProgress_${recipeKey}`,
      JSON.stringify({
        recipe,
        currentStep,
        lang,
        lastLeftAt: new Date().toISOString()
      })
    );
    alert('Your progress has been saved! You can continue later from the Cook History page.');
    navigate('/history');
  };

  // Language toggle handler
  const handleToggleLanguage = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi';
    setLang(newLang);
    localStorage.setItem('cookingLang', newLang);
  };

  if (!recipe || !instructions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <p className="text-lg">Loading recipe...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your cooking instructions.</p>
        </div>
      </div>
    );
  }

  const currentStepText = instructions[currentStep] || '';
  const timeInMinutes = extractTimeFromStep(currentStepText);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-4 w-full max-w-md">
        <div className="flex items-center gap-2 ml-auto">
          <DarkModeToggle />
          <SavedRecipesButton />
          <HomeButton />
          <LogoutButton />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleToggleLanguage}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            {lang === 'hi' ? 'Switch to English 🇬🇧' : 'Switch to Hindi 🇮🇳'}
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">
          {lang === 'hi' ? 'चलिए पकाते हैं:' : 'Let\'s Cook:'} {recipe.title}
        </h2>
        
        {/* Ingredients Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {lang === 'hi' ? 'सामग्री:' : 'Raw Materials Required:'}
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Current Step Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {lang === 'hi' ? 'निर्देश:' : 'Cooking Step'} {currentStep + 1}
          </h3>
          <p className="text-gray-700">{currentStepText}</p>
        </div>

        {isTimerRunning && (
          <div className="mb-4">
            <p className="text-xl font-bold text-center">{formatTime(timeLeft)}</p>
            <button
              onClick={stopTimer}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              {lang === 'hi' ? 'टाइमर बंद करें' : 'Stop Timer'}
            </button>
          </div>
        )}

        <div className="flex justify-between gap-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            {lang === 'hi' ? 'पिछला चरण' : 'Previous Step'}
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === instructions.length - 1}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {lang === 'hi' ? 'अगला चरण' : 'Next Step'}
          </button>
        </div>

        {timeInMinutes && !isTimerRunning && (
          <div className="mt-4">
            <button
              onClick={() => startTimer(timeInMinutes)}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {lang === 'hi' ? `टाइमर शुरू करें` : `Start ${timeInMinutes} Min Timer`}
            </button>
          </div>
        )}

        {/* Continue Later or Meal Ready */}
        {currentStep === instructions.length - 1 ? (
          <div className="mt-4 text-center text-2xl font-bold text-green-600">
            {lang === 'hi' ? 'आपका भोजन तैयार है!' : 'Your meal is ready!'}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleContinueLater}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              ⏸️ Continue Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingPage;
