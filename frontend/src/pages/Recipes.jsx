import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TEMP_USER_ID = "temp-user-id";

function Recipes() {
  const {
    recipes: communityRecipes,
    loading: communityLoading,
    fetchRecipes,
    searchRecipes,
  } = useRecipes();

  const [activeTab, setActiveTab] = useState("official");
  const [searchTerm, setSearchTerm] = useState("");
  const [officialRecipes, setOfficialRecipes] = useState([]);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);

  useEffect(() => {
  async function fetchOfficialRecipes() {
    try {
      setOfficialLoading(true);

      const response = await fetch(`${API_URL}/recipe/official`);

      if (!response.ok) {
        throw new Error("Failed to fetch official recipes");
      }

      const data = await response.json();
      setOfficialRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch official recipes:", error);
      setOfficialRecipes([]);
    } finally {
      setOfficialLoading(false);
    }
  }

  if (activeTab === "official") {
    fetchOfficialRecipes();
  }
}, [activeTab]);

  useEffect(() => {
    if (activeTab !== "community") return;

    if (searchTerm.trim()) {
      searchRecipes(searchTerm.trim());
    } else {
      fetchRecipes();
    }
  }, [activeTab, searchTerm, fetchRecipes, searchRecipes]);

  useEffect(() => {
    async function fetchSavedRecipes() {
      try {
        const response = await fetch(`${API_URL}/recipe/user/${TEMP_USER_ID}/saved`);

        if (!response.ok) {
          throw new Error("Failed to fetch saved recipes");
        }

        const data = await response.json();

        setSavedRecipeIds(
          data.map((recipe) => String(recipe.recipeId || recipe.id))
        );
      } catch (error) {
        console.error("Failed to fetch saved recipes:", error);
      }
    }

    fetchSavedRecipes();
  }, []);

  async function handleSave(recipe) {
    try {
      const recipeId = String(recipe.id || recipe.recipeId);

      const savePayload = {
        recipeId,
        source: activeTab,
      };

      const response = await fetch(`${API_URL}/recipe/save/${TEMP_USER_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      setSavedRecipeIds((prev) =>
        prev.includes(recipeId) ? prev : [...prev, recipeId]
      );
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  }

  const recipes =
  activeTab === "official"
    ? officialRecipes.filter((recipe) =>
        recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : communityRecipes;

  const loading =
    activeTab === "official" ? officialLoading : communityLoading;

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

      <div className="recipes-toggle">
        <button
          className={activeTab === "official" ? "active" : ""}
          onClick={() => setActiveTab("official")}
        >
          Official
        </button>

        <button
          className={activeTab === "community" ? "active" : ""}
          onClick={() => setActiveTab("community")}
        >
          Community
        </button>
      </div>

      {loading && <p>Loading recipes...</p>}

      {!loading && recipes.length === 0 && <p>No recipes found.</p>}

      {!loading && recipes.length > 0 && (
        <section className="recipes-grid">
          {recipes.map((recipe) => {
            const recipeId = String(recipe.id || recipe.recipeId);
            const cleanSummary = recipe.summary?.replace(/<[^>]*>/g, "");
            const isSaved = savedRecipeIds.includes(recipeId);

            return (
              <Link
                to={`/recipes/${recipeId}`}
                key={`${activeTab}-${recipeId}`}
                className="recipe-card-link"
              >
                <article className="recipe-card">
                  <img
                    src={
                      recipe.imageUrl ||
                      recipe.image ||
                      "/placeholder-image.png"
                    }
                    alt={recipe.title || "Recipe"}
                    className="recipe-image"
                  />

                  <h3>{recipe.title || "Recipe Name"}</h3>

                  <p>
                    {recipe.description ||
                      cleanSummary?.slice(0, 90) ||
                      (recipe.readyInMinutes
                        ? `${recipe.readyInMinutes} mins`
                        : "Description")}
                  </p>

                  <button
                    className={`save-button ${isSaved ? "saved" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSave(recipe);
                    }}
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