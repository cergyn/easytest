// background.js

// Helper function to fetch the EasyList
function fetchEasyList () {
  return fetch('https://easylist.to/easylist/easylist.txt')
    .then((response) => {
      if (response.ok) {
        return response.text()
      } else {
        throw new Error('Failed to fetch EasyList.')
      }
    })
    .catch((error) => {
      console.error(error)
      return null
    })
}
/*
! for comments
# for content filters
@@ for exception filters
|| for URL filters
| for matching at the beginning or end of an address
^ for marking separator characters
$ for specifying filter options
/ for using regular expressions
## for cosmetic filters
#@# for cosmetic filter exceptions
#?# for advanced selectors
#$# for snippet filters
#@$# for snippet filter exceptions
*/

// we will download easylist only once and store it in local storage
const easyList = localStorage.getItem('easyList')
if (!easyList) {
  console.log("We don't have easyList in local storage! Fetching it...")
  fetchEasyList().then((easyList) => {
    localStorage.setItem('easyList', easyList)
  })
}

// List of blocked URLs
const blockedUrls = easyList.split('\n').filter((rule) => rule.startsWith('||')).map((rule) => rule.slice(2))

// This event is fired when the extension is first installed.
// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(function () {
  console.log('The extension has been installed!')
})
const separatorCharacters = ':?/=^'
function indexOfFilter (input, filter, startingPos) {
  if (filter.length > input.length) {
    return -1
  }

  const filterParts = filter.split('^')
  let index = startingPos
  let beginIndex = -1
  let prefixedSeparatorChar = false

  for (let f = 0; f < filterParts.length; f++) {
    if (filterParts[f] === '') {
      prefixedSeparatorChar = true
      continue
    }

    index = input.indexOf(filterParts[f], index)
    if (index === -1) {
      return -1
    }
    if (beginIndex === -1) {
      beginIndex = index
    }

    if (prefixedSeparatorChar) {
      if (separatorCharacters.indexOf(input[index - 1]) === -1) {
        return -1
      }
    }
    // If we are in an in between filterPart
    if (f + 1 < filterParts.length &&
            // and we have some chars left in the input past the last filter match
            input.length > index + filterParts[f].length) {
      if (separatorCharacters.indexOf(input[index + filterParts[f].length]) === -1) {
        return -1
      }
    }

    prefixedSeparatorChar = false
  }
  return beginIndex
}

// This event is fired before a request is sent.
// eslint-disable-next-line no-undef
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    for (let i = 0; i < blockedUrls.length; i++) {
      if (indexOfFilter(details.url, blockedUrls[i], 0) > -1) {
        return { cancel: true }
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
)

// This event is fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'getEasyListCosmetic') {
    sendResponse({ easyList: easyList.split('\n').filter((rule) => rule.startsWith('##')).map((rule) => rule.slice(2)) })
  }
})
