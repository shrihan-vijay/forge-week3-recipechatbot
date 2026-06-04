import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TEMP_USER_ID = "temp-user-id";

function Recipes() {
  const { recipes, tags, loading, fetchRecipes, fetchTags, fetchRecipesByTag, searchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  // Load all approved recipes on mount, search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchRecipes(searchTerm.trim());
      setSelectedTag("");
    } else if (!selectedTag) {
      fetchRecipes();
    }
  }, [searchTerm, selectedTag, fetchRecipes, searchRecipes]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

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

  function getRecipeTagNames(recipe) {
    let names = [];

    if (recipe.tags?.length > 0 && tags.length > 0) {
      names = recipe.tags
        .map((tagId) => tags.find((tag) => tag.id === tagId)?.name)
        .filter(Boolean);
    }

    if (names.length === 0 && recipe.rawTags?.length > 0) {
      names = Array.from(new Set(recipe.rawTags.map((tag) => tag?.trim()).filter(Boolean)));
    }

    return names.slice(0, 3);
  }

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

      <div className="tag-filter-row">
        <label htmlFor="tag-select" className="tag-filter-label">
          Filter by tag:
        </label>
        <select
          id="tag-select"
          value={selectedTag}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTag(value);
            if (value) {
              fetchRecipesByTag(value);
            } else {
              fetchRecipes();
            }
          }}
          className="tag-filter-select"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
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

                  <div className="recipe-card-tags">
                    {getRecipeTagNames(recipe).map((tagName) => (
                      <span key={tagName} className="recipe-tag-pill">
                        {tagName}
                      </span>
                    ))}
                  </div>

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
