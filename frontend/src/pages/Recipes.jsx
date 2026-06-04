import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";
import { useUser } from "../context/UserContext.jsx";
import "../styles/Recipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Recipes() {
  const {
    recipes: communityRecipes,
    tags,
    loading: communityLoading,
    fetchRecipes,
    fetchTags,
    fetchRecipesByTag,
    searchRecipes,
  } = useRecipes();

  const { user } = useUser();
  const userId = user?.uid || user?.id;

  const [activeTab, setActiveTab] = useState("official");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [officialRecipes, setOfficialRecipes] = useState([]);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);

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

    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      searchRecipes(trimmedSearch);
      setSelectedTag("");
    } else {
      if (selectedTag) {
        fetchRecipesByTag(selectedTag);
      } else {
        fetchRecipes();
      }
    }
  }, [activeTab, searchTerm, selectedTag, fetchRecipes, searchRecipes, fetchRecipesByTag]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    if (activeTab === "community" && searchTerm === "") {
      fetchRecipes();
    }
  }, [searchTerm, activeTab, fetchRecipes]);

  useEffect(() => {
    async function fetchSavedRecipes() {
      if (!userId) return;

      try {
        const response = await fetch(`${API_URL}/recipe/user/${userId}/saved`);

        if (!response.ok) {
          throw new Error("Failed to fetch saved recipes");
        }

        const data = await response.json();
        setSavedRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch saved recipes:", error);
      }
    }

    fetchSavedRecipes();
  }, [userId]);

  function getRecipeTagNames(recipe) {
    let names = [];

    if (recipe.tags?.length > 0 && tags?.length > 0) {
      names = recipe.tags
        .map((tagId) => tags.find((tag) => tag.id === tagId)?.name)
        .filter(Boolean);
    }

    if (names.length === 0 && recipe.rawTags?.length > 0) {
      names = Array.from(new Set(recipe.rawTags.map((tag) => tag?.trim()).filter(Boolean)));
    }

    return names.slice(0, 3);
  }

  async function handleToggleSave(recipe) {
    if (!userId) {
      console.warn("User must be logged in to save recipes.");
      return;
    }

    const recipeId = String(recipe.id || recipe.recipeId);
    const existingSaved = savedRecipes.find(
      (saved) => String(saved.recipeId) === recipeId
    );

    try {
      if (existingSaved) {
        const response = await fetch(
          `${API_URL}/myrecipes/saved/${existingSaved.savedId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error("Failed to unsave recipe");
        }

        setSavedRecipes((prev) =>
          prev.filter((saved) => String(saved.recipeId) !== recipeId)
        );
        return;
      }

      const response = await fetch(`${API_URL}/recipe/save/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId,
          source: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const savedRecipe = await response.json();
      setSavedRecipes((prev) => [...prev, savedRecipe]);
    } catch (error) {
      console.error("Error toggling saved recipe:", error);
    }
  }

  // Derive client-side filtered view for official recipes vs raw data for community
  const officialFilteredRecipes = officialRecipes.filter((recipe) => {
    const matchesSearch = recipe.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesTag =
      !selectedTag || recipe.tags?.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const recipes =
    activeTab === "official" ? officialFilteredRecipes : communityRecipes;

  const loading = activeTab === "official" ? officialLoading : communityLoading;

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

      { tags && (
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
      )}

      {loading && <p>Loading recipes...</p>}

      {!loading && recipes.length === 0 && <p>No recipes found.</p>}

      {!loading && recipes.length > 0 && (
        <section className="recipes-grid">
          {recipes.map((recipe) => {
            const recipeId = String(recipe.id || recipe.recipeId);
            const cleanSummary = recipe.summary?.replace(/<[^>]*>/g, "");
            const isSaved = savedRecipes.some(
              (saved) => String(saved.recipeId) === recipeId
            );

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

                  <div className="recipe-card-tags">
                    {getRecipeTagNames(recipe).map((tagName) => (
                      <span key={tagName} className="recipe-tag-pill">
                        {tagName}
                      </span>
                    ))}
                  </div>

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
                      handleToggleSave(recipe);
                    }}
                    aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
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