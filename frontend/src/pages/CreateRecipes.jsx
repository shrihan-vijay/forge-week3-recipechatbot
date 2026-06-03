import { useState } from "react";
import "../styles/CreateRecipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TEMP_USER_ID = "temp-user-id";

const initialForm = {
  title: "",
  creatorName: "",
  description: "",
  ingredients: "",
  instructions: "",
  tags: "",
  imageUrl: "",
  readyInMinutes: "",
};

function toLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function CreateRecipes() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    const payload = {
      title: form.title.trim(),
      userId: TEMP_USER_ID,
      creatorName: form.creatorName.trim(),
      description: form.description.trim(),
      ingredients: toLines(form.ingredients),
      instructions: toLines(form.instructions),
      tags: toTags(form.tags),
      imageUrl: form.imageUrl.trim(),
      readyInMinutes: Number(form.readyInMinutes) || 0,
    };

    try {
      const response = await fetch(`${API_URL}/recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not create recipe");
      }

      setForm(initialForm);
      setStatus("Recipe submitted for admin review.");
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setStatus("Something went wrong. Try again.");
    }
  }

  return (
    <main className="create-recipe-page">
      <form className="create-recipe-layout" onSubmit={handleSubmit}>
        <section className="create-recipe-left">
          <div className="image-preview">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Recipe preview" />
            ) : (
              <span>Image preview</span>
            )}
          </div>

          <label className="field">
            Image URL
            <input
              name="imageUrl"
              type="url"
              placeholder="https://example.com/recipe.jpg"
              value={form.imageUrl}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            Tags
            <input
              name="tags"
              type="text"
              placeholder="breakfast, healthy, dessert"
              value={form.tags}
              onChange={handleChange}
            />
          </label>

          <div className="tag-preview">
            {toTags(form.tags).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <label className="field">
            Ingredients List
            <textarea
              name="ingredients"
              placeholder={"1 cup flour\n2 eggs\n1 tsp vanilla"}
              value={form.ingredients}
              onChange={handleChange}
              rows="7"
              required
            />
          </label>
        </section>

        <section className="create-recipe-right">
          <label className="field title-field">
            Recipe Name
            <input
              name="title"
              type="text"
              placeholder="Insert Recipe Name"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            By User
            <input
              name="creatorName"
              type="text"
              placeholder="Your name"
              value={form.creatorName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            Ready In Minutes
            <input
              name="readyInMinutes"
              type="number"
              min="0"
              placeholder="30"
              value={form.readyInMinutes}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            Recipe Description
            <textarea
              name="description"
              placeholder="Describe the recipe..."
              value={form.description}
              onChange={handleChange}
              rows="6"
            />
          </label>

          <label className="field">
            Instructions
            <textarea
              name="instructions"
              placeholder={"Mix ingredients\nBake for 20 minutes\nLet cool before serving"}
              value={form.instructions}
              onChange={handleChange}
              rows="12"
              required
            />
          </label>

          <button className="submit-recipe-button" type="submit">
            Submit Recipe
          </button>

          {status && <p className="create-status">{status}</p>}
        </section>
      </form>
    </main>
  );
}