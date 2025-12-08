import { END, Send, START, StateGraph } from "@langchain/langgraph";
import { VerifyContentAnnotation } from "../shared/shared-state.js";
import { verifyYouTubeContent } from "../shared/nodes/verify-youtube.js";
import { verifyGeneralContent } from "../shared/nodes/verify-general.js";
import { verifyGitHubContent } from "../shared/nodes/verify-github.js";

import {
  VerifyLinksGraphAnnotation,
  VerifyLinksGraphConfigurableAnnotation,
} from "./verify-links-state.js";
import { getUrlType } from "../utils.js";

function routeLinkTypes(state: typeof VerifyLinksGraphAnnotation.State) {
  return state.links.map((link) => {
    const type = getUrlType(link);

    if (type === "youtube") {
      return new Send("verifyYouTubeContent", {
        link,
      });
    }

    if (type === "github") {
      return new Send("verifyGitHubContent", {
        link,
      });
    }

    return new Send("verifyGeneralContent", {
      link,
    });
  });
}

const verifyLinksWorkflow = new StateGraph(
  VerifyLinksGraphAnnotation,
  VerifyLinksGraphConfigurableAnnotation,
)
  .addNode("verifyYouTubeContent", verifyYouTubeContent, {
    input: VerifyContentAnnotation,
  })
  .addNode("verifyGeneralContent", verifyGeneralContent, {
    input: VerifyContentAnnotation,
  })
  .addNode("verifyGitHubContent", verifyGitHubContent, {
    input: VerifyContentAnnotation,
  })
  // .addNode("verifyTweetSubGraph", verifyTweetGraph, {
  //   input: VerifyContentAnnotation,
  // })
  // .addNode("verifyRedditContent", verifyRedditPostGraph, {
  //   input: VerifyRedditPostAnnotation,
  // })
  // .addNode("verifyLumaEvent", verifyLumaEvent, {
  //   input: VerifyContentAnnotation,
  // })
  // Start node
  .addConditionalEdges(START, routeLinkTypes, [
    "verifyYouTubeContent",
    "verifyGeneralContent",
    "verifyGitHubContent",
    // "verifyTweetSubGraph",
    // "verifyRedditContent",
    // "verifyLumaEvent",
  ])
  .addEdge("verifyYouTubeContent", END)
  .addEdge("verifyGeneralContent", END)
  .addEdge("verifyGitHubContent", END);

export const verifyLinksGraph = verifyLinksWorkflow.compile();
verifyLinksGraph.name = "Verify Links Subgraph";
