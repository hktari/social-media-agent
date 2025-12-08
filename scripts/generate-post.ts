import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";
import {
  SKIP_CONTENT_RELEVANCY_CHECK,
  SKIP_USED_URLS_CHECK,
  TEXT_ONLY_MODE,
} from "../src/agents/generate-post/constants.js";

/**
 * Generate a post based on provided URLs.
 * Accepts comma-separated URLs as command line arguments.
 */
async function invokeGraph() {
  // Get URLs from command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide at least one URL as a command line argument.");
    console.error("Usage: yarn generate_post \"url1,url2,url3\" or yarn generate_post url1 url2 url3");
    process.exit(1);
  }

  // Parse URLs - support both comma-separated and space-separated arguments
  let links: string[];
  if (args.length === 1 && args[0].includes(',')) {
    // Comma-separated URLs
    links = args[0].split(',').map(url => url.trim()).filter(url => url.length > 0);
  } else {
    // Space-separated URLs
    links = args;
  }

  if (links.length === 0) {
    console.error("No valid URLs provided.");
    process.exit(1);
  }

  console.log(`Generating post for URLs: ${links.join(', ')}`);

  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL || "http://localhost:54367",
  });

  const { thread_id } = await client.threads.create();
  await client.runs.create(thread_id, "generate_post", {
    input: {
      links,
    },
    config: {
      configurable: {
        // By default, the graph will read these values from the environment
        // [TWITTER_USER_ID]: process.env.TWITTER_USER_ID,
        // [LINKEDIN_USER_ID]: process.env.LINKEDIN_USER_ID,
        // This ensures the graph runs in a basic text only mode.
        // If you followed the full setup instructions, you may remove this line.
        [TEXT_ONLY_MODE]: true,
        // These will skip content relevancy checks and used URLs checks
        [SKIP_CONTENT_RELEVANCY_CHECK]: true,
        [SKIP_USED_URLS_CHECK]: true,
      },
    },
  });
}

invokeGraph().catch(console.error);
