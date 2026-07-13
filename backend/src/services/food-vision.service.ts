import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { HttpException } from "../exceptions/http-exception";
import { FoodAnalysisSchema, FoodAnalysis } from "../dtos/food-analysis.dto";

let client: Anthropic | null = null;

function getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new HttpException(
            500,
            "Photo analysis is not configured. Set ANTHROPIC_API_KEY on the backend to enable it."
        );
    }
    if (!client) {
        client = new Anthropic();
    }
    return client;
}

/**
 * FoodVisionService sends an uploaded meal photo to Claude's vision model and
 * returns a structured estimate of what the food is and how many calories it
 * likely contains, so the diet log can be pre-filled for the user to confirm.
 */
export class FoodVisionService {
    async analyzePhoto(filePath: string, mimeType: "image/jpeg" | "image/png"): Promise<FoodAnalysis> {
        const imageData = fs.readFileSync(filePath).toString("base64");

        const response = await getClient().messages.parse({
            model: "claude-opus-4-8",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: { type: "base64", media_type: mimeType, data: imageData },
                        },
                        {
                            type: "text",
                            text: "Look at this photo. Decide whether it shows food or a drink. If it does, name the dish and estimate the calories for the serving shown. If it does not show food, set isFood to false and leave foodName empty and estimatedCalories at 0.",
                        },
                    ],
                },
            ],
            output_config: { format: zodOutputFormat(FoodAnalysisSchema) },
        });

        if (response.stop_reason === "refusal" || !response.parsed_output) {
            throw new HttpException(422, "Could not analyze this photo. Please try a clearer picture or enter the meal manually.");
        }

        return response.parsed_output;
    }
}
