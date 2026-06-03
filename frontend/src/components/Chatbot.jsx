import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Chatbot({ recipe }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");

    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (recipe) {
            const recipeContext = `
                You are a helpful kitchen assistant. Here are the details of the recipe the user is viewing:
                Title: ${recipe.title}
                Description: ${recipe.description || "N/A"}
                Ingredients: ${recipe.ingredients?.map(i => typeof i === 'string' ? i : i.name).join(", ")}
                Instructions: ${recipe.instructions?.map((s, idx) => `${idx + 1}. ${typeof s === 'string' ? s : s.step}`).join(" ")}
            `;

            setMessages([
                { content: recipeContext, role: "system" },
                { content: `Hi! I'm your assistant for "${recipe.title}." Ask me anything about its ingredients or cooking steps!`, role: "assistant" },
            ]);
        }
    }, [recipe]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { content: input, role: "user" };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");

        try {
            const response = await axios.post(
                `${API_URL}/message`,
                {
                    messages: updatedMessages,
                }
            );

            setMessages([
                ...updatedMessages,
                response.data,
            ]);

        } catch (error) {
            console.error("Error talking to backend:", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[450px] bg-white border border-[#e8e0cc] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

                    <div className="bg-[#6b4f2e] text-white px-4 py-3 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">Recipe Assistant</h3>
                            <p className="text-xs text-white/70">{recipe?.title || "Loading context..."}</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white text-xl font-bold"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="flex-1 p-4 bg-[#FDFAF2] overflow-y-auto space-y-3 flex flex-col">
                        {messages
                            .filter((msg) => msg.role !== "system")
                            .map((msg, index) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={index}
                                        className={`max-w-[85%] text-sm p-3 rounded-xl border ${isUser
                                            ? "bg-[#c4a96a] text-white border-[#b39658] self-end rounded-tr-none"
                                            : "bg-white text-[#3a2e1e] border-[#e8e0cc] self-start rounded-tl-none"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                );
                            })}
                        <div ref={bottomRef} />
                    </div >

                    <div className="p-3 bg-white border-t border-[#e8e0cc] flex gap-2">
                        <input
                            type="text"
                            value={input}
                            placeholder="Type a message..."
                            className="flex-1 border border-[#e8e0cc] rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-black outline-none"
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                        <button
                            className="bg-[#c4a96a] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#b39658] transition-colors"
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#6b4f2e] hover:bg-[#543d22] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </div>
    );
}