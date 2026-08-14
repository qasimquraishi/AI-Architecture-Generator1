require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateImage() {
    try {
        const response = await ai.models.generateContent({
            model: "nano-banana-pro-preview",

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `
Create a professional photorealistic architectural visualization.

A modern two-story residential house on a 5 marla plot.
3 bedrooms, 3 bathrooms, 1 kitchen, and parking for 2 cars.
Modern contemporary Pakistani residential architecture.
Elegant exterior facade, realistic construction materials,
large windows, balanced proportions, landscaped entrance,
professional architectural visualization, daylight,
high detail, realistic shadows and materials.

Generate ONLY the architectural image.
`
                        }
                    ]
                }
            ],

            config: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "2K"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {

            if (part.inlineData) {
                const imageData = part.inlineData.data;

                const buffer = Buffer.from(imageData, "base64");

                fs.writeFileSync(
                    "architecture-test.png",
                    buffer
                );

                console.log("IMAGE GENERATED SUCCESSFULLY!");
                console.log("Saved as architecture-test.png");
                return;
            }
        }

        console.log("No image was returned.");
        console.log(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error("IMAGE GENERATION ERROR:");
        console.error(error.message);
    }
}

generateImage();