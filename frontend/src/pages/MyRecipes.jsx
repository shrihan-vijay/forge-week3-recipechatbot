import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/MyRecipes.css";

function MyRecipes() {
  const [activeTab, setActiveTab] = useState("saved");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedRecipes();
    fetchCreatedRecipes();
  }, []);

  async function fetchSavedRecipes() {
    const res = await fetch("http://localhost:5001/api/my-recipes/saved");
    const data = await res.json();
    setSavedRecipes(data);
  }

  async function fetchCreatedRecipes() {
    const res = await fetch("http://localhost:5001/api/my-recipes/created");
    const data = await res.json();
    setCreatedRecipes(data);
  }

  async function handleRemoveSaved(id) {
    await fetch(`http://localhost:5001/api/my-recipes/saved/${id}`, {
      method: "DELETE",
    });

    setSavedRecipes(savedRecipes.filter((recipe) => recipe.id !== id));
  }

  async function handleDeleteCreated(id) {
    await fetch(`http://localhost:5001/api/recipes/${id}`, {
      method: "DELETE",
    });

    setCreatedRecipes(createdRecipes.filter((recipe) => recipe.id !== id));
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

      <section className="my-recipes-grid">
        {filteredRecipes.map((recipe) => (
          <article className="recipe-card" key={recipe.id}>
            <Link
              to={`/recipes/${recipe.id}`}
              className="recipe-card-link"
            >
              <img
                src={recipe.image || "/placeholder-recipe.png"}
                alt={recipe.title}
              />

              <h2>{recipe.title}</h2>

              <p>
                {recipe.description || "No description added yet."}
              </p>
            </Link>

            {activeTab === "saved" ? (
              <div className="recipe-actions">
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveSaved(recipe.id)}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="recipe-actions">
                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(`/recipes/${recipe.id}/edit`)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteCreated(recipe.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default MyRecipes;