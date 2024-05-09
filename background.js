// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if (message.action === "getVideoCurrentTime") {
//         chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//             // Content Script에서 요청한 작업 수행
//             chrome.tabs.executeScript(tabs[0].id, { code: "(" + getVideoCurrentTime + ")();" });
//         });
//     }
// });
