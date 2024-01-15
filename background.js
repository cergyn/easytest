// background.js

// we need to download and store easylist in local storage
// we need to block elements based on easylist rules
// we need to listen for new requests and block them if they match the rules
// we will download easylist only once and store it in local storage
let easyList = localStorage.getItem("easyList");
if (!easyList) {
  console.log("We don't have easyList in local storage! Fetching it...");
  fetchEasyList().then((easyList) => {
    localStorage.setItem("easyList", easyList);
  });
}

// Helper function to fetch the EasyList
function fetchEasyList() {
    return fetch("https://easylist.to/easylist/easylist.txt")
        .then((response) => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error("Failed to fetch EasyList.");
        }
        })
        .catch((error) => {
        console.error(error);
        return null;
        });
    }

// Helper function to block URLs based on EasyList rules
function blockUrls(easyListRules) {
    if (!easyListRules) return;
  
    const urls = easyListRules
      .split("\n")
      .filter((rule) => rule.startsWith("||"))
      .map((rule) => rule.slice(2));
  
    urls.forEach((url) => {
      console.log(`Blocked ${url}`);
      blockedUrls.push(url);
    });
  }


// List of blocked URLs
const blockedUrls = easyList.split("\n").filter((rule) => rule.startsWith("||")).map((rule) => rule.slice(2));

// This event is fired when the extension is first installed.
chrome.runtime.onInstalled.addListener(function() {
  console.log('The extension has been installed!');
});

// This event is fired before a request is sent.
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    for (let i = 0; i < blockedUrls.length; i++) {
      if (details.url.indexOf(blockedUrls[i]) > -1) {
        return {cancel: true};
      }
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

// This event is fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'getEasyListCosmetic') {
    sendResponse({ easyList: easyList.split("\n").filter((rule) => rule.startsWith("##")).map((rule) => rule.slice(2)) });
  }
});