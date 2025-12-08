
export const TWEET_EXAMPLES = `<example index="1">
Using Storybook for your components docs ?

Just hooked up our company's internal frontend library documentation to a coding agent using storybook and MCP.

Been using a markdown file with library usage examples + .windsurf rule until now.

Results:
- 100% increase in AI generated code correctness
- no more hallucinated props

Issues encountered during the process:
- storybook version upgrade

here are the links if you want to check it out:
- https://github.com/storybookjs/mcp/tree/main/packages/addon-mcp
</example>

<example index="2">
Built a simple daily email summary using OpenAI voice APIs, Vercel and google integration.

features:
- Handles token refresh
- Vercel cron
- Gmail integration
- OpenAI voice APIs
- Telegram integration

🧠 Repo: https://github.com/dendrite-systems/dendrite-examples
</example>

<example index="3">
RepoGPT: AI-Powered GitHub Assistant 🚀

I built RepoGPT, an open-source, AI-powered assistant.

You can chat with your repositories using natural language to get insights and code suggestions.

https://repogpt.com
</example>

<example index="5">
AI Travel Agent ✈️

This is one of the most comprehensive agents I've built using LangGraph. It's designed for real-world use.

Features:
- Stateful Interactions
- Human-in-the-Loop
- Dynamic LLMs

https://github.com/nirbar1985/ai-travel-agent
</example>`;

export const POST_STRUCTURE_INSTRUCTIONS = `The post should have three main sections, outlined below:
<structure-instructions>

<section key="1">
The first part of the post is the header. This should be very short, no more than 5 words, and should include one to two emojis, and the name of the project/content.
</section>

<section key="2">
This section is the main body. Start with a casual, first-person hook to introduce the work (e.g., "I've been working on...", "Just shipped...", "Here's what I built...", "Been learning about...", "Just finished the course on...").
Then, provide a concise overview of what the project does or the problem it solves.
Mention how the work done is relevant to the AI, developer community and or businesses using developer terminology but keeping it accessible.
Keep this section short (max 3-4 sentences or a short list). You can use bullet points for features.
</section>

<section key="3">
The final section is the call to action. Encourage the reader to check out the link (e.g., "Check it out:", "Code here:", "Let me know your thoughts!"). 
Leave this section blank if you don't have a link to share.
</section>

</structure-instructions>`;

export const POST_CONTENT_RULES = `- Focus your post on what the content covers, aims to achieve. This should be concise and high level.
- Do not make the post over technical as some of our audience may not be advanced developers, but ensure it is technical enough to engage developers.
- Keep posts short, concise and engaging
- Limit the use of emojis to the post header, and optionally in the call to action.
- NEVER use hashtags in the post.
- ALWAYS use present tense to make announcements feel immediate (e.g., "Microsoft just launched..." instead of "Microsoft launches...").
- ALWAYS include at least one link to the content being promoted in the call to action section of the post.
- You're acting as a human, posting for other humans. Keep your tone casual and friendly. Don't make it too formal or too consistent with the tone.
`

/**
 * A prompt to be used in conjunction with the business context prompt when
 * validating content for social media posts. This prompt should outline the
 * rules for what content should be approved/rejected.
 */
export const CONTENT_VALIDATION_PROMPT = `This content will be used to generate engaging, informative and educational social media posts.
The following are rules to follow when determining whether or not to approve content as valid, or not:
<validation-rules>
- The content may be about a new product, tool, service, or similar.
- The content is a blog post, or similar content of which, the topic is AI, which can likely be used to generate a high quality social media post.
- The goal of the final social media post should be to educate your users, or to inform them about new content, products, services, or findings about AI.
- You should NOT approve content from users who are requesting help, giving feedback, or otherwise not clearly about software for AI.
- You only want to approve content which can be used as marketing material, or other content to promote the content above.
</validation-rules>`;

export function getPrompts() {
  return {
    businessContext: "EMPTY_UNUSED",
    tweetExamples: TWEET_EXAMPLES,
    postStructureInstructions: POST_STRUCTURE_INSTRUCTIONS,
    postContentRules: POST_CONTENT_RULES,
    contentValidationPrompt: CONTENT_VALIDATION_PROMPT,
  };
}
