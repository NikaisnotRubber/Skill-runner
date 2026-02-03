import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { spawn } from "node:child_process";

/**
 * Execute command using spawn (GUI-friendly mode)
 * This allows headed browsers and other GUI applications to display properly
 */
async function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const isWindows = process.platform === "win32";
        const shell = isWindows ? "cmd.exe" : "/bin/sh";
        const shellFlag = isWindows ? "/c" : "-c";

        const child = spawn(shell, [shellFlag, command], {
            stdio: ["inherit", "pipe", "pipe"],
            windowsHide: false,
            env: { ...process.env },
        });

        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (data) => {
            const text = data.toString();
            stdout += text;
            process.stdout.write(text);
        });

        child.stderr?.on("data", (data) => {
            const text = data.toString();
            stderr += text;
            process.stderr.write(text);
        });

        child.on("close", (code) => {
            let result = "";
            if (stdout) result += `STDOUT:\n${stdout}\n`;
            if (stderr) result += `STDERR:\n${stderr}\n`;
            if (!result) result = "Command executed successfully with no output.";

            if (code === 0) {
                resolve(result.trim());
            } else {
                resolve(`Command exited with code ${code}\n${result.trim()}`);
            }
        });

        child.on("error", (error) => {
            reject(new Error(`Failed to execute command: ${error.message}`));
        });
    });
}

/**
 * Tool for executing shell commands
 * Allows the agent to perform actions described in skills
 */
export const runCommandTool = tool(
    async ({ command }) => {
        try {
            console.log(`\n💻 Executing: ${command}`);
            return await executeCommand(command);
        } catch (error: any) {
            return `Error executing command: ${error.message}\nSTDERR: ${error.stderr || ""}`;
        }
    },
    {
        name: "run_command",
        description: `Execute a shell command on the local system. 
Use this to perform actions described in skill instructions, such as 'agent-browser' commands.
Do not just output the command in markdown, actually execute it with this tool.`,
        schema: z.object({
            command: z.string().describe("The shell command to execute"),
        }),
    }
);
