require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);


// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Image Generation Test Server is running!"
    });
});


// =====================================
// IMAGE GENERATION TEST
// =====================================

app.get("/api/test-image", async (req, res) => {

    try {

        console.log("Starting image generation test...");

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-image"
        });

        const prompt = `
Generate one professional realistic image of a modern luxury house exterior.

The house should have:
- Modern architectural design
- Two floors
- Large windows
- Main entrance
- Front elevation
- Professional landscaping
- Realistic materials
- Daytime lighting
- High-quality architectural visualization

Generate the IMAGE only.
`;

        console.log("Sending request to Gemini image model...");

        const result = await model.generateContent(prompt);

        const parts =
            result.response.candidates?.[0]?.content?.parts || [];

        const imagePart = parts.find(
            part => part.inlineData && part.inlineData.data
        );

        if (!imagePart) {

            const textPart = parts.find(
                part => part.text
            );

            console.log("Model did not return an image.");

            return res.status(500).json({
                success: false,
                error: textPart
                    ? textPart.text
                    : "The model did not return an image."
            });
        }

        console.log("IMAGE GENERATED SUCCESSFULLY!");

        res.json({
            success: true,
            message: "Image generation is working!",
            mimeType: imagePart.inlineData.mimeType,
            image: imagePart.inlineData.data
        });

    } catch (error) {

        console.error("IMAGE GENERATION ERROR:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }

});


// =====================================
// START SERVER
// =====================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Image test server running on port ${PORT}`);
});