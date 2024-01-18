// @ts-check
const TWEET_COMPONENT_ID = "tweet" 
// Example tweet comment getter
// https://twitter.com/i/api/graphql/4EQGUyO_lbCtGin4PT7MOQ/TweetDetail?variables={"focalTweetId":"1732060552845832702","with_rux_injections":false,"includePromotedContent":true,"withCommunity":true,"withQuickPromoteEligibilityTweetFields":true,"withBirdwatchNotes":true,"withVoice":true,"withV2Timeline":true}&features={"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_home_pinned_timelines_enabled":true,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}&fieldToggles={"withArticleRichContentState":false}

/** @type {NodeListOf<Node> | undefined} */
let currentCells = undefined;

/** @param {string} id  */
function twitterIdString(id) {
  return `[data-testid="${id}"]`;
}

function getAllCells() {
  return document.querySelectorAll(twitterIdString("cellInnerDiv"));
}

function waitForTweetsLoad() {
  if (!window.location.href.includes("status")) {
    return;
  }
  
  const interval = setInterval(() => {
    console.log("checking for page tweets load")
    currentCells = getAllCells();
    if (currentCells.length > 0) {
      clearInterval(interval);
      startVerifiedCleanup();
    }
  }, 500);
}

function verifiedCleanup() {

}
const tweetsObserver = new window.MutationObserver((mutation, observer) => {
  // console.log("OBSERVING");
  currentCells = getAllCells();
  currentCells.forEach((cell, index) => {
    if (index == 0) {
      return;
    }

    if (cell.nodeType !== 1) {
      // is not ELEMENT node
      return;
    }

    const element = /** @type {Element} */ (cell);
    const verified = element.querySelector(twitterIdString("icon-verified"));
    if (verified) {
      // @ts-expect-error
      element.style.display = "none";
    }
  })
});

function startVerifiedCleanup() {
  if (!currentCells || currentCells.length < 1) {
    return waitForTweetsLoad();
  }

  console.log("Starting verified tweets cleanup");

  const tweetsParent = currentCells[0].parentElement;
  // @ts-expect-error
  tweetsObserver.observe(tweetsParent, {
    // subtree: true,
    // attributes: true,
    childList: true,
  });
}

function listenForUrlChange() {
  let oldHref = document.location.href;
  const body = document.querySelector("body");
  const urlObserver = new MutationObserver((mutations) => {
    if (oldHref !== document.location.href) {
      oldHref = document.location.href;
      console.log("Restarting twitter janitor");
      tweetsObserver.disconnect();
      waitForTweetsLoad();
    }
  });
  
  // @ts-expect-error
  urlObserver.observe(body, {childList: true, subtree: true});
}

// @ts-expect-error
window.onload = function () {
  console.log("Twitter Janitor Extension Loaded");
  // const selection = document.querySelectorAll(`[data-testid=${TWEET_COMPONENT_ID}]`)
  console.log(window.location.pathname);
  
  listenForUrlChange();
  waitForTweetsLoad();
}()


