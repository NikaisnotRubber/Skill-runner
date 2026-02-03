import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseSkillFile, parseSkillMetadata } from "./parser";
import type { Skill, SkillMetadata } from "./types";

/**
 * Default skills directory path
 */
const DEFAULT_SKILLS_DIR = ".agent/skills";

/**
 * Skill loader with caching support
 */
export class SkillLoader {
    private skillsDir: string;
    private skillCache: Map<string, Skill> = new Map();
    private metadataCache: SkillMetadata[] | null = null;

    constructor(skillsDir?: string) {
        this.skillsDir = skillsDir || resolve(process.cwd(), DEFAULT_SKILLS_DIR);
    }

    /**
     * Discover all skills in the skills directory
     * Returns lightweight metadata for system prompt injection
     */
    async discoverSkills(): Promise<SkillMetadata[]> {
        if (this.metadataCache) {
            return this.metadataCache;
        }

        const skills: SkillMetadata[] = [];

        try {
            const entries = await readdir(this.skillsDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const skillPath = join(this.skillsDir, entry.name, "SKILL.md");
                    try {
                        const content = await readFile(skillPath, "utf-8");
                        const metadata = parseSkillMetadata(content, skillPath);
                        skills.push(metadata);
                    } catch {
                        // Skip directories without valid SKILL.md
                        console.warn(`Skipping ${entry.name}: no valid SKILL.md found`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning skills directory: ${error}`);
        }

        this.metadataCache = skills;
        return skills;
    }

    /**
     * Load full skill content by name (on-demand)
     */
    async loadSkill(skillName: string): Promise<Skill | null> {
        // Check cache first
        if (this.skillCache.has(skillName)) {
            return this.skillCache.get(skillName)!;
        }

        const skillPath = join(this.skillsDir, skillName, "SKILL.md");

        try {
            const content = await readFile(skillPath, "utf-8");
            const skill = parseSkillFile(content, skillPath);
            this.skillCache.set(skillName, skill);
            return skill;
        } catch (error) {
            console.error(`Failed to load skill "${skillName}": ${error}`);
            return null;
        }
    }

    /**
     * Get list of available skill names
     */
    async getAvailableSkillNames(): Promise<string[]> {
        const metadata = await this.discoverSkills();
        return metadata.map((s) => s.name);
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        this.skillCache.clear();
        this.metadataCache = null;
    }
}

// Singleton instance for convenience
let defaultLoader: SkillLoader | null = null;

export function getSkillLoader(skillsDir?: string): SkillLoader {
    if (!defaultLoader || skillsDir) {
        defaultLoader = new SkillLoader(skillsDir);
    }
    return defaultLoader;
}
