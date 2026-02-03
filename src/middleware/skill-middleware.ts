import { createMiddleware } from "langchain";
import { getSkillLoader } from "../skills/loader";
import { loadSkillTool } from "../tools/load-skill";
import { runCommandTool } from "../tools/run-command";
import type { SkillMetadata } from "../skills/types";

/**
 * Build skills section for system prompt
 */
function buildSkillsPrompt(skills: SkillMetadata[]): string {
    if (skills.length === 0) {
        return "";
    }

    const skillsList = skills
        .map((skill) => `- **${skill.name}**: ${skill.description}`)
        .join("\n");

    return `

## Available Skills

${skillsList}

Use the load_skill tool when you need detailed information about handling a specific type of request.`;
}

/**
 * Skill middleware that dynamically injects skills information into system prompt
 */
export const skillMiddleware = createMiddleware({
    name: "skillMiddleware",
    wrapModelCall: async (request, handler) => {
        const loader = getSkillLoader();
        const skills = await loader.discoverSkills();
        const skillsAddendum = buildSkillsPrompt(skills);

        // Append skills information to system prompt
        const newSystemPrompt = request.systemPrompt + skillsAddendum;

        return handler({
            ...request,
            systemPrompt: newSystemPrompt,
        });
    },
});

/**
 * Get skill tools for agent
 */
export function getSkillTools() {
    return [loadSkillTool, runCommandTool];
}

/**
 * Get discovered skills metadata
 */
export async function getDiscoveredSkills(): Promise<SkillMetadata[]> {
    const loader = getSkillLoader();
    return loader.discoverSkills();
}
