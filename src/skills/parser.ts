import YAML from "yaml";
import { SkillFrontmatterSchema, type Skill, type SkillFrontmatter } from "./types";

/**
 * Parse SKILL.md file content
 * Extracts YAML frontmatter and markdown content
 */
export function parseSkillFile(content: string, filePath: string): Skill {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        throw new Error(`Invalid SKILL.md format: missing frontmatter in ${filePath}`);
    }

    const [, frontmatterRaw, markdownContent] = match;

    // Parse YAML frontmatter
    let frontmatter: SkillFrontmatter;
    try {
        const parsed = YAML.parse(frontmatterRaw);
        frontmatter = SkillFrontmatterSchema.parse(parsed);
    } catch (error) {
        throw new Error(`Invalid frontmatter in ${filePath}: ${error}`);
    }

    return {
        name: frontmatter.name,
        description: frontmatter.description,
        allowedTools: frontmatter["allowed-tools"],
        content: markdownContent.trim(),
        path: filePath,
    };
}

/**
 * Parse frontmatter only (for lightweight metadata loading)
 */
export function parseSkillMetadata(
    content: string,
    filePath: string
): { name: string; description: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        throw new Error(`Invalid SKILL.md format: missing frontmatter in ${filePath}`);
    }

    const [, frontmatterRaw] = match;

    try {
        const parsed = YAML.parse(frontmatterRaw);
        const frontmatter = SkillFrontmatterSchema.parse(parsed);
        return {
            name: frontmatter.name,
            description: frontmatter.description,
        };
    } catch (error) {
        throw new Error(`Invalid frontmatter in ${filePath}: ${error}`);
    }
}
