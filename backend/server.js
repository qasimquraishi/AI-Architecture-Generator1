require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Architecture Backend is working."
    });
});

// Prevent favicon request from causing confusion
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// ===============================
// IMAGE GENERATION
// ===============================

async function generateImage(req, res) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GEMINI_API_KEY is missing in Vercel Environment Variables."
            });
        }

        // Create Gemini client ONLY when this route is called
        const ai = new GoogleGenAI({
            apiKey: apiKey
        });

        const userPrompt =
            req.body?.prompt ||
            req.body?.additionalRequirements ||
            `
Create a professional realistic architectural image
of a modern luxury two-storey residence.

Requirements:
- professional architectural visualization
- realistic materials
- realistic lighting
- premium front elevation
- large windows
- driveway
- landscaping
- highly detailed
- photorealistic

Return an actual image.
`;

        console.log("Starting Gemini image generation...");

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: userPrompt,
            config: {
                responseModalities: ["IMAGE", "TEXT"]
            }
        });

        const parts =
            response.candidates?.[0]?.content?.parts || [];

        let imageData = null;
        let mimeType = "image/png";
        let textResponse = "";

        for (const part of parts) {
            if (part.text) {
                textResponse += part.text;
            }

            if (part.inlineData?.data) {
                imageData = part.inlineData.data;
                mimeType =
                    part.inlineData.mimeType || "image/png";
            }
        }

        if (!imageData) {
            return res.status(500).json({
                success: false,
                error:
                    textResponse ||
                    "Gemini responded but did not return an image."
            });
        }

        return res.json({
            success: true,
            image: `data:${mimeType};base64,${imageData}`,
            floorPlan: `data:${mimeType};base64,${imageData}`,
            mimeType: mimeType,
            message: textResponse
        });

    } catch (error) {
        console.error("IMAGE GENERATION ERROR:", error);

        return res.status(500).json({
            success: false,
            error:
                error?.message ||
                String(error) ||
                "Image generation failed."
        });
    }
}

// Your frontend previously called this endpoint
app.post("/api/generate-image", generateImage);

// Keep this endpoint too
app.post("/api/test-image", generateImage);

module.exports = app;
