import { createContext, useContext, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);

  // Fetch all approved recipes from Firestore (default view, no API call)
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipe`);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tag`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]);
    }
  }, []);

  const fetchRecipesByTag = useCallback(async (tagId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipe/tag/${tagId}`);
      if (!response.ok) throw new Error("Failed to fetch recipes by tag");
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch recipes by tag:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search: try Firestore first, fall back to Spoonacular if no results
  const searchRecipes = useCallback(async (searchTerm) => {
    setLoading(true);
    try {
      // First, search Firestore
      const dbResponse = await fetch(
        `${API_URL}/recipe/search?query=${encodeURIComponent(searchTerm)}`
      );
      if (dbResponse.ok) {
        const dbResults = await dbResponse.json();
        if (dbResults.length > 0) {
          setRecipes(dbResults);
          return;
        }
      }

      // No Firestore results — fall back to Spoonacular (which upserts into Firestore)
      const apiResponse = await fetch(
        `${API_URL}/api/spoonacular/search?query=${encodeURIComponent(searchTerm)}&number=12`
      );
      if (!apiResponse.ok) throw new Error("Failed to search recipes");

      const apiResults = await apiResponse.json();
      setRecipes(Array.isArray(apiResults) ? apiResults : []);
    } catch (error) {
      console.error("Failed to search recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single recipe by ID from Firestore
  const fetchRecipeById = useCallback(async (recipeId) => {
    try {
      const response = await fetch(`${API_URL}/recipe/${recipeId}`);
      if (!response.ok) throw new Error("Recipe not found");
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      return null;
    }
  }, []);

  return (
    <RecipeContext.Provider
      value={{ recipes, loading, tags, fetchRecipes, fetchTags, fetchRecipesByTag, searchRecipes, fetchRecipeById }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error("useRecipes must be used within a RecipeProvider");
  return context;
}
