import { z } from "zod";

/**
 * SKILL.md Frontmatter Schema
 * Validates the YAML frontmatter of a SKILL.md file
 */
export const SkillFrontmatterSchema = z.object({
    name: z.string().describe("Unique identifier for the skill"),
    description: z.string().describe("1-2 sentence description shown in system prompt"),
    "allowed-tools": z.string().optional().describe("Optional tool permissions"),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

/**
 * Complete Skill Schema
 * Combines frontmatter metadata with full markdown content
 */
export const SkillSchema = z.object({
    name: z.string(),
    description: z.string(),
    allowedTools: z.string().optional(),
    content: z.string().describe("Full markdown content of the skill"),
    path: z.string().describe("File path to the SKILL.md file"),
});

export type Skill = z.infer<typeof SkillSchema>;

/**
 * Lightweight skill metadata for system prompt injection
 * (Progressive Disclosure - Level 1)
 */
export interface SkillMetadata {
    name: string;
    description: string;
}

/**
 * Full skill with content for on-demand loading
 * (Progressive Disclosure - Level 2)
 */
export interface SkillWithContent extends SkillMetadata {
    content: string;
    allowedTools?: string;
    path: string;
}
