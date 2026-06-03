import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext.jsx';
import { useState } from "react";

const BasketIcon = () => (
    <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 26 C8 26 10 16 20 16 C30 16 32 26 32 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 26 L34 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 26 L11 34 L29 34 L31 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 26 L15 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M20 26 L20 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M26 26 L25 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M17 16 C17 16 17 10 20 8 C23 10 23 16 23 16" stroke="#3a2e1e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Recipes", path: "/recipes" },
    { label: "My Recipes", path: "/myrecipes" },
    { label: "Create", path: "/create" },
];

export default function Navbar() {
    const { logout } = useUser();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <nav className="bg-[#F5EDD8] border-b border-black/10 px-8 h-13 flex items-center justify-between font-serif">
                <div className="flex items-center gap-2.5 text-[15px] font-medium text-[#3a2e1e] tracking-tight cursor-pointer">
                    <BasketIcon />
                    The Picnic Basket
                </div>

                <ul className="flex items-center gap-8 list-none m-0 p-0">
                    {navLinks.map(({ label, path }) => (
                        <li key={path}>
                            <Link
                                to={path}
                                className="no-underline text-sm text-[#3a2e1e] tracking-wide transition-opacity duration-150 hover:opacity-50"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => setShowModal(true)}
                            className="no-underline text-sm text-[#3a2e1e] tracking-wide transition-opacity duration-150 hover:opacity-50"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#F5EDD8] border border-black/20 p-6 rounded-lg max-w-sm w-full mx-4 shadow-xl font-serif text-[#3a2e1e]">
                        <h3 className="text-lg font-bold mb-2">Leaving so soon?</h3>
                        <p className="text-sm opacity-80 mb-6">Are you sure you want to pack up your picnic basket and log out?</p>

                        <div className="flex justify-end gap-3 text-sm">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded hover:bg-black/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="bg-[#3a2e1e] text-[#F5EDD8] px-4 py-2 rounded hover:opacity-90 transition-opacity"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
