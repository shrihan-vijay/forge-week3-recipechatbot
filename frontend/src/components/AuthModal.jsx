import React from 'react';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthModal.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AuthModal({ isOpen, onClose, mode, setMode }) {
    const { login } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = React.useState('');

    if (!isOpen) return null;
    const isSignUp = mode === 'signup';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        isSignUp ? handleSignUp() : handleLogin();
    };

    const handleSignUp = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Sign up failed');
            login(data);
            onClose();
            navigate('/home');
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    const handleLogin = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Login failed');
            login(data);
            console.log('navigating to /home', data);
            onClose();
            navigate('/home');
        } catch {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal">

                <button onClick={onClose} className="auth-close-btn" aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className="auth-header">
                    <h2 className="auth-title">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="auth-subtitle">
                        {isSignUp ? 'Join The Picnic Basket community!' : 'Unpack your favorite recipes.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form auth-form-space">
                    {isSignUp && (
                        <div className="auth-grid-split">
                            <div>
                                <label className="auth-label">First Name</label>
                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Jane" className="auth-input" />
                            </div>
                            <div>
                                <label className="auth-label">Last Name</label>
                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className="auth-input" />
                            </div>
                        </div>
                    )}

                    {isSignUp && (
                        <div>
                            <label className="auth-label">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="auth-input" />
                        </div>
                    )}

                    <div>
                        <label className="auth-label">Username</label>
                        <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="picnic_lover" className="auth-input" />
                    </div>

                    <div>
                        <label className="auth-label">Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="auth-input" />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit-btn">
                        {isSignUp ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    {isSignUp ? "Already have an account? " : "New to the basket? "}
                    <button
                        type="button"
                        onClick={() => setMode(isSignUp ? 'login' : 'signup')}
                        className="auth-toggle-btn"
                    >
                        {isSignUp ? 'Log In' : 'Create an account'}
                    </button>
                </div>

            </div>
        </div>
    );
}