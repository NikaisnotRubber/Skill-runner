import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getSkillLoader } from "../skills/loader";

/**
 * Tool for on-demand skill loading
 * Part of progressive disclosure pattern
 */
export const loadSkillTool = tool(
    async ({ skillName }) => {
        const loader = getSkillLoader();
        const skill = await loader.loadSkill(skillName);

        if (skill) {
            return `Loaded skill: ${skillName}\n\n${skill.content}`;
        }

        // Skill not found - provide helpful error
        const available = await loader.getAvailableSkillNames();
        return `Skill '${skillName}' not found. Available skills: ${available.join(", ")}`;
    },
    {
        name: "load_skill",
        description: `Load the full content of a skill into your context.

Use this when you need detailed information about how to handle a specific
type of request. This will provide you with comprehensive instructions,
examples, and guidelines for the skill area.

Available skills will be listed in the system prompt.`,
        schema: z.object({
            skillName: z.string().describe("The name of the skill to load"),
        }),
    }
);
