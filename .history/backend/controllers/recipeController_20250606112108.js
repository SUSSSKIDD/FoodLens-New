const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Recipe = require('../models/Recipe');
const CookedRecipe = require('../models/CookedRecipe');

// ✅ 1. Generate Recipe with Gemini
const generateRecipe = async (req, res) => {
  const { ingredients, preferences } = req.body;

  const prompt = `
Generate a recipe using only these vegetables: ${ingredients.join(', ')}.
Preferences:
- Serving Size: ${['1 pax', '2 pax', '<5 pax', '>5 pax'][preferences.servingSize - 1]}
- Cuisine: ${preferences.cuisine}
- Meal Type: ${preferences.mealType}
- Diet: ${preferences.diet}
- Allergies to ingredients: ${preferences.allergy}
- Lactose Tolerant: ${preferences.lactose}
- Diabetic: ${preferences.diabetic}
- Cooking Time: ${preferences.cookingTime}
- Health Goal: ${preferences.healthGoal}
- Spicy Level: ${['Little', 'Medium', 'High'][preferences.spicyLevel - 1]}

<<<<<<< HEAD
First provide the recipe in English with the following sections:
**English Translation**
**Ingredients:**
(List ingredients with bullet points)
**Instructions:**
(Numbered steps)

Then provide the Hindi translation with the following sections:
**Hindi Translation**
**सामग्री:**
(List ingredients in Hindi with bullet points)
**निर्देश:**
(Numbered steps in Hindi)

Finally, include approximate nutritional value per serving.
=======
Return a clear, step-by-step recipe and divide recipe in  English Translation  as **English Translation** and Hindi translation  as **Hindi Translation**seperately.
Include a section for ingredients, steps, and approximate nutritional value per serving .
>>>>>>> 906418c2f4b0edf81f7c9fd4b8c905b0aad21246
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    res.json({ recipe: text });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ message: 'Failed to generate recipe' });
  }
};

// ✅ 2. Save Gemini Recipe to DB
const saveRecipe = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const newRecipe = new Recipe({ title, content, userId });
    await newRecipe.save();
    res.status(201).json({ message: 'Recipe saved', recipe: newRecipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save recipe' });
  }
};

// ✅ 3. Get Saved Recipes for a User
const getUserRecipes = async (req, res) => {
  const userId = req.user.id;

  try {
    const recipes = await Recipe.find({ userId }).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
};

// ✅ 4. Update a Recipe
const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const updated = await Recipe.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Recipe not found or unauthorized' });

    res.json({ message: 'Recipe updated', recipe: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
};

// ✅ 5. Delete a Recipe
const deleteRecipe = async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const deleted = await Recipe.findOneAndDelete({ _id: recipeId, userId });
    if (!deleted) return res.status(404).json({ message: 'Recipe not found or not owned by user' });

    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
};
<<<<<<< HEAD

// ✅ 6. Save Cooked Recipe to CookedHistory
const saveCookedRecipe = async (req, res) => {
  const { title, content, language } = req.body;
  const userId = req.user.id;

  try {
    const cooked = await CookedRecipe.create({
      title,
      content,
      language,
      userId
    });

    res.status(201).json({ message: '✅ Recipe saved to cook history', cooked });
  } catch (err) {
    console.error('❌ Error saving cooked recipe:', err);
    res.status(500).json({ message: 'Failed to save cooked recipe' });
  }
};

const getCookedRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await CookedRecipe.find({ userId }).sort({ cookedAt: -1 });
    res.json({ history });
  } catch (err) {
    console.error('❌ Error fetching cooked recipes:', err);
    res.status(500).json({ message: 'Failed to fetch cook history' });
  }
};

module.exports = {
  generateRecipe,
  saveRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  saveCookedRecipe,
  getCookedRecipes
};
=======
>>>>>>> 906418c2f4b0edf81f7c9fd4b8c905b0aad21246
