const { OpenAI } = require('openai');
const express = require('express');
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            error: "Messages must be an array",
        });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const aiMessage = response.choices[0].message;

        res.status(200).json({
            role: aiMessage.role,
            content: aiMessage.content,
        });
    } catch (error) {
        console.error("OpenAI API error:", error);
        res.status(500).json({
            error: "OpenAI API failed",
        });
    }
});

module.exports = router;