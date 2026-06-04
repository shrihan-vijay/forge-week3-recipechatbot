import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
    return (
        <div className="home-page">
            <section className="home-banner">
                <div className="home-banner-overlay">
                    <h1>Welcome to The Picnic Basket</h1>
                    <p>Your cozy corner for discovering and sharing recipes</p>
                </div>
            </section>

            <section className="home-message">
                <p>
                    View the most{" "}
                    <Link to="/recipes" className="home-link">popular recipes</Link>{" "}
                    submitted by other users, save your{" "}
                    <Link to="/myrecipes" className="home-link">favorites</Link>
                    , and{" "}
                    <Link to="/create" className="home-link">create</Link>{" "}
                    your own!
                </p>
            </section>

            <footer className="home-footer">
                <p>The Picnic Basket &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}
