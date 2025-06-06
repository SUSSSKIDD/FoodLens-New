const express = require('express');
const { generateRecipe } = require('../controllers/recipeController');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
    saveRecipe,
    getUserRecipes,
    deleteRecipe,
    updateRecipe,
    saveCookedRecipe,
    getCookedRecipes,
    updateCookedAt
  } = require('../controllers/recipeController');
  
router.post('/generate', generateRecipe);  
router.post('/save', authenticate, saveRecipe);
router.get('/user', authenticate, getUserRecipes);
router.patch('/:id', authenticate, updateRecipe); 
router.delete('/:id', authenticate, deleteRecipe);
router.post('/cooked', authenticate, saveCookedRecipe);
router.get('/cooked', authenticate, getCookedRecipes);
router.patch('/cooked/:id', authenticate, updateCookedAt);
module.exports = router;