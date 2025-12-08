import {
  END,
  LangGraphRunnableConfig,
  START,
  StateGraph,
} from "@langchain/langgraph";
import {
  GeneratePostAnnotation,
  GeneratePostConfigurableAnnotation,
  GeneratePostState,
  GeneratePostUpdate,
} from "./generate-post-state.js";
import { generateContentReport } from "./nodes/generate-report/index.js";
import { generatePost } from "./nodes/generate-post/index.js";
import { condensePost } from "./nodes/condense-post.js";
import { skipUsedUrlsCheck } from "../utils.js";
import { verifyLinksGraph } from "../verify-links/verify-links-graph.js";
import { authSocialsPassthrough } from "./nodes/auth-socials.js";
// import { updateScheduledDate } from "../shared/nodes/update-scheduled-date.js";
import { getSavedUrls } from "../shared/stores/post-subject-urls.js";
// import { humanNode } from "../shared/nodes/generate-post/human-node.js";
import { schedulePost } from "../shared/nodes/generate-post/schedule-post.js";
// import { rewritePost } from "../shared/nodes/generate-post/rewrite-post.js";

function routeAfterGeneratingReport(
  state: GeneratePostState,
): "generatePost" | typeof END {
  if (state.report) {
    return "generatePost";
  }
  return END;
}

// async function _findAvailableBasicDates({}) {
//   // implementation not provided
// }

// async function condenseOrHumanConditionalEdge(
//   state: GeneratePostState,
//   config: LangGraphRunnableConfig,
// ): Promise<"condensePost" | "humanNode"> {
//   const cleanedPost = removeUrls(state.post || "");
//   if (cleanedPost.length > 280 && state.condenseCount <= 3) {
//     return "condensePost";
//   }
//
//   return "humanNode";
// }

/**
 * Checks if any of the URLs in the array are already stored in the post subject URLs store.
 * If so, it returns `true` and the post should NOT be generated.
 * @param urls The array of URLs to check. These are all of the input & extracted relevant URLs.
 * @param config The LangGraph config to get the store from.
 * @returns {Promise<boolean>} `true` if any of the URLs in the array are already stored in the post subject URLs store. `false` otherwise.
 */
async function checkIfUrlsArePreviouslyUsed(
  urls: string[],
  config: LangGraphRunnableConfig,
) {
  if (await skipUsedUrlsCheck(config.configurable)) {
    return false;
  }
  const existingUrls = await getSavedUrls(config);
  return urls.some((url) =>
    existingUrls.some((existingUrl) => url === existingUrl),
  );
}

async function generateReportOrEndConditionalEdge(
  state: GeneratePostState,
  config: LangGraphRunnableConfig,
): Promise<"generateContentReport" | typeof END> {
  const urlsAlreadyUsed = await checkIfUrlsArePreviouslyUsed(
    [...(state.relevantLinks ?? []), ...state.links],
    config,
  );

  // End early if the URLs have already been used, or if there are no
  // page contents extracted from any of the URLs.
  if (urlsAlreadyUsed || !state.pageContents?.length) {
    console.log(
      "Skipping post generation. URLs have already been used or there are no page contents.",
      {
        urlsAlreadyUsed,
        pageContentsLength: state.pageContents?.length,
      },
    );
    return END;
  }

  return "generateContentReport";
}

const generatePostBuilder = new StateGraph(
  GeneratePostAnnotation,
  GeneratePostConfigurableAnnotation,
)
  .addNode("authSocialsPassthrough", authSocialsPassthrough)

  .addNode("verifyLinksSubGraph", verifyLinksGraph)

  // Generates a Tweet/LinkedIn post based on the report content.
  .addNode("generatePost", generatePost)
  // Attempt to condense the post if it's too long.
  .addNode("condensePost", condensePost)
  // Interrupts the node for human in the loop.
  // .addNode("humanNode", humanNode<GeneratePostState, GeneratePostUpdate>)
  // Schedules the post for Twitter/LinkedIn.
  .addNode("schedulePost", schedulePost<GeneratePostState, GeneratePostUpdate>)
  // Generates a report on the content.
  .addNode("generateContentReport", generateContentReport)

  // Start node
  .addEdge(START, "authSocialsPassthrough")
  .addEdge("authSocialsPassthrough", "verifyLinksSubGraph")

  // After verifying the different content types, we should generate a report on them.
  .addConditionalEdges(
    "verifyLinksSubGraph",
    generateReportOrEndConditionalEdge,
    ["generateContentReport", END],
  )

  // Once generating a report, we should confirm the report exists (meaning the content is relevant).
  .addConditionalEdges("generateContentReport", routeAfterGeneratingReport, [
    "generatePost",
    END,
  ])
  .addEdge("generatePost", "condensePost")
  .addEdge("condensePost", "schedulePost")

  // // After generating the post for the first time, check if it's too long,
  // // and if so, condense it. Otherwise, route to the human node.
  // .addConditionalEdges("generatePost", condenseOrHumanConditionalEdge, [
  //   "condensePost",
  //   "humanNode",
  //   END,
  // ])
  // // After condensing the post, we should verify again that the content is below the character limit.
  // // Once the post is below the character limit, we can find & filter images. This needs to happen after the post
  // // has been generated because the image validator requires the post content.
  // // .addConditionalEdges("condensePost", condenseOrHumanConditionalEdge, [
  // //   "condensePost",
  // //   "humanNode",
  // //   END,
  // // ])

  // .addEdge("condensePost", "generatePost")
  // .addEdge("condensePost", "schedulePost")
  // // If the schedule post is successful, end the graph.
  // // .addEdge("humanNode", "schedulePost")
  // // Always end after scheduling the post.
  .addEdge("schedulePost", END);

export const generatePostGraph = generatePostBuilder.compile();

generatePostGraph.name = "Generate Post Subgraph";
