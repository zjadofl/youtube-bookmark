function formatVideoTime(videoSeconds) {
  const hours = Math.floor(videoSeconds / 3600);
  const minutes = Math.floor((videoSeconds % 3600) / 60);
  const seconds = Math.floor(videoSeconds % 60);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function getVideoCurrentTime(button) {
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

    const bookmarkList = document.getElementById('bookmark_list');
    for (let result of results) {
      if (result.result !== null) {
        const listItem = document.createElement('li');
        listItem.style.display = "flex";
        bookmarkList.appendChild(listItem);
        listItem.scrollIntoView({ behavior: 'smooth', block: 'end' });

        const videoInfoDiv = document.createElement("div");
        listItem.appendChild(videoInfoDiv);

        const memo = document.createElement('input');
        memo.type = "text";
        memo.placeholder = "빈 메모입니다.";
        memo.disabled = true;
        memo.style.paddingBottom = "10px";
        memo.style.border = "none";
        memo.style.background = "transparent";
        videoInfoDiv.appendChild(memo);

        const time = document.createElement("span");
        time.textContent = `${formatVideoTime(result.result)}`;
        time.style.color = "#b8860b";
        time.style.borderWidth = "2px";
        time.style.fontSize = "14px";
        videoInfoDiv.appendChild(time);

        const iconDiv = document.createElement("div");
        listItem.appendChild(iconDiv);
        iconDiv.style.display = "flex";
        iconDiv.style.alignItems = "center";

        const editIcon = document.createElement("img");
        editIcon.src = "images/edit.png";
        editIcon.style.width = "24px";
        editIcon.style.height = "24px";
        iconDiv.appendChild(editIcon);

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "images/delete.png";
        deleteIcon.style.width = "24px";
        deleteIcon.style.height = "24px";
        deleteIcon.style.marginLeft = "5px";
        deleteIcon.style.marginRight = "5px";
        iconDiv.appendChild(deleteIcon);

        const shareIcon = document.createElement("img");
        shareIcon.src = "images/share.png";
        shareIcon.style.width = "24px";
        shareIcon.style.height = "24px";
        iconDiv.appendChild(shareIcon);

        const line = document.createElement('hr');
        bookmarkList.appendChild(line);
      } else {
        console.error("[오류] 현재 시간을 가져오는 데에 실패함");
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var addButton = document.getElementById('add_btn');
  addButton.addEventListener('click', function() {
    getVideoCurrentTime();
  });
});
