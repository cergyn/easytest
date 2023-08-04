// Helper function to fetch the EasyList
async function fetchEasyList() {
  try {
    const response = await fetch("https://easylist.to/easylist/easylist.txt");
    if (response.ok) {
      return await response.text();
    } else {
      throw new Error("Failed to fetch EasyList.");
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

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

console.log("Extension has been successfully loaded!")
fetchEasyList().then((easyList) => blockElements(easyList));
console.log("Test 1 2 3 ... ");
