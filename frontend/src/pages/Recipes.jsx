import { useEffect, useState } from "react";
import "../styles/Recipes.css";

function Recipes() {
  const [activeTab, setActiveTab] = useState("official");
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
<<<<<<< HEAD
  
=======
>>>>>>> 05fcc0b (feat/rebase: moved pages into src, removed vite icons, added recipes.jsx and styling)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const endpoint =
          activeTab === "official"
            ? "http://localhost:5001/api/recipes/official"
            : "http://localhost:5001/api/recipes/community";

        const response = await fetch(endpoint);
        const data = await response.json();

        setRecipes(data.recipes || data);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    }

    fetchRecipes();
  }, [activeTab]);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSave(recipe) {
    try {
      await fetch("http://localhost:5001/api/recipes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });
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

      <section className="recipes-grid">
        {filteredRecipes.map((recipe) => (
          <article className="recipe-card" key={recipe.id || recipe._id}>
            <img
              src={recipe.image || "/placeholder-image.png"}
              alt={recipe.name}
              className="recipe-image"
            />

            <h3>{recipe.name}</h3>
            <p>{recipe.description || recipe.cuisine || "Description"}</p>

            <button
              className="save-button"
              onClick={() => handleSave(recipe)}
              aria-label="Save recipe"
            >
              ☆
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Recipes;