import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreateRecipes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const initialForm = {
  title: "",
  description: "",
  instructions: "",
  readyInMinutes: "",
};

export default function EditRecipe() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await fetch(`${API_URL}/recipe/${recipeId}`);

        if (!response.ok) {
          throw new Error("Could not fetch recipe");
        }

        const recipe = await response.json();

        setForm({
          title: recipe.title || "",
          description: recipe.description || "",
          instructions: Array.isArray(recipe.instructions)
            ? recipe.instructions.map((item) => item.step || item).join("\n")
            : "",
          readyInMinutes: recipe.readyInMinutes || "",
        });

        setIngredients(recipe.ingredients || []);
        setSelectedTags(recipe.tags || []);
        setImagePreview(recipe.imageUrl || "");
      } catch (error) {
        console.error("Failed to load recipe:", error);
        setStatus("Could not load recipe.");
      }
    }

    fetchRecipe();
  }, [recipeId]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImageToS3() {
    const presignResponse = await fetch(`${API_URL}/upload/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: imageFile.name,
        fileType: imageFile.type,
      }),
    });

    if (!presignResponse.ok) {
      throw new Error("Could not get S3 upload URL");
    }

    const { uploadUrl, publicUrl } = await presignResponse.json();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": imageFile.type,
      },
      body: imageFile,
    });

    if (!uploadResponse.ok) {
      throw new Error("Could not upload image to S3");
    }

    return publicUrl;
  }

  function addTag(tagName) {
    const nextTag = tagName.trim().toLowerCase();
    if (!nextTag) return;

    setSelectedTags((prev) =>
      prev.includes(nextTag) ? prev : [...prev, nextTag]
    );
    setTagInput("");
  }

  function removeTag(tagName) {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagName));
  }

  function handleTagKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addTag(tagInput);
  }

  function addIngredient() {
    const nextIngredient = ingredientInput.trim();
    if (!nextIngredient) return;

    setIngredients((prev) => [...prev, nextIngredient]);
    setIngredientInput("");
  }

  function removeIngredient(indexToRemove) {
    setIngredients((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  function handleIngredientKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addIngredient();
  }

  async function handleSubmit() {
    setStatus("");

    if (!form.title.trim()) {
      setStatus("Recipe name is required.");
      return;
    }

    if (ingredients.length === 0) {
      setStatus("Add at least one ingredient.");
      return;
    }

    const instructionSteps = form.instructions
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step) => ({ step }));

    if (instructionSteps.length === 0) {
      setStatus("Add instructions before submitting.");
      return;
    }

    try {
      setStatus("Updating recipe...");

      let imageUrl = imagePreview;

      if (imageFile) {
        imageUrl = await uploadImageToS3();
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        ingredients,
        instructions: instructionSteps,
        tags: selectedTags,
        imageUrl,
        readyInMinutes: Number(form.readyInMinutes) || 0,
      };

      const response = await fetch(`${API_URL}/recipe/${recipeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not update recipe");
      }

      setStatus("Recipe updated.");
      navigate("/myrecipes");
    } catch (error) {
      console.error("Failed to update recipe:", error);
      setStatus("Something went wrong. Try again.");
    }
  }

  return (
    <main className="create-recipe-page">
      <form
        className="create-recipe-layout"
        onSubmit={(event) => event.preventDefault()}
      >
        <section className="create-recipe-left">
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Recipe preview" />
            ) : (
              <span>Image preview</span>
            )}
          </div>

          <label className="field">
            Upload New Image
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          <label className="field tag-search-field">
            Search Tags
            <input
              name="tagInput"
              type="text"
              placeholder="ex. breakfast, healthy, dinner"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </label>

          <div className="tag-preview">
            {selectedTags.map((tag) => (
              <button type="button" key={tag} onClick={() => removeTag(tag)}>
                {tag}
              </button>
            ))}
          </div>

          <section className="ingredients-section">
            <h2>Ingredients List</h2>

            <div className="ingredient-entry">
              <input
                name="ingredient"
                type="text"
                placeholder="List item"
                value={ingredientInput}
                onChange={(event) => setIngredientInput(event.target.value)}
                onKeyDown={handleIngredientKeyDown}
              />

              <button type="button" onClick={addIngredient}>
                Add item
              </button>
            </div>

            <ul className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>
                  <span>{ingredient}</span>
                  <button type="button" onClick={() => removeIngredient(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="create-recipe-right">
          <label className="field figma-field title-field">
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

          <label className="field compact-field">
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

          <label className="field figma-field">
            Recipe Description
            <textarea
              name="description"
              placeholder="Describe the recipe..."
              value={form.description}
              onChange={handleChange}
              rows="9"
            />
          </label>

          <label className="field figma-field">
            Instructions
            <textarea
              name="instructions"
              placeholder="List instructions, one step per line"
              value={form.instructions}
              onChange={handleChange}
              rows="16"
              required
            />
          </label>

          <button
            className="submit-recipe-button"
            type="button"
            onClick={handleSubmit}
          >
            Save Changes
          </button>

          {status && <p className="create-status">{status}</p>}
        </section>
      </form>
    </main>
  );
}