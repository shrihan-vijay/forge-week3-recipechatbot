const dotenv = require('dotenv');
const axios = require('axios');
const {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} = require('firebase/firestore');
const db = require('../firebase.js');
const { getTagByName, createTagWithId } = require('../db/tags.db.js');

dotenv.config();

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

if (!SPOONACULAR_API_KEY) {
  console.error('Missing SPOONACULAR_API_KEY in environment');
  process.exit(1);
}

const normalizeTagName = (tagName) => (tagName || '').trim().toLowerCase();

const resolveTagIds = async (rawTags) => {
  const normalizedTags = Array.from(
    new Set(rawTags.map(normalizeTagName).filter(Boolean))
  );

  const tagIds = [];

  for (const name of normalizedTags) {
    try {
      const existingTag = await getTagByName(name);
      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        const customTagId = `tag_${name.replace(/\s+/g, '_')}`;
        const newTag = await createTagWithId(customTagId, name);
        tagIds.push(newTag.id || newTag.tagId || customTagId);
      }
    } catch (err) {
      console.error(`Failed to resolve tag \"${name}\":`, err.message || err);
    }
  }

  return tagIds;
};

const loadExternalRecipesWithoutTags = async () => {
  const recipesRef = collection(db, 'recipes');
  const q = query(recipesRef, where('isExternal', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((recipeDoc) => ({ id: recipeDoc.id, data: recipeDoc.data() }))
    .filter(
      ({ data }) => !Array.isArray(data.tags) || data.tags.length === 0
    );
};

const fetchSpoonacularRecipe = async (recipeId) => {
  const response = await axios.get(`${SPOONACULAR_BASE_URL}/${recipeId}/information`, {
    params: { apiKey: SPOONACULAR_API_KEY },
  });
  return response.data;
};

const composeRawTags = (recipeData) => {
  return Array.from(
    new Set([
      ...(recipeData.cuisines || []),
      ...(recipeData.diets || []),
      ...(recipeData.dishTypes || []),
    ])
  ).filter(Boolean);
};

const syncRecipeTags = async (recipe) => {
  const recipeId = recipe.id;
  const existing = recipe.data || {};
  const rawTags = Array.from(new Set([...(existing.rawTags || [])].map((tag) => tag?.trim()).filter(Boolean)));

  let tagsToResolve = rawTags;
  let extraFields = {};

  if (tagsToResolve.length === 0) {
    try {
      const spoonacularData = await fetchSpoonacularRecipe(recipeId);
      tagsToResolve = composeRawTags(spoonacularData);
      extraFields.rawTags = tagsToResolve;
    } catch (error) {
      console.error(`Failed to fetch Spoonacular details for ${recipeId}:`, error.response?.data || error.message || error);
      return false;
    }
  }

  if (tagsToResolve.length === 0) {
    console.log(`No tag metadata found for recipe ${recipeId}. Skipping.`);
    return false;
  }

  const resolvedTagIds = await resolveTagIds(tagsToResolve);
  if (resolvedTagIds.length === 0) {
    console.log(`No tag IDs resolved for recipe ${recipeId}. Skipping.`);
    return false;
  }

  try {
    await updateDoc(doc(db, 'recipes', recipeId), {
      tags: resolvedTagIds,
      ...extraFields,
    });
    console.log(`Updated recipe ${recipeId} with ${resolvedTagIds.length} tag(s).`);
    return true;
  } catch (error) {
    console.error(`Failed to update recipe ${recipeId}:`, error.message || error);
    return false;
  }
};

(async () => {
  try {
    const recipes = await loadExternalRecipesWithoutTags();
    console.log(`Found ${recipes.length} external recipe(s) without tags.`);

    let count = 0;
    for (const recipe of recipes) {
      const updated = await syncRecipeTags(recipe);
      if (updated) count += 1;
    }

    console.log(`Tag sync complete. Updated ${count}/${recipes.length} recipe(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync external recipe tags:', error.message || error);
    process.exit(1);
  }
})();
