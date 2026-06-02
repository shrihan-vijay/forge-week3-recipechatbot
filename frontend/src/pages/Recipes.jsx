import { useEffect, useState } from "react";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Recipes() {
  const [activeTab, setActiveTab] = useState("official");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (activeTab === "official" && searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const endpoint =
          activeTab === "official"
            ? `${API_URL}/api/spoonacular/recipes?${params.toString()}`
            : `${API_URL}/api/recipes`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : data.recipes || data.results || []);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [activeTab, searchTerm]);

  const filteredRecipes =
    activeTab === "official"
      ? recipes
      : recipes.filter((recipe) =>
          recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  async function handleSave(recipe) {
  try {
    const savedRecipe = {
      userId: "temp-user-id",
      recipeId: String(recipe.id),
      title: recipe.title || "",
      description:
        recipe.description ||
        recipe.summary?.replace(/<[^>]*>/g, "").slice(0, 160) ||
        "",
      imageUrl: recipe.imageUrl || recipe.image || "",
      readyInMinutes: recipe.readyInMinutes || 0,
      sourceUrl: recipe.sourceUrl || "",
      isExternal: activeTab === "official",
    };

    const response = await fetch(`${API_URL}/api/saved-recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savedRecipe),
    });

    if (!response.ok) {
      throw new Error("Failed to save recipe");
    }
  } catch (error) {
    console.error("Failed to save recipe:", error);
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
            const cleanSummary = recipe.summary?.replace(/<[^>]*>/g, "");

            return (
              <article className="recipe-card" key={recipe.id || recipe.recipeId}>
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
                  className="save-button"
                  onClick={() => handleSave(recipe)}
                  aria-label="Save recipe"
                >
                  ☆
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Recipes;