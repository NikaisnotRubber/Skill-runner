import "dotenv/config";
import * as readline from "node:readline";
import { createSkillAgent } from "./agent/skill-agent";
import { getDiscoveredSkills } from "./middleware/skill-middleware";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
    console.log("🔧 Skill Loader - LangChain 1.x Demo\n");

    // Discover available skills
    const skills = await getDiscoveredSkills();
    console.log("📚 Discovered Skills:");
    if (skills.length === 0) {
        console.log("   (No skills found in .agent/skills)");
    } else {
        skills.forEach((skill) => {
            console.log(`   - ${skill.name}: ${skill.description.slice(0, 60)}...`);
        });
    }
    console.log();

    // Create agent
    console.log("🤖 Initializing agent...");
    const { agent } = await createSkillAgent();
    console.log("✅ Agent ready!\n");

    // Generate unique thread ID for this session
    const threadId = `session-${Date.now()}`;
    const config = { configurable: { thread_id: threadId } };

    // Create readline interface for user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('💬 Enter your query (type "exit" to quit):');
    console.log("─".repeat(50));

    const askQuestion = () => {
        rl.question("\n> ", async (input) => {
            const query = input.trim();

            if (query.toLowerCase() === "exit") {
                console.log("\n👋 Goodbye!");
                rl.close();
                process.exit(0);
            }

            if (!query) {
                askQuestion();
                return;
            }

            try {
                console.log("\n🔄 Processing...\n");

                const result = await agent.invoke(
                    {
                        messages: [new HumanMessage(query)],
                    },
                    config
                );

                // Display structured response if available
                console.log("─".repeat(50));
                console.log("🤖 Assistant:");

                if (result.structuredResponse) {
                    console.log("\n📋 Structured Response:");
                    console.log(JSON.stringify(result.structuredResponse, null, 2));
                    console.log();
                } else {
                    // Fallback to message content if no structured response
                    const messages = result.messages;
                    const lastMessage = messages[messages.length - 1];
                    console.log(lastMessage.content);
                }

                console.log("─".repeat(50));
            } catch (error) {
                console.error("❌ Error:", error);
            }

            askQuestion();
        });
    };

    askQuestion();
}

main().catch(console.error);
