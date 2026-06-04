import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";
import { useUser } from "../context/UserContext";
import "../styles/Recipes.css";
import Chatbot from '../components/Chatbot.jsx';

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
  const { fetchRecipeById, tags, fetchTags } = useRecipes();
  const { user } = useUser();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState("");
  const [replyText, setReplyText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [deletingReply, setDeletingReply] = useState(null);
  const [showReplies, setShowReplies] = useState({});

  function getRecipeTagNames(recipe) {
    let names = [];

    if (recipe.tags?.length > 0) {
      names = recipe.tags
        .map((tag) => {
          if (typeof tag === "string") {
            const matched = tags.find((t) => t.id === tag);
            return matched ? matched.name : tag;
          }
          return null;
        })
        .filter(Boolean);
    }

    if (names.length === 0 && recipe.rawTags?.length > 0) {
      names = Array.from(
        new Set(
          recipe.rawTags.map((tag) => tag?.trim()).filter(Boolean)
        )
      );
    }

    return names;
  }

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const recalcAndSyncRating = (updatedComments) => {
    const rated = updatedComments.filter((c) => c.rating);
    const ratingCount = rated.length;
    const averageRating =
      ratingCount > 0
        ? updatedComments.reduce((sum, c) => sum + (c.rating || 0), 0) / ratingCount
        : 0;
    setRecipe((prev) => ({ ...prev, averageRating, ratingCount }));
    fetch(`${API_URL}/recipe/${recipeId}/rating`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ averageRating, ratingCount }),
    });
  };

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
        const commentsList = Array.isArray(commentsRes) ? commentsRes : [];

        // Recalculate rating from actual comments
        const ratingCount = commentsList.filter((c) => c.rating).length;
        const averageRating =
          ratingCount > 0
            ? commentsList.reduce((sum, c) => sum + (c.rating || 0), 0) / ratingCount
            : 0;

        // Sync backend if rating is stale
        if (
          recipeData.averageRating !== averageRating ||
          recipeData.ratingCount !== ratingCount
        ) {
          fetch(`${API_URL}/recipe/${recipeId}/rating`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ averageRating, ratingCount }),
          });
        }

        setRecipe({ ...recipeData, averageRating, ratingCount });
        setComments(commentsList);
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
        to={recipe.status === "pending" ? "/admin" : "/recipes"}
        className="text-sm text-[#6b4f2e] no-underline hover:underline mb-6 inline-block"
      >
        &larr; {recipe.status === "pending" ? "Back to admin dashboard" : "Back to recipes"}
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-serif font-semibold text-[#3a2e1e] mb-1 tracking-tight">
        {recipe.title}
      </h1>

      {/* Meta line */}
      <div className="flex items-center gap-4 mb-4 text-sm text-[#3a2e1e]/60 flex-wrap">
        {recipe.creatorName && <span>By {recipe.creatorName}</span>}
        {recipe.readyInMinutes && <span>{recipe.readyInMinutes} min</span>}
      </div>

      {getRecipeTagNames(recipe).length > 0 && (
        <div className="recipe-card-tags mb-8">
          {getRecipeTagNames(recipe).map((tagName) => (
            <span key={tagName} className="recipe-tag-pill">
              {tagName}
            </span>
          ))}
        </div>
      )}

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

      {/* Reviews section — only for approved recipes */}
      {recipe.status === "approved" && (
      <div className="border-t border-[#e8e0cc] pt-8">
        <h2 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-5">
          Reviews
        </h2>

        {/* Submit review form */}
        {user && comments.some((c) => c.userId === (user.id || user.uid)) ? (
        <p className="text-sm text-[#3a2e1e]/50 mb-6">
          You have already reviewed this recipe.
        </p>
        ) : user ? (
        <div className="bg-[#FDFAF2] border border-[#e8e0cc] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-[#3a2e1e] mb-3">
            Leave a review
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reviewRating) {
                setSubmitError("Please select a rating.");
                return;
              }
              setSubmitting(true);
              setSubmitError(null);
              try {
                const res = await fetch(
                  `${API_URL}/recipe/${recipeId}/comment`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: user.id || user.uid,
                      username: user.username || user.displayName || user.name,
                      rating: reviewRating,
                      text: reviewText.trim(),
                    }),
                  }
                );
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.message || "Failed to submit review");
                }
                const newComment = await res.json();
                setComments((prev) => [...prev, newComment]);

                // Update displayed rating
                const newCount = (recipe.ratingCount || 0) + 1;
                const newAvg =
                  ((recipe.averageRating || 0) * (recipe.ratingCount || 0) +
                    reviewRating) /
                  newCount;
                setRecipe((prev) => ({
                  ...prev,
                  averageRating: newAvg,
                  ratingCount: newCount,
                }));

                // Update backend rating
                fetch(`${API_URL}/recipe/${recipeId}/rating`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    averageRating: newAvg,
                    ratingCount: newCount,
                  }),
                });

                setReviewRating(0);
                setReviewText("");
              } catch (err) {
                setSubmitError(err.message);
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs text-[#3a2e1e]/60 mb-1">
                Rating
              </label>
              <StarRating
                rating={reviewRating}
                interactive
                onRate={setReviewRating}
              />
            </div>
            <div>
              <label className="block text-xs text-[#3a2e1e]/60 mb-1">
                Comment
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                rows={3}
                className="w-full border border-[#e8e0cc] rounded-lg px-3 py-2 text-sm bg-white text-[#3a2e1e] focus:outline-none focus:ring-1 focus:ring-[#c4a96a] resize-none"
                placeholder="Write your review..."
              />
            </div>
            {submitError && (
              <p className="text-xs text-red-600">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#c4a96a] text-white text-sm font-medium rounded-lg hover:bg-[#b09858] disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
        ) : (
        <p className="text-sm text-[#3a2e1e]/50 mb-6">
          Log in to leave a review.
        </p>
        )}

        {comments.length > 0 && (
          <div className="space-y-5">
            {comments.map((comment) => {
              const isOwner = user && comment.userId === (user.id || user.uid);
              const isEditing = editingId === comment.id;
              return (
              <div
                key={comment.id}
                className="bg-[#FDFAF2] border border-[#e8e0cc] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#3a2e1e]">
                    {comment.username}
                  </span>
                  {isEditing ? (
                    <StarRating rating={editRating} interactive onRate={setEditRating} />
                  ) : (
                    <StarRating rating={comment.rating || 0} />
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full border border-[#e8e0cc] rounded-lg px-3 py-2 text-sm bg-white text-[#3a2e1e] focus:outline-none focus:ring-1 focus:ring-[#c4a96a] resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="px-4 py-1.5 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-1.5 text-sm bg-[#c4a96a] text-white rounded-lg hover:bg-[#b09858] transition-colors"
                        onClick={async () => {
                          await fetch(
                            `${API_URL}/recipe/${recipeId}/comment/${comment.id}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text: editText.trim(), rating: editRating }),
                            }
                          );
                          const updated = comments.map((c) =>
                            c.id === comment.id ? { ...c, text: editText.trim(), rating: editRating } : c
                          );
                          setComments(updated);
                          recalcAndSyncRating(updated);
                          setEditingId(null);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#3a2e1e]/75 leading-relaxed">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#e8e0cc]/50">
                      {user && (
                        <button
                          className="text-xs font-medium text-[#6b4f2e] hover:text-[#3a2e1e] transition-colors"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? "" : comment.id)}
                        >
                          Reply
                        </button>
                      )}
                      <button
                        className="text-xs font-medium text-[#6b4f2e] hover:text-[#3a2e1e] transition-colors"
                        onClick={async () => {
                          const isShowing = showReplies[comment.id];
                          setShowReplies(prev => ({ ...prev, [comment.id]: !isShowing }));
                          if (!isShowing && !replies[comment.id]) {
                            const res = await fetch(`${API_URL}/recipe/${recipeId}/comment/${comment.id}/replies`);
                            const data = await res.json();
                            setReplies(prev => ({ ...prev, [comment.id]: data }));
                          }
                        }}
                      >
                        {showReplies[comment.id] ? 'Hide replies' : `Show replies${replies[comment.id]?.length ? ` (${replies[comment.id].length})` : ''}`}
                      </button>
                      {isOwner && (
                        <>
                          <span className="text-[#e8e0cc]">|</span>
                          <button
                            className="text-xs font-medium text-[#6b4f2e] hover:text-[#3a2e1e] transition-colors"
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditText(comment.text);
                              setEditRating(comment.rating || 0);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => setDeletingId(comment.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    {replyingTo === comment.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          className="w-full border border-[#e8e0cc] rounded-lg px-3 py-2 text-sm bg-white text-[#3a2e1e] focus:outline-none focus:ring-1 focus:ring-[#c4a96a] resize-none"
                          placeholder="Write a reply..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            className="px-4 py-1.5 bg-[#c4a96a] text-white text-sm rounded-lg hover:bg-[#b09858] transition-colors"
                            onClick={async () => {
                              if (!replyText.trim()) return;
                              const res = await fetch(
                                `${API_URL}/recipe/${recipeId}/comment/${comment.id}/replies`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: user.id || user.uid,
                                    username: user.username || user.displayName || user.name,
                                    text: replyText.trim(),
                                  }),
                                }
                              );
                              const newReply = await res.json();
                              setReplies(prev => ({ ...prev, [comment.id]: [...(prev[comment.id] || []), newReply] }));
                              setReplyText("");
                              setReplyingTo("");
                              setShowReplies(prev => ({ ...prev, [comment.id]: true }));
                            }}
                          >
                            Submit Reply
                          </button>
                          <button
                            className="px-4 py-1.5 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
                            onClick={() => { setReplyingTo(""); setReplyText(""); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {showReplies[comment.id] && replies[comment.id]?.length > 0 && (
                      <div className="mt-3 ml-4 pl-3 border-l-2 border-[#e8e0cc] space-y-2">
                        {replies[comment.id].map(reply => {
                          const isReplyOwner = user && reply.userId === (user.id || user.uid);
                          const isEditingReply = editingReplyId === reply.id;
                          return (
                            <div key={reply.id} className="p-3 bg-white/80 rounded-lg">
                              <span className="text-xs font-semibold text-[#3a2e1e]">{reply.username}</span>
                              {isEditingReply ? (
                                <div className="mt-1 space-y-2">
                                  <textarea
                                    value={editReplyText}
                                    onChange={(e) => setEditReplyText(e.target.value)}
                                    rows={2}
                                    className="w-full border border-[#e8e0cc] rounded-lg px-3 py-2 text-sm bg-white text-[#3a2e1e] focus:outline-none focus:ring-1 focus:ring-[#c4a96a] resize-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="px-3 py-1 text-xs bg-[#c4a96a] text-white rounded-md hover:bg-[#b09858] transition-colors"
                                      onClick={async () => {
                                        await fetch(
                                          `${API_URL}/recipe/${recipeId}/comment/${comment.id}/replies/${reply.id}`,
                                          {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ text: editReplyText.trim() }),
                                          }
                                        );
                                        setReplies(prev => ({
                                          ...prev,
                                          [comment.id]: prev[comment.id].map(r =>
                                            r.id === reply.id ? { ...r, text: editReplyText.trim() } : r
                                          ),
                                        }));
                                        setEditingReplyId(null);
                                        setEditReplyText("");
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="px-3 py-1 text-xs border border-[#e8e0cc] rounded-md hover:bg-[#f5f0e4] transition-colors"
                                      onClick={() => { setEditingReplyId(null); setEditReplyText(""); }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm text-[#3a2e1e]/70 leading-relaxed mt-0.5">{reply.text}</p>
                                  {isReplyOwner && (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        className="text-xs font-medium text-[#6b4f2e] hover:text-[#3a2e1e] transition-colors"
                                        onClick={() => { setEditingReplyId(reply.id); setEditReplyText(reply.text); }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                                        onClick={() => setDeletingReply({ replyId: reply.id, commentId: comment.id })}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-2">
              Delete Review
            </h3>
            <p className="text-sm text-[#3a2e1e]/70 mb-5">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={async () => {
                  await fetch(
                    `${API_URL}/recipe/${recipeId}/comment/${deletingId}`,
                    { method: "DELETE" }
                  );
                  const updated = comments.filter((c) => c.id !== deletingId);
                  setComments(updated);
                  recalcAndSyncRating(updated);
                  setDeletingId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete reply confirmation modal */}
      {deletingReply && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-serif font-semibold text-[#3a2e1e] mb-2">
              Delete Reply
            </h3>
            <p className="text-sm text-[#3a2e1e]/70 mb-5">
              Are you sure you want to delete this reply? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm border border-[#e8e0cc] rounded-lg hover:bg-[#f5f0e4] transition-colors"
                onClick={() => setDeletingReply(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={async () => {
                  const { replyId, commentId } = deletingReply;
                  await fetch(
                    `${API_URL}/recipe/${recipeId}/comment/${commentId}/replies/${replyId}`,
                    { method: "DELETE" }
                  );
                  setReplies(prev => ({
                    ...prev,
                    [commentId]: prev[commentId].filter(r => r.id !== replyId),
                  }));
                  setDeletingReply(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <Chatbot recipe={recipe} />
    </div>
  );
}
