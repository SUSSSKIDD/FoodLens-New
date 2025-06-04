const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Recipe = require('../models/Recipe');

exports.generateRecipe = async (req, res) => {
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

Return a clear, step-by-step recipe and divide recipe in  English Translation  as **English Translation** and Hindi translation  as **Hindi Translation**seperately.
Include a section for ingredients, steps, and approximate nutritional value per serving  and also provide a youtube video for the recipe.
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

// Save Gemini recipe to DB
exports.saveRecipe = async (req, res) => {
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

// Get recipes saved by the current user
exports.getUserRecipes = async (req, res) => {
  const userId = req.user.id;

  try {
    const recipes = await Recipe.find({ userId }).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
};

exports.updateRecipe = async (req, res) => {
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


// Delete a recipe by ID
exports.deleteRecipe = async (req, res) => {
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