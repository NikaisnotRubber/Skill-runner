import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

/**
 * Create OpenAI-compatible LLM instance
 * Supports custom base URL for alternative providers
 */
export function createLLM() {
    const model = new ChatOpenAI({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        configuration: {
            baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        },
    });

    return model;
}

/**
 * Get default LLM instance for agents
 */
export function getDefaultLLM() {
    return createLLM();
}
