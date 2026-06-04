import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import "../styles/MyRecipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function MyRecipes() {
  const { user } = useUser();
  const userId = user?.uid || user?.id;

  const [activeTab, setActiveTab] = useState("saved");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    fetchSavedRecipes();
    fetchCreatedRecipes();
  }, [userId]);

  async function fetchSavedRecipes() {
    try {
      const res = await fetch(`${API_URL}/recipe/user/${userId}/saved`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch saved recipes");
      }

      setSavedRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      setSavedRecipes([]);
    }
  }

  async function fetchCreatedRecipes() {
    try {
      const res = await fetch(`${API_URL}/myrecipes/created/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch created recipes");
      }

      setCreatedRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching created recipes:", error);
      setCreatedRecipes([]);
    }
  }

  async function handleRemoveSaved(savedId) {
  const confirmed = window.confirm(
    "Remove this recipe from your saved recipes?"
  );

  if (!confirmed) return;

  try {
    const res = await fetch(`${API_URL}/myrecipes/saved/${savedId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to remove saved recipe");
    }

    setSavedRecipes((prev) =>
      prev.filter((recipe) => recipe.savedId !== savedId)
    );
  } catch (error) {
    console.error("Error removing saved recipe:", error);
  }
}

  async function handleDeleteCreated(recipeId) {
    const confirmed = window.confirm(
      "Delete this recipe? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/myrecipes/created/${recipeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete created recipe");
      }

      setCreatedRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipeId)
      );
    } catch (error) {
      console.error("Error deleting created recipe:", error);
    }
  }

  const recipes = activeTab === "saved" ? savedRecipes : createdRecipes;

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="my-recipes-page">
      <header className="my-recipes-header">
        <h1>My Recipes</h1>
      </header>

      <div className="my-recipes-controls">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search for a recipe"
            className="my-recipes-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>⌕</span>
        </div>

        <button
          className="create-recipe-btn"
          onClick={() => navigate("/create")}
        >
          + Create Recipe
        </button>
      </div>

      <div className="recipe-toggle">
        <button
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>

        <button
          className={activeTab === "created" ? "active" : ""}
          onClick={() => setActiveTab("created")}
        >
          Created
        </button>
      </div>

      {!userId && <p>Please log in to view your recipes.</p>}

      {userId && filteredRecipes.length === 0 && (
        <p>No {activeTab} recipes found.</p>
      )}

      {userId && filteredRecipes.length > 0 && (
        <section className="my-recipes-grid">
          {filteredRecipes.map((recipe) => {
            const recipeId = String(recipe.id || recipe.recipeId);
            const imageUrl =
              recipe.imageUrl || recipe.image || "/placeholder-recipe.png";

            return (
              <article className="recipe-card" key={`${activeTab}-${recipeId}`}>
                <Link to={`/recipes/${recipeId}`} className="recipe-card-link">
                  <img src={imageUrl} alt={recipe.title || "Recipe"} />

                  <h2>{recipe.title || "Recipe Name"}</h2>

                  <p>{recipe.description || "No description added yet."}</p>
                </Link>

                {activeTab === "saved" ? (
                  <div className="recipe-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveSaved(recipe.savedId)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="recipe-actions">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/recipes/${recipeId}/edit`)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCreated(recipeId)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyRecipes;