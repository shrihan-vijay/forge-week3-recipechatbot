import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TEMP_USER_ID = "temp-user-id";

function Recipes() {
  const { recipes, loading, fetchRecipes, searchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);

  // Load all approved recipes on mount, search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchRecipes(searchTerm.trim());
    } else {
      fetchRecipes();
    }
  }, [searchTerm, fetchRecipes, searchRecipes]);

  useEffect(() => {
    async function fetchSavedRecipes() {
      try {
        const response = await fetch(`${API_URL}/recipe/user/${TEMP_USER_ID}`);
        if (!response.ok) throw new Error("Failed to fetch saved recipes");

        const data = await response.json();
        setSavedRecipeIds(data.map((recipe) => String(recipe.recipeId || recipe.id)));
      } catch (error) {
        console.error("Failed to fetch saved recipes:", error);
      }
    }

    fetchSavedRecipes();
  }, []);

  async function handleSave(recipe) {
    try {
      const recipeId = String(recipe.id || recipe.recipeId);

      const recipePayload = {
        recipeId,
        title: recipe.title || "",
        description: recipe.description || "",
        imageUrl: recipe.imageUrl || "",
        readyInMinutes: recipe.readyInMinutes || 0,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || []
      };

      const response = await fetch(`${API_URL}/recipe/external`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipePayload),
      });

      if (!response.ok) throw new Error("Failed to process recipe request");

      setSavedRecipeIds((prev) =>
        prev.includes(recipeId) ? prev : [...prev, recipeId]
      );
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  }

  return (
    <main className="recipes-page">
      <h2>Recipes</h2>

      <div className="recipes-search">
        <input
          type="text"
          placeholder="Search for a recipe"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span>⌕</span>
      </div>

      {loading && <p>Loading recipes...</p>}

      {!loading && recipes.length === 0 && <p>No recipes found.</p>}

      {!loading && recipes.length > 0 && (
        <section className="recipes-grid">
          {recipes.map((recipe) => {
            const recipeId = String(recipe.id || recipe.recipeId);
            const isSaved = savedRecipeIds.includes(recipeId);

            return (
              <Link to={`/recipes/${recipeId}`} key={recipeId} className="recipe-card-link">
                <article className="recipe-card">
                  <img
                    src={recipe.imageUrl || recipe.image || "/placeholder-image.png"}
                    alt={recipe.title || "Recipe"}
                    className="recipe-image"
                  />

                  <h3>{recipe.title || "Recipe Name"}</h3>

                  <p>
                    {recipe.description ||
                      (recipe.readyInMinutes
                        ? `${recipe.readyInMinutes} mins`
                        : "Description")}
                  </p>

                  <button
                    className={`save-button ${isSaved ? "saved" : ""}`}
                    onClick={(e) => { e.preventDefault(); handleSave(recipe); }}
                    aria-label="Save recipe"
                    disabled={isSaved}
                  >
                    {isSaved ? "★" : "☆"}
                  </button>
                </article>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Recipes;
