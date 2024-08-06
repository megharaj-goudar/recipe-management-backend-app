const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const recipes = [];
const users = [];

// Function to create a user with a hashed password
const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, password: hashedPassword };
  users.push(newUser);
  return newUser;
};

// Create an initial user for testing purposes
(async () => {
  await createUser('john_doe', 'password123');
})();

const resolvers = {
  Query: {
    getRecipes: () => recipes,
    getRecipe: (_, { id }) => recipes.find(recipe => recipe.id === id),
  },
  Mutation: {
    addRecipe: (_, { title, ingredients, instructions, category, date }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const newRecipe = { id: uuidv4(), title, ingredients, instructions, category, date, userId: user.id };
      recipes.push(newRecipe);
      return newRecipe;
    },
    editRecipe: (_, { id, title, ingredients, instructions, category, date }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const recipe = recipes.find(recipe => recipe.id === id);
      if (recipe && recipe.userId === user.id) {
        if (title) recipe.title = title;
        if (ingredients) recipe.ingredients = ingredients;
        if (instructions) recipe.instructions = instructions;
        if (category) recipe.category = category;
        if (date) recipe.date = date;
        return recipe;
      }
      throw new Error('Recipe not found or not authorized');
    },
    deleteRecipe: (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const recipeIndex = recipes.findIndex(recipe => recipe.id === id && recipe.userId === user.id);
      if (recipeIndex > -1) {
        recipes.splice(recipeIndex, 1);
        return true;
      }
      throw new Error('Recipe not found or not authorized');
    },
    signup: async (_, { username, password }) => {
      const existingUser = users.find(user => user.username === username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      const newUser = await createUser(username, password);
      const token = jwt.sign({ id: newUser.id }, 'secret', { expiresIn: '1h' });
      return { token };
    },
    login: async (_, { username, password }) => {
      const user = users.find(user => user.username === username);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
      return { token };
    },
  },
};

module.exports = resolvers;
