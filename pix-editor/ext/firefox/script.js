/* eslint-disable no-undef */
var editorPath = 'https://editor.pix.fr';

browser.browserAction.onClicked.addListener(function() {
  browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    var part = url.substr(url.lastIndexOf('/') + 1);
    if (part.substr(0, '3') === 'rec') {
      // recId found
      var editorUrl = editorPath + '/#/challenge/' + part;
      browser.tabs.query({'title':'Pix Editor'}, function(tabs) {
        if (tabs && tabs.length > 0) {
          var tab = tabs[0];
          browser.tabs.update(tab.id, {url: editorUrl, 'active':true});
        } else {
          browser.tabs.create({'url':editorUrl, 'active':true});
        }
      });
    }
  });
});