import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TEMP_USER_ID = "temp-user-id";

function Recipes() {
  const [activeTab, setActiveTab] = useState("official");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (activeTab === "official" && searchTerm.trim()) {
          params.append("query", searchTerm.trim());
        }

        const endpoint =
          activeTab === "official"
            ? searchTerm.trim()
              ? `${API_URL}/api/spoonacular/search?query=${searchTerm.trim()}&number=12`
              : `${API_URL}/api/spoonacular/random?number=12`
            : `${API_URL}/recipe`;

        // if (activeTab === "official" && !searchTerm.trim()) {
        //   setRecipes([]);
        //   return;
        // }

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [activeTab, searchTerm]);

  useEffect(() => {
    async function fetchSavedRecipes() {
      try {
        const response = await fetch(`${API_URL}/recipe/user/${TEMP_USER_ID}`);

        if (!response.ok) {
          throw new Error("Failed to fetch saved recipes");
        }

        const data = await response.json();

        setSavedRecipeIds(data.map((recipe) => String(recipe.recipeId || recipe.id)));
      } catch (error) {
        console.error("Failed to fetch saved recipes:", error);
      }
    }

    fetchSavedRecipes();
  }, []);

  const filteredRecipes =
    activeTab === "official"
      ? recipes
      : recipes.filter((recipe) =>
        recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  async function handleSave(recipe) {
    if (activeTab !== "official") {
      console.warn("Bookmarking community recipes is not supported by this endpoint yet.");
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to process recipe request");
      }

      setSavedRecipeIds((prev) =>
        prev.includes(recipeId) ? prev : [...prev, recipeId]
      );
    } catch (error) {
      console.error("Error updates on recipe action:", error);
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
          {filteredRecipes.map((recipe) => {
            const recipeId = String(recipe.id || recipe.recipeId);
            const cleanSummary = recipe.summary?.replace(/<[^>]*>/g, "");
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
                      cleanSummary?.slice(0, 90) ||
                      (recipe.readyInMinutes
                        ? `${recipe.readyInMinutes} mins`
                        : "Description")}
                  </p>

                  {activeTab === "official" && (
                    <button
                      className={`save-button ${isSaved ? "saved" : ""}`}
                      onClick={(e) => { e.preventDefault(); handleSave(recipe); }}
                      aria-label="Save recipe"
                      disabled={isSaved}
                    >
                      {isSaved ? "★" : "☆"}
                    </button>
                  )}
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