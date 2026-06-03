import React from 'react';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e8cbb0] overflow-hidden">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-[#746f67] hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 pb-4 text-center">
                    <h2 className="text-3xl font-extrabold text-[#8c2f39]">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-sm text-[#746f67] mt-1">
                        {isSignUp ? 'Join The Picnic Basket community!' : 'Unpack your favorite recipes.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                    {isSignUp && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#2b2418] mb-1">First Name</label>
                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Jane" className="w-full px-3 py-2 border border-[#d8d0bf] rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#2b2418] mb-1">Last Name</label>
                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full px-3 py-2 border border-[#d8d0bf] rounded-lg text-sm" />
                            </div>
                        </div>
                    )}

                    {isSignUp && (
                        <div>
                            <label className="block text-xs font-semibold text-[#2b2418] mb-1">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="w-full px-3 py-2 border border-[#d8d0bf] rounded-lg text-sm" />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#2b2418] mb-1">Username</label>
                        <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="picnic_lover" className="w-full px-3 py-2 border border-[#d8d0bf] rounded-lg text-sm" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#2b2418] mb-1">Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2 border border-[#d8d0bf] rounded-lg text-sm" />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center -mb-2">{error}</p>}
                    <button type="submit" className="w-full mt-2 py-2.5 bg-[#d94e5a] text-white rounded-full font-semibold hover:bg-[#be3b47] transition-all shadow-md">
                        {isSignUp ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div className="px-6 py-4 bg-[#fcfaf7] border-t border-[#d8d0bf] text-center text-sm text-[#746f67]">
                    {isSignUp ? "Already have an account? " : "New to the basket? "}
                    <button
                        type="button"
                        onClick={() => setMode(isSignUp ? 'login' : 'signup')}
                        className="text-[#8c2f39] font-bold hover:underline focus:outline-none"
                    >
                        {isSignUp ? 'Log In' : 'Create an account'}
                    </button>
                </div>

            </div>
        </div>
    );
}