import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminDashboard() {
    const { user } = useUser();
    const [pending, setPending] = useState([]);
    const [confirmAction, setConfirmAction] = useState(null);

    async function handleFetch() {
        try {
            const res = await fetch(`${API_URL}/recipe/pending`);
            const recipes = await res.json();
            setPending(recipes);
        } catch (error) {
            console.error("Error fetching pending recipes", error);
        }
    }

    async function handleApprove(recipeId) {
        try {
            await fetch(`${API_URL}/recipe/${recipeId}/approve`, { method: "PATCH" });
            setPending((prev) => prev.filter((r) => r.id !== recipeId));
        } catch (error) {
            console.error("Error approving recipe", error);
        }
    }

    async function handleDelete(recipeId) {
        try {
            await fetch(`${API_URL}/recipe/${recipeId}`, { method: "DELETE" });
            setPending((prev) => prev.filter((r) => r.id !== recipeId));
        } catch (error) {
            console.error("Error deleting recipe", error);
        }
    }

    useEffect(() => {
        handleFetch();
    }, [])

    if (!user?.admin) return null;

    return (
        <main className="admin-page">
            <h2>Admin Dashboard</h2>
            <p className="admin-subtitle">{pending.length} recipe{pending.length !== 1 ? "s" : ""} pending review</p>

            {pending.length === 0 && <p className="admin-empty">No pending recipes to review.</p>}

            {pending.length > 0 && (
                <section className="admin-grid">
                    {pending.map((recipe) => (
                        <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="admin-card-link">
                            <article className="admin-card">
                                <img
                                    src={recipe.imageUrl || "/placeholder-image.png"}
                                    alt={recipe.title || "Recipe"}
                                    className="admin-card-image"
                                />
                                <div className="admin-card-content">
                                    <h3>{recipe.title || "Untitled Recipe"}</h3>
                                    <p className="admin-card-desc">{recipe.description || "No description"}</p>
                                    <p className="admin-card-author">By: {recipe.creatorName || "Unknown"}</p>
                                </div>
                                <div className="admin-card-actions">
                                    <button
                                        className="admin-btn approve"
                                        onClick={(e) => { e.preventDefault(); setConfirmAction({ type: "approve", recipeId: recipe.id, title: recipe.title }); }}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="admin-btn reject"
                                        onClick={(e) => { e.preventDefault(); setConfirmAction({ type: "reject", recipeId: recipe.id, title: recipe.title }); }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </article>
                        </Link>
                    ))}
                </section>
            )}
            {confirmAction && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>{confirmAction.type === "approve" ? "Approve Recipe" : "Reject Recipe"}</h3>
                        <p>
                            Are you sure you want to {confirmAction.type} <strong>{confirmAction.title}</strong>?
                            {confirmAction.type === "reject" && " This action cannot be undone."}
                        </p>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn cancel"
                                onClick={() => setConfirmAction(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`admin-btn ${confirmAction.type === "approve" ? "approve" : "reject"}`}
                                onClick={async () => {
                                    if (confirmAction.type === "approve") {
                                        await handleApprove(confirmAction.recipeId);
                                    } else {
                                        await handleDelete(confirmAction.recipeId);
                                    }
                                    setConfirmAction(null);
                                }}
                            >
                                {confirmAction.type === "approve" ? "Approve" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}