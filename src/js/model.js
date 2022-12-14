import { API_URL, API_KEY, RES_PER_PAGE } from './config.js';

import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  shop: [],
};

const createRecipeObject = function (recipe) {
  return {
    cookingTime: recipe.cooking_time,
    id: recipe.id,
    title: recipe.title,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Bookmark store (data stored on localStorage)
 */
const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * Shopping store (data stored on localStorage)
 */
const persistShoppingCart = function () {
  localStorage.setItem('shoppings', JSON.stringify(state.shop));
};

/**
 * Load recipe by id
 * @param {number} id recipe id
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    const { recipe } = data;

    state.recipe = createRecipeObject(recipe);

    // check bookmarked
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (error) {
    throw error;
  }
};

/**
 * Use to search recipe
 * @param {string} query recipe terms
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const { recipes } = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    state.search.results = recipes?.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url,
        publisher: recipe.publisher,
        ...(recipe.key && { key: recipe.key }),
      };
    });

    // reinitalize page state;
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0;
  const end = page * state.search.resultsPerPage; // 9;

  // console.log(`Page start at ${start} and end at ${end}.`);

  return state.search.results.slice(start, end);
};

/**
 * Use to update serving
 * @param {number} newServing number of serving (person)
 */
export const updateServings = function (newServing) {
  // Formula: newQt = oldQt * newServing / oldServings
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServing) / state.recipe.servings;
  });

  state.recipe.servings = newServing;
};

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarks.push(recipe);

  // add select mark to recipe
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmark();
};

export const deleteBookmark = function (id) {
  // find id of recipe
  const index = state.bookmarks.findIndex(el => el.id === id);

  // unbookmarked recipe
  state.bookmarks.splice(index, 1);

  // disable selected mark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmark();
};

/**
 * Use to add recipe data to shop
 * @param {Object} recipe recipe data
 */
export const addToShoppingCart = function (recipe) {
  const items = state.shop.every(item => item.id !== recipe.id);
  if (items) state.shop.push(recipe);

  persistShoppingCart();
};

/**
 * Use to delete recipe on shopping list
 * @param {number} id recipe id
 */
export const deleteShoppingItem = function (id) {
  const item = state.shop.filter(recipe => recipe.id !== id);
  state.shop = item;

  persistShoppingCart();
};

/**
 * Upload new recipe
 * @param {Object} newRecipe recipe data
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(ing => ing.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredients format. Please use the correct format'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      image_url: newRecipe.image,
      source_url: newRecipe.sourceUrl,
      publisher: newRecipe.publisher,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);

    state.recipe = createRecipeObject(data.recipe);

    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};

const initShopData = function () {
  const items = localStorage.getItem('shoppings');

  if (items) state.shop = JSON.parse(items);
};

const clearData = function () {
  localStorage.clear('bookmarks');
  localStorage.clear('shoppings');
};

init();
initShopData();
