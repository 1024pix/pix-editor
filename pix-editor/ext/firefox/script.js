/* eslint-disable no-undef */
const editorPath = 'https://editor.pix.fr';

function getChallengeIdFromTab(tab) {
  const url = tab.url;
  const part = url.substr(url.lastIndexOf('/') + 1);
  if (part.substr(0, '3') === 'rec') {
    return part;
  }
}

function updateTabStatus(tab) {
  if (getChallengeIdFromTab(tab)) {
    browser.browserAction.enable(tab.id);
  } else {
    browser.browserAction.disable(tab.id);
  }
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    updateTabStatus(tab);
  }
});

browser.tabs.onCreated.addListener(function(tab) {
  updateTabStatus(tab);
});

browser.browserAction.onClicked.addListener(function() {
  browser.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    const challengeId = getChallengeIdFromTab(tabs[0]);
    if (challengeId) {
      const editorUrl = editorPath + '/#/challenge/' + challengeId;
      browser.tabs.query({ title: 'Pix Editor' }, function(tabs) {
        if (tabs && tabs.length > 0) {
          const tab = tabs[0];
          browser.tabs.update(tab.id, { url: editorUrl, active: true });
        } else {
          browser.tabs.create({ url: editorUrl, active: true });
        }
      });
    }
  });
});
