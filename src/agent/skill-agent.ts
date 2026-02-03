import { createAgent, toolStrategy, providerStrategy } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { getDefaultLLM } from "../utils/llm-factory";
import {
    skillMiddleware,
    getSkillTools,
} from "../middleware/skill-middleware";
import { z } from "zod";

const AgentResponseSchema = z.object({
    answer: z.string().describe("The comprehensive answer to the user's question"),
    skillsUsed: z.array(z.string()).optional().describe("Names of skills that were loaded (e.g., 'agent-browser')"),
    commandsExecuted: z.array(z.string()).optional().describe("Shell commands that were executed via run_command tool"),
    data: z.array(z.object({
        label: z.string().describe("Label or category for this data item"),
        value: z.string().describe("The actual data value"),
    })).optional().describe("Structured data extracted from the execution results"),
    actionsSummary: z.string().optional().describe("Brief summary of what actions were performed"),
});

const BASE_SYSTEM_PROMPT = `You are a precision-focused AI assistant equipped with specialized tools.

## GLOBAL EXECUTION PROTOCOL
1. **Analyze Request**: Determine if the user's request requires specific skills (like browser, data analysis).
2. **Load Skills**: If needed, use 'load_skill' immediately.
3. **Execute Commands**: If a skill instruction provides shell commands, YOU MUST EXECUTE them using 'run_command'. DO NOT output the command as text.
4. **Finalize**: Once you have the necessary information, you MUST use the 'respond_to_user' tool to submit your final answer.

## CRITICAL RULES
- **NO CHAT**: Do not reply with plain text messages. Your final output MUST be a tool call to 'respond_to_user'.
- **COMMANDS**: Never suggest commands to the user; execute them yourself via 'run_command'.
- **STRUCTURE**: Ensure all extracted data is placed in the 'data' field of the 'respond_to_user' tool, not just in the text answer.

## SKILL USAGE
- When you load a skill, strictly follow its internal "Instruction" field.
- If a skill fails, report the error in the 'actionsSummary' field of the response tool.`;

/**
 * Create a skill-aware agent
 */
export async function createSkillAgent() {
    const llm = getDefaultLLM();
    const tools = getSkillTools();

    const checkpointer = new MemorySaver();

    const agent = createAgent({
        model: llm,
        tools,
        checkpointer,
        systemPrompt: BASE_SYSTEM_PROMPT,
        middleware: [skillMiddleware],
        responseFormat: providerStrategy(AgentResponseSchema),
    });

    return { agent, checkpointer };
}