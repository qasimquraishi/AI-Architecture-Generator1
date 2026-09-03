require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: apiKey
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Architecture Backend is working."
    });
});

app.get("/api/test-image", async (req, res) => {
    try {

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GEMINI_API_KEY is missing."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: `
Generate a professional realistic architectural image
of a modern luxury two-storey house.

Include:
- modern front elevation
- large windows
- premium materials
- realistic lighting
- landscaping
- driveway
- professional architectural visualization

Return an actual image.
`,
            config: {
                responseModalities: ["IMAGE", "TEXT"]
            }
        });

        const parts =
            response.candidates?.[0]?.content?.parts || [];

        let imageData = null;
        let mimeType = "image/png";
        let text = "";

        for (const part of parts) {

            if (part.text) {
                text += part.text;
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
                    text ||
                    "Gemini did not return an image."
            });
        }

        res.json({
            success: true,
            image:
                `data:${mimeType};base64,${imageData}`,
            mimeType: mimeType
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error:
                error.message ||
                "Image generation failed."
        });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: apiKey
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Architecture Backend is working."
    });
});

app.get("/api/test-image", async (req, res) => {
    try {

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GEMINI_API_KEY is missing."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: `
Generate a professional realistic architectural image
of a modern luxury two-storey house.

Include:
- modern front elevation
- large windows
- premium materials
- realistic lighting
- landscaping
- driveway
- professional architectural visualization

Return an actual image.
`,
            config: {
                responseModalities: ["IMAGE", "TEXT"]
            }
        });

        const parts =
            response.candidates?.[0]?.content?.parts || [];

        let imageData = null;
        let mimeType = "image/png";
        let text = "";

        for (const part of parts) {

            if (part.text) {
                text += part.text;
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
                    text ||
                    "Gemini did not return an image."
            });
        }

        res.json({
            success: true,
            image:
                `data:${mimeType};base64,${imageData}`,
            mimeType: mimeType
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error:
                error.message ||
                "Image generation failed."
        });
    }
});

module.exports = app;
