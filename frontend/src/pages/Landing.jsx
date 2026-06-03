import React, { useState } from 'react';
import '../styles/Landing.css';
import AuthModal from '../components/AuthModal.jsx';

const BasketIcon = () => (
  <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 26 C8 26 10 16 20 16 C30 16 32 26 32 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M6 26 L34 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 26 L11 34 L29 34 L31 26" stroke="#3a2e1e" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M14 26 L15 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M20 26 L20 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M26 26 L25 34" stroke="#3a2e1e" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M17 16 C17 16 17 10 20 8 C23 10 23 16 23 16" stroke="#3a2e1e" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Landing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('login');

    
    const handleOpenModal = (mode) => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    return (
        <main className="landing-container">
            <div className="picnic-card">
                <div className="basket-icon"><BasketIcon /></div>
                <h1 className="app-title">The Picnic Basket</h1>
                <p className="welcome-message">
                    Welcome, friend! Unpack a world of delicious recipes and fresh culinary ideas. Your perfect meal is just a basket away.
                </p>
                
                <div className="auth-buttons">
                    <button className="btn btn-primary" onClick={() => handleOpenModal('signup')}>
                        Sign Up
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleOpenModal('login')}>
                        Log In
                    </button>
                </div>
            </div>

            <AuthModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                mode={modalMode}
                setMode={setModalMode}
            />
        </main>
    );
}