
// Helper function to block elements based on EasyList rules
function blockElements(easyListRules) {
  if (!easyListRules) return;

  const selectors = easyListRules
    .split("\n")
    .filter((rule) => rule.startsWith("##"))
    .map((rule) => rule.slice(2));

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      console.log(`Blocked ${selector}`);
      element.remove();
    });
  });
}

function afterDOMLoaded() {
  console.log("DOM loaded!");
  // send a message to the background script and ask for the easyList
  chrome.runtime.sendMessage({ message: "getEasyListCosmetic" }, (response) => {
    console.log("Response from background script:");
    console.log(response);
    blockElements(response.easyList);
  });
  console.log("Test 1 2 3 ... ");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
  afterDOMLoaded();
}