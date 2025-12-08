import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { GeneratePostAnnotation } from "../../generate-post-state.js";
import { ChatAnthropic } from "@langchain/anthropic";
import { GENERATE_REPORT_PROMPT } from "./prompts.js";

/**
 * Parse the LLM generation to extract the report from inside the <report> tag.
 * If the report can not be parsed, the original generation is returned.
 * @param generation The text generation to parse
 * @returns The parsed generation, or the unmodified generation if it cannot be parsed
 */
function parseGeneration(generation: string): string {
  const reportMatch = generation.match(/<report>([\s\S]*?)<\/report>/);
  if (!reportMatch) {
    console.warn(
      "Could not parse report from generation:\nSTART OF GENERATION\n\n",
      generation,
      "\n\nEND OF GENERATION",
    );
  }
  return reportMatch ? reportMatch[1].trim() : generation;
}

const formatReportPrompt = (pageContents: string[]): string => {
  return `You are my personal marketing agent specializing in compiling tailored social media posts tailored for the general LinkedIn and Twitter IT audience.   I will be attaching documentationThe following text contains summaries, or entire pages from the content I submitted to you. Please summarise the content. In a couple of paragraphs write what the technology does, 
  what problem it solves, and how it is relevant for businesses and developers. Keep in mind that you are working as a personal marketing professional for a developer (me) doing AI, frontend, full stack, agent development and that you want others to know what I'm working on.
${pageContents.map((content, index) => `<Content index={${index + 1}}>\n${content}\n</Content>`).join("\n\n")}`;
};

export async function generateContextSummary(
  state: typeof GeneratePostAnnotation.State,
  _config: LangGraphRunnableConfig,
): Promise<Partial<typeof GeneratePostAnnotation.State>> {
  if (!state.pageContents?.length) {
    throw new Error(
      "No page contents found. pageContents must be defined to generate a content report.",
    );
  }

  const reportModel = new ChatAnthropic({
    model: "claude-sonnet-4-5",
    temperature: 0,
  });

  const result = await reportModel.invoke([
    {
      role: "system",
      content: GENERATE_REPORT_PROMPT,
    },
    {
      role: "user",
      content: formatReportPrompt(state.pageContents),
    },
  ]);

  return {
    report: parseGeneration(result.content as string),
  };
}
