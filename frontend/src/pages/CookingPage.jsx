import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';

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

  useEffect(() => {
    const recipeData = location.state?.recipe;
    const language = location.state?.lang || 'en';
    
    if (recipeData) {
      setRecipe(recipeData);
      setLang(language);
      
      // Parse recipe content
      const content = recipeData.content;
      
      // Split content into English and Hindi sections
      const sections = content.split(/\*\*Hindi Translation\*\*/i);
      const englishContent = sections[0];
      const hindiContent = sections[1] || '';
      
      // Extract ingredients and instructions based on language
      const contentToUse = language === 'hi' ? hindiContent : englishContent;
      
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
    } else {
      navigate('/camera');
    }
  }, [location.state, navigate]);

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
    const timeMatch = step.match(/(\d+)\s*(?:minutes|mins|min|मिनट)/i);
    return timeMatch ? parseInt(timeMatch[1]) : null;
  };

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/recipe/save',
        { title: recipe.title, content: recipe.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Recipe saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Please Login to save recipe');
    }
  };

  if (!recipe) {
    return <div>Loading...</div>;
  }

  const currentStepText = instructions[currentStep];
  const timeInMinutes = extractTimeFromStep(currentStepText);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name}! 👨‍🍳
        </h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <SavedRecipesButton />
          <HomeButton lang={lang} />
          <LogoutButton />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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

        {currentStep === instructions.length - 1 && (
          <div className="mt-4">
            <button
              onClick={handleSaveRecipe}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              💾 {lang === 'hi' ? 'रेसिपी सेव करें' : 'Save Recipe'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingPage;
