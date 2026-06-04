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
  const [removingSavedId, setRemovingSavedId] = useState(null);
  const [deletingCreatedId, setDeletingCreatedId] = useState(null);

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

    setRemovingSavedId(null);
  } catch (error) {
    console.error("Error removing saved recipe:", error);
  }
}

async function handleDeleteCreated(recipeId) {
  try {
    const res = await fetch(`${API_URL}/myrecipes/created/${recipeId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete created recipe");
    }

    setCreatedRecipes((prev) =>
      prev.filter((recipe) => String(recipe.id) !== String(recipeId))
    );

    setDeletingCreatedId(null);
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
                      onClick={() => setRemovingSavedId(recipe.savedId)}
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
                      onClick={() => setDeletingCreatedId(recipeId)}
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
      {/* Remove saved recipe confirmation modal */}
{removingSavedId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
      <h3 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-2">
        Remove Saved Recipe
      </h3>

      <p className="text-sm text-[#3a2e1e]/70 mb-5">
        Are you sure you want to remove this recipe from your saved recipes?
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
          onClick={() => setRemovingSavedId(null)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={() => handleRemoveSaved(removingSavedId)}
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete created recipe confirmation modal */}
{deletingCreatedId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
      <h3 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-2">
        Delete Recipe
      </h3>

      <p className="text-sm text-[#3a2e1e]/70 mb-5">
        Are you sure you want to delete this recipe? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
          onClick={() => setDeletingCreatedId(null)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={() => handleDeleteCreated(deletingCreatedId)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}

export default MyRecipes;