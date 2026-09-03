require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: apiKey
});


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

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: "Reply with exactly: Gemini connection successful."
        });

        res.json({
            success: true,
            response: response.text
        });

    } catch (error) {

        console.error("Gemini Test Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// =====================================
// GENERATE ARCHITECTURE IMAGE
// =====================================

app.post("/api/generate-architecture", async (req, res) => {

    try {

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
            additionalRequirements
        } = req.body;


        // =====================================
        // VALIDATION
        // =====================================

        if (!propertySize) {
            return res.status(400).json({
                success: false,
                error: "Property size is required."
            });
        }

        if (!plotLength || !plotWidth) {
            return res.status(400).json({
                success: false,
                error: "Plot length and width are required."
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


        // =====================================
        // ARCHITECTURAL IMAGE PROMPT
        // =====================================

        const prompt = `

You are a professional architectural visualization AI.

Create a professional architectural design image based
STRICTLY on the following client requirements.

CLIENT REQUIREMENTS

Property Size:
${propertySize}

Plot Length:
${plotLength} feet

Plot Width:
${plotWidth} feet

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


==================================================
PRIMARY OUTPUT
==================================================

Create a PROFESSIONAL 2D ARCHITECTURAL FLOOR PLAN.

The floor plan must be a clean professional architectural
top-view drawing.

It must include:

- Complete plot boundary
- Accurate plot dimensions
- Room names
- Numeric room dimensions
- Bedrooms
- Bathrooms
- Kitchen
- Living room
- Drawing room where appropriate
- Dining area where appropriate
- Parking
- Main entrance
- Internal doors
- Windows
- Staircase
- Circulation areas
- Service areas
- Proper room proportions
- Logical architectural circulation

Use actual numeric measurements.

The room dimensions must be internally consistent with
the supplied plot dimensions.

Do NOT produce a text-only answer.

Do NOT produce a description instead of the floor plan.

The MAIN OUTPUT MUST BE AN IMAGE.


==================================================
FLOOR PLAN STYLE
==================================================

Professional architectural CAD-style presentation.

Top-down orthographic view.

Clean black/white architectural drawing.

Clear walls.

Clear doors.

Clear windows.

Clear stairs.

Clear room labels.

Clear dimensions.

Professional architectural drafting appearance.

White drawing background.

Thin precise architectural lines.

Readable measurements.

No people.

No decorative artwork.

No random furniture that makes the floor plan difficult
to read.


==================================================
3D ARCHITECTURAL REQUIREMENT
==================================================

After establishing the floor-plan concept, create a realistic
architectural visualization of the SAME HOUSE DESIGN.

The 3D design must follow the same architectural concept.

Use:

- ${style || "Modern"} architectural style
- Realistic materials
- Professional lighting
- Realistic windows
- Realistic doors
- Proper entrance
- Proper parking
- Landscaping where appropriate
- Professional architectural visualization
- High-quality realistic rendering

The 3D house must NOT become an unrelated design.


==================================================
IMPORTANT
==================================================

The supplied dimensions and requirements are the source of truth.

Do not randomly change:

- Plot size
- Plot dimensions
- Number of floors
- Bedrooms
- Bathrooms
- Kitchens
- Parking

Do not add random rooms.

Do not remove required rooms.

Create a professional preliminary architectural concept.

This is NOT a construction-ready drawing.

A licensed architect or engineer must review the design
before construction.

MOST IMPORTANT:

RETURN AN ACTUAL IMAGE.

Do not return only a text prompt.

Do not return only an architectural description.

Generate the image itself.
`;


        // =====================================
        // GEMINI IMAGE GENERATION
        // =====================================

        console.log("Starting Gemini image generation...");

        const response = await ai.models.generateContent({

            model: "gemini-3.1-flash-image",

            contents: prompt,

            config: {
                responseModalities: ["IMAGE", "TEXT"]
            }

        });


        // =====================================
        // FIND GENERATED IMAGE
        // =====================================

        const parts =
            response.candidates?.[0]?.content?.parts || [];

        let imageData = null;
        let mimeType = "image/png";
        let textResponse = "";


        for (const part of parts) {

            if (part.text) {
                textResponse += part.text;
            }

            if (part.inlineData) {

                imageData = part.inlineData.data;

                if (part.inlineData.mimeType) {
                    mimeType = part.inlineData.mimeType;
                }

            }

        }


        // =====================================
        // IMAGE NOT FOUND
        // =====================================

        if (!imageData) {

            console.error(
                "Gemini returned no image.",
                textResponse
            );

            return res.status(500).json({

                success: false,

                error:
                    textResponse ||
                    "Gemini did not return an image."
            });

        }


        // =====================================
        // RETURN IMAGE TO FRONTEND
        // =====================================

        console.log(
            "Image generated successfully."
        );

        res.json({

            success: true,

            floorPlan:
                `data:${mimeType};base64,${imageData}`,

            render3D: null,

            mimeType: mimeType,

            description:
                textResponse ||
                "Architectural image generated successfully."

        });


    } catch (error) {

        console.error(
            "Architecture Image Generation Error:"
        );

        console.error(error);

        res.status(500).json({

            success: false,

            error: error.message ||
                "Image generation failed."

        });

    }

});


// =====================================
// START SERVER
// =====================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `AI Architecture Generator Backend running on port ${PORT}`
    );

});