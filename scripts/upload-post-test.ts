import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";
import {
    POST_TO_LINKEDIN_ORGANIZATION,
    TEXT_ONLY_MODE,
} from "../src/agents/generate-post/constants.js";

/**
 * Generate a post based on a LangChain blog post.
 * This may be modified to generate posts for other content.
 */
async function invokeGraph() {
    const client = new Client({
        apiUrl: process.env.LANGGRAPH_API_URL || "http://localhost:54367",
    });

    let runId: string | undefined;
    let threadId: string | undefined;
    try {
        const thread = await client.threads.create();
        threadId = thread.thread_id;
        const run = await client.runs.create(thread.thread_id, "upload_post", {
            input: {
                post: "Hello everyone !",
            },
            config: {
                configurable: {
                    [POST_TO_LINKEDIN_ORGANIZATION]: false,
                    [TEXT_ONLY_MODE]: true,
                },
            },
        });
        runId = run.run_id;
    } catch (e) {
        console.error("Failed to create upload_post run", e);
        throw e;
    }

    if (!runId || !threadId) {
        throw new Error("Failed to create upload_post run");
    }
}

invokeGraph().catch(console.error);
