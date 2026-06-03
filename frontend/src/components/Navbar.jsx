import { Link } from "react-router-dom";

const BasketIcon = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 26 C8 26 10 16 20 16 C30 16 32 26 32 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6 26 L34 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 26 L11 34 L29 34 L31 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 26 L15 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M20 26 L20 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M26 26 L25 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M17 16 C17 16 17 10 20 8 C23 10 23 16 23 16" stroke="#3a2e1e" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Admin", path: "/admin" },
    { label: "Recipes", path: "/recipes" },
    { label: "My Recipes", path: "/myrecipes" },
    { label: "Create", path: "/create" },
];

export default function Navbar() {
    return (
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
            </ul>
        </nav>
    );
}
