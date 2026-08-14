require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);


// =====================================
// HOME TEST
// =====================================

app.get("/", (req, res) => {
    res.json({
        message: "AI Architecture Generator Backend is running!"
    });
});


// =====================================
// TEST GEMINI
// =====================================

app.post("/api/test-gemini", async (req, res) => {

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash"
        });

        const result = await model.generateContent(
            "Reply with exactly: Gemini connection successful."
        );

        const text = result.response.text();

        res.json({
            success: true,
            response: text
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// =====================================
// GENERATE ARCHITECTURE
// =====================================

app.post("/api/generate-architecture", async (req, res) => {

    try {

        const {
            propertySize,
            floors,
            bedrooms,
            bathrooms,
            kitchens,
            parking,
            style,
            additionalRequirements
        } = req.body;


        // -----------------------------
        // VALIDATION
        // -----------------------------

        if (!propertySize) {
            return res.status(400).json({
                error: "Property size is required."
            });
        }

        if (!floors) {
            return res.status(400).json({
                error: "Number of floors is required."
            });
        }

        if (!bedrooms) {
            return res.status(400).json({
                error: "Number of bedrooms is required."
            });
        }

        if (!bathrooms) {
            return res.status(400).json({
                error: "Number of bathrooms is required."
            });
        }


        // -----------------------------
        // GEMINI MODEL
        // -----------------------------

        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash"
        });


        // -----------------------------
        // PROFESSIONAL ARCHITECT PROMPT
        // -----------------------------

        const prompt = `

You are a professional architectural design assistant.

Create a detailed preliminary architectural concept based on
the following client requirements.

PROJECT REQUIREMENTS

Property Size:
${propertySize}

Number of Floors:
${floors}

Bedrooms:
${bedrooms}

Bathrooms:
${bathrooms}

Kitchens:
${kitchens || "Not specified"}

Parking:
${parking || "Not specified"}

Architectural Style:
${style}

Additional Requirements:
${additionalRequirements || "None"}

IMPORTANT:

Create a practical and professional architectural concept.

Consider:

1. Efficient space planning.
2. Logical room relationships.
3. Privacy.
4. Natural lighting.
5. Natural ventilation.
6. Circulation.
7. Parking requirements.
8. Staircase placement.
9. Kitchen functionality.
10. Bedroom privacy.
11. Bathroom accessibility.
12. Modern architectural principles.
13. Appropriate proportions.
14. Pakistani residential requirements.

Return the answer using these sections:

PROJECT SUMMARY

DESIGN CONCEPT

GROUND FLOOR

FIRST FLOOR

SECOND FLOOR

ROOM REQUIREMENTS

CIRCULATION

PARKING

LIGHTING AND VENTILATION

EXTERIOR DESIGN

IMPORTANT ARCHITECTURAL NOTES

IMPORTANT:
This is a preliminary AI-generated concept and not a
construction-ready architectural drawing.
A licensed architect or engineer must review the design
before construction.

`;


        // -----------------------------
        // GENERATE RESPONSE
        // -----------------------------

        const result =
            await model.generateContent(prompt);

        const text =
            result.response.text();


        // -----------------------------
        // SEND TO FRONTEND
        // -----------------------------

        res.json({

            success: true,

            response: text

        });


    } catch (error) {

        console.error(
            "Architecture Generation Error:",
            error
        );

        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
// =====================================
// GENERATE ARCHITECTURE IMAGE
// =====================================

app.post("/api/generate-image", async (req, res) => {

    try {

        const {
            propertySize,
            floors,
            bedrooms,
            bathrooms,
            kitchens,
            parking,
            style,
            additionalRequirements
        } = req.body;

        const imagePrompt = `
Create a professional architectural visualization based on these requirements.

Property size: ${propertySize}
Floors: ${floors}
Bedrooms: ${bedrooms}
Bathrooms: ${bathrooms}
Kitchens: ${kitchens || "Not specified"}
Parking: ${parking || "Not specified"}
Style: ${style || "Modern"}
Additional requirements: ${additionalRequirements || "None"}

Generate a realistic professional architectural image.
The design should be physically plausible and suitable as a
preliminary architectural concept.

Show:
- correct number of floors
- realistic room proportions
- appropriate windows and doors
- realistic staircase placement
- parking according to requirements
- modern architectural styling
- professional architectural visualization
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-image"
        });

        const result = await model.generateContent(imagePrompt);

        const parts = result.response.candidates?.[0]?.content?.parts || [];

        const imagePart = parts.find(
            part => part.inlineData && part.inlineData.data
        );

        if (!imagePart) {

            const textPart = parts.find(
                part => part.text
            );

            return res.status(500).json({
                success: false,
                error: textPart
                    ? textPart.text
                    : "The model did not return an image."
            });
        }

        res.json({
            success: true,
            mimeType: imagePart.inlineData.mimeType,
            image: imagePart.inlineData.data
        });

    } catch (error) {

        console.error("Image Generation Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});