require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// =====================================
// HOME / HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Architecture Backend is working."
    });
});

app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// =====================================
// IMAGE GENERATION FUNCTION
// =====================================

async function generateImage(req, res) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GEMINI_API_KEY is missing in Vercel Environment Variables."
            });
        }

        const ai = new GoogleGenAI({
            apiKey: apiKey
        });

        const {
            propertySize,
            plotLength,
            plotWidth,
            floors,
            bedrooms,
            bathrooms,
            kitchens,
            parking,
            style,
            additionalRequirements,
            architectureBrief,
            prompt
        } = req.body || {};

        const finalPrompt =
            prompt ||
            architectureBrief ||
            `
You are a professional architectural visualization AI.

Create an ACTUAL ARCHITECTURAL IMAGE based on these client requirements.

Property Size:
${propertySize || "Not specified"}

Plot Length:
${plotLength || "Not specified"} feet

Plot Width:
${plotWidth || "Not specified"} feet

Floors:
${floors || "Not specified"}

Bedrooms:
${bedrooms || "Not specified"}

Bathrooms:
${bathrooms || "Not specified"}

Kitchens:
${kitchens || "Not specified"}

Parking:
${parking || "Not specified"}

Architectural Style:
${style || "Modern Luxury"}

Additional Requirements:
${additionalRequirements || "None"}

IMPORTANT OUTPUT REQUIREMENTS:

Create a professional architectural image.

The primary image should be a clean architectural 2D top-view floor plan concept.

Include where appropriate:
- plot boundaries
- room labels
- bedrooms
- bathrooms
- kitchen
- living room
- drawing room
- dining area
- stairs
- parking
- doors
- windows
- room proportions
- clear architectural layout
- dimensions where possible

Professional architectural drafting presentation.
Clean white background.
Precise lines.
Readable room labels.
No unrelated decorative artwork.

The design must respect the client's requirements.

RETURN AN ACTUAL IMAGE.
Do not return only text.
`;

        console.log("Starting Gemini image generation...");

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: finalPrompt,
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

            if (part.inlineData && part.inlineData.data) {
                imageData = part.inlineData.data;

                if (part.inlineData.mimeType) {
                    mimeType = part.inlineData.mimeType;
                }
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

        const imageUrl =
            `data:${mimeType};base64,${imageData}`;

        console.log("Image generated successfully.");

        return res.json({
            success: true,

            // Generic image field
            image: imageUrl,

            // Your existing frontend looks for this
            floorPlan: imageUrl,

            // Currently only one image is generated
            render3D: null,

            mimeType: mimeType,

            description:
                textResponse ||
                "Architectural image generated successfully."
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

// =====================================
// API ROUTES
// =====================================

// This is the endpoint your architecture frontend uses
app.post("/api/generate-architecture", generateImage);

// Keep these available for testing/compatibility
app.post("/api/generate-image", generateImage);
app.post("/api/test-image", generateImage);

// =====================================
// EXPORT FOR VERCEL
// =====================================

module.exports = app;
