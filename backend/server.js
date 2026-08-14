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
// HOME TEST
// =====================================

app.get("/", (req, res) => {

    res.json({
        success: true,
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
            length,
            width,
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
                success: false,
                error: "Property size is required."
            });
        }

        if (!floors) {
            return res.status(400).json({
                success: false,
                error: "Number of floors is required."
            });
        }

        if (!bedrooms) {
            return res.status(400).json({
                success: false,
                error: "Number of bedrooms is required."
            });
        }

        if (!bathrooms) {
            return res.status(400).json({
                success: false,
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

Plot Length:
${length || "Not specified"}

Plot Width:
${width || "Not specified"}

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
${style || "Modern"}

Additional Requirements:
${additionalRequirements || "None"}


IMPORTANT ARCHITECTURAL REQUIREMENTS

Create a practical and professional residential architectural concept.

Consider:

1. Efficient space planning.
2. Logical room relationships.
3. Privacy.
4. Natural lighting.
5. Natural ventilation.
6. Proper circulation.
7. Parking requirements.
8. Staircase placement.
9. Kitchen functionality.
10. Bedroom privacy.
11. Bathroom accessibility.
12. Modern architectural principles.
13. Appropriate room proportions.
14. Pakistani residential requirements.
15. Plot dimensions.
16. Proper entrance placement.
17. Logical door and window positions.
18. Practical service areas.


RETURN THE RESPONSE USING THESE SECTIONS:

PROJECT SUMMARY

PLOT DIMENSIONS

DESIGN CONCEPT

GROUND FLOOR

FIRST FLOOR

SECOND FLOOR

ROOM REQUIREMENTS

CIRCULATION

PARKING

STAIRCASE

DOORS AND WINDOWS

LIGHTING AND VENTILATION

KITCHEN

BATHROOMS

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

        const result = await model.generateContent(prompt);

        const text = result.response.text();


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
// GENERATE ARCHITECTURE IMAGE
// =====================================

app.post("/api/generate-image", async (req, res) => {

    try {

        const {
            propertySize,
            length,
            width,
            floors,
            bedrooms,
            bathrooms,
            kitchens,
            parking,
            style,
            additionalRequirements
        } = req.body;


        const imagePrompt = `

Create a professional architectural visualization
based strictly on the following project requirements.

PROPERTY SIZE:
${propertySize}

PLOT LENGTH:
${length || "Not specified"}

PLOT WIDTH:
${width || "Not specified"}

FLOORS:
${floors}

BEDROOMS:
${bedrooms}

BATHROOMS:
${bathrooms}

KITCHENS:
${kitchens || "Not specified"}

PARKING:
${parking || "Not specified"}

STYLE:
${style || "Modern"}

ADDITIONAL REQUIREMENTS:
${additionalRequirements || "None"}


ARCHITECTURAL REQUIREMENTS:

- Professional residential architecture
- Correct number of floors
- Correct number of bedrooms
- Correct number of bathrooms
- Correct kitchen arrangement
- Parking according to requirements
- Realistic room proportions
- Appropriate doors
- Appropriate windows
- Realistic staircase
- Logical circulation
- Professional exterior architecture
- Realistic materials
- Realistic lighting
- Professional architectural photography
- High-quality realistic 3D architectural rendering

The design must remain consistent with the supplied
project requirements.

Do not add random rooms.

Do not remove required rooms.

Do not create a different architectural layout.

This image is a preliminary architectural visualization
and must be reviewed by a professional architect before
construction.
`;


        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-image"
        });


        const result = await model.generateContent(imagePrompt);


        const parts =
            result.response.candidates?.[0]?.content?.parts || [];


        const imagePart = parts.find(
            part =>
                part.inlineData &&
                part.inlineData.data
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

        console.error(
            "Image Generation Error:",
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

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});