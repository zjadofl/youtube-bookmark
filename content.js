function getYouTubeVideoCurrentTime(button) {
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    let results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        const video = document.querySelector('video');
        if (video) {
          return parseInt(video.currentTime);
        } else {
          console.error("[오류] Video 요소를 찾을 수 없음");
          return null;
        }
      }
    });

    const currentTimeList = document.getElementById('bookmark_list');
    for (let result of results) {
      if (result.result !== null) {
        const listItem = document.createElement('li');
        listItem.textContent = `현재 시간: ${result.result} 초`;
        currentTimeList.appendChild(listItem);
      } else {
        console.error("[오류] 현재 시간을 가져오는 데에 실패함");
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var addButton = document.getElementById('btn');
  addButton.addEventListener('click', function() {
    getYouTubeVideoCurrentTime();
  });
});
