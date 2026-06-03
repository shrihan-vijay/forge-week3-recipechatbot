import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive
          ? star <= (hovered || rating)
          : star <= Math.round(rating);
        return (
          <svg
            key={star}
            className={`w-5 h-5 ${filled ? "text-yellow-500" : "text-gray-300"} ${interactive ? "cursor-pointer" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate?.(star)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function RecipeDetails() {
  const { recipeId } = useParams();
  const { fetchRecipeById } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const [recipeData, commentsRes] = await Promise.all([
          fetchRecipeById(recipeId),
          fetch(`${API_URL}/recipe/${recipeId}/comment`).then((res) =>
            res.ok ? res.json() : []
          ),
        ]);

        if (!recipeData) throw new Error("Recipe not found");
        setRecipe(recipeData);
        setComments(Array.isArray(commentsRes) ? commentsRes : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [recipeId, fetchRecipeById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#3a2e1e]/60 text-lg">Loading recipe...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-600">{error || "Recipe not found"}</p>
        <Link to="/recipes" className="text-sm text-[#6b4f2e] underline">
          Back to recipes
        </Link>
      </div>
    );
  }

  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];

  return (
    <div className="px-8 py-10 text-left">
      {/* Back link */}
      <Link
        to="/recipes"
        className="text-sm text-[#6b4f2e] no-underline hover:underline mb-6 inline-block"
      >
        &larr; Back to recipes
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-serif font-semibold text-[#3a2e1e] mb-1 tracking-tight">
        {recipe.title}
      </h1>

      {/* Meta line */}
      <div className="flex items-center gap-4 mb-8 text-sm text-[#3a2e1e]/60">
        {recipe.creatorName && <span>By {recipe.creatorName}</span>}
        {recipe.readyInMinutes && <span>{recipe.readyInMinutes} min</span>}
      </div>

      {/* Main content: image left, description/steps right */}
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Left column: image + ingredients + rating */}
        <div className="lg:w-[380px] shrink-0 flex flex-col gap-6">
          {/* Image */}
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full rounded-xl object-cover max-h-[320px]"
            />
          ) : (
            <div className="w-full h-[280px] bg-[#F0E8D4] rounded-xl flex items-center justify-center">
              <span className="text-6xl">&#127859;</span>
            </div>
          )}

          {/* Rating summary */}
          <div className="bg-[#FDFAF2] border border-[#e8e0cc] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-1">
              <StarRating rating={recipe.averageRating || 0} />
              <span className="text-sm font-medium text-[#3a2e1e]">
                {recipe.averageRating ? recipe.averageRating.toFixed(1) : "No ratings"}
              </span>
            </div>
            <p className="text-xs text-[#3a2e1e]/50">
              {recipe.ratingCount || 0} {recipe.ratingCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="bg-[#FDFAF2] border border-[#e8e0cc] rounded-xl p-5">
              <h2 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-3">
                Ingredients
              </h2>
              <ul className="space-y-2 list-none m-0 p-0">
                {ingredients.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#3a2e1e]/80"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c4a96a] shrink-0" />
                    {typeof item === "string" ? item : item.name || JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: description + steps */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          {recipe.description && (
            <div className="mb-8">
              <h2 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-3">
                Description
              </h2>
              <p className="text-[#3a2e1e]/80 leading-relaxed whitespace-pre-line">
                {recipe.description}
              </p>
            </div>
          )}

          {/* Instructions / Steps */}
          {instructions.length > 0 && (
            <div>
              <h2 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-4">
                Steps
              </h2>
              <ol className="space-y-4 list-none m-0 p-0">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#c4a96a] text-white text-sm font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[#3a2e1e]/80 leading-relaxed pt-0.5">
                      {typeof step === "string" ? step : step.step || JSON.stringify(step)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      {comments.length > 0 && (
        <div className="border-t border-[#e8e0cc] pt-8">
          <h2 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-5">
            Reviews
          </h2>
          <div className="space-y-5">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#FDFAF2] border border-[#e8e0cc] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#3a2e1e]">
                    {comment.username}
                  </span>
                  <StarRating rating={comment.rating || 0} />
                </div>
                <p className="text-sm text-[#3a2e1e]/75 leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
