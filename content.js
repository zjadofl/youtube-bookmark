// 영상 시간(초)를 형식화
function formatVideoTime(videoSeconds) {
  const hours = Math.floor(videoSeconds / 3600);
  const minutes = Math.floor((videoSeconds % 3600) / 60);
  const seconds = Math.floor(videoSeconds % 60);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

//현재 재생시간 가져오기
async function getVideoCurrentTime() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0].id;
  const results = await chrome.scripting.executeScript({
    target: {tabId: tabId},
    function: () => {
      const video = document.querySelector('video');
      return video ? parseInt(video.currentTime) : null;
    }
  });

  for (let result of results) {
    if (result.result != null) {
      addBookmark(result.result);
    } else {
      console.error("[오류] Video 요소를 찾을 수 없음");
    }
  }
}

// 메모 활성화
function enableMemo(listItem) {
  const memoInput = listItem.querySelector(".memo");
  memoInput.removeAttribute('disabled');
  memoInput.focus();
  const editIcon = listItem.querySelector(".edit-icon");
  editIcon.src = "images/edit_active.png";
}

// 북마크 추가
async function addBookmark(videoSeconds) {
  const listItem = document.createElement("li");
  listItem.style.padding = "5px";
  listItem.style.display = "flex"; 
  listItem.classList.add('bookmark-item');
  listItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
  listItem.innerHTML = `
  <div class="video-info">
    <input type="textarea" class="memo" placeholder="빈 메모입니다." disabled >
    <span class="video-time" time=${videoSeconds}>${formatVideoTime(videoSeconds)}</span>
  </div>
  <div class="icon-div">
    <img src="images/edit.png" class="edit-icon">
    <img src="images/delete.png" class="delete-icon">
    <img src="images/share.png" class="share-icon">
  </div>
  `;
  const bookmarkList = document.getElementById('bookmark_list');
  bookmarkList.appendChild(listItem);
  listItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
  const hr = document.createElement("hr");
  bookmarkList.appendChild(hr);

  try {
    let url = await getActiveTabURL();
    url = url.replace("www.youtube.com/t=", "").replace(/&v=\d+/, "");
    const bookmarkInfo = {
      'videoID': url,
      'time': videoSeconds,
      'memo': '' 
    };
    saveBookmarks(bookmarkInfo);
  } catch (error) {
    console.error("[에러] 북마크를 저장하는 데 실패", error);
  }
}

// URL 가져오기
function getActiveTabURL() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      const url = activeTab.url;
      console.log("현재 활성화된 탭의 URL:", url);
      resolve(url);
    });
  });
}

// 북마크 저장
function saveBookmarks(bookmarkInfo) {
  chrome.storage.sync.get(['bookmarks'], function(result) {
    const bookmarks = result.bookmarks || [];
    bookmarks.push(bookmarkInfo);
    
    chrome.storage.sync.set({ 'bookmarks': bookmarks }, function() {
      console.log('북마크가 저장되었습니다.');
      console.log(bookmarks);
    });
  });
}

// youtube 페이지 여부에 따라 버튼 활성화
async function checkYoutubePage() {
  try {
    const url = await getActiveTabURL();
    const regex = /www\.youtube\.com\/watch\?v=/;
    if (!url.match(regex)) {
      const addBtn = document.getElementById('add_btn');
      addBtn.remove();
      const bookmarkList = document.getElementById('bookmark_list');
      const listItem = document.createElement("li");
      listItem.textContent = "Youtube 영상 페이지일 때만 버튼이 활성화됩니다.";
      bookmarkList.appendChild(listItem);
    }
  } catch (error) {
    console.error("[오류] URL 가져오는 데에 실패함", error);
    return null;
  }
}

async function getshareURL(listItem) {
  let shareURL = "";
  try {
    let url = await getActiveTabURL();
    url = url.replace(/&?t=\d+s?/, "");
    const videoTime = listItem.querySelector(".video-time").getAttribute("time");
    shareURL = url + "&t=" + videoTime+"s"; 
  } catch (error) {
    console.error("[오류] URL 가져오는 데에 실패함", error);
  }
  return shareURL;
}

document.addEventListener('DOMContentLoaded', function() {
  var addButton = document.getElementById('add_btn');
  addButton.addEventListener('click', function() {
    getVideoCurrentTime();
  });

  checkYoutubePage();
  chrome.storage.local.get();

  const bookmarkList = document.getElementById('bookmark_list');
  bookmarkList.addEventListener('click', function(event) {
    const clickedIcon = event.target;
    const listItem = clickedIcon.closest('.bookmark-item');

    if (clickedIcon.classList.contains('edit-icon')) {
      enableMemo(listItem);

      const memoInput = listItem.querySelector(".memo");
      memoInput.addEventListener('blur', function() {
        memoInput.setAttribute('disabled', true);
        const editIcon = listItem.querySelector(".edit-icon");
        editIcon.src = "images/edit.png";
        
      });
    } else if (clickedIcon.classList.contains('delete-icon')) {
      
    } else if (clickedIcon.classList.contains('share-icon')) {
      getshareURL(listItem).then(shareURL => {
        navigator.clipboard.writeText(shareURL);
        alert('북마크 URL이 복사되었습니다.');
      });      
    }
  });
});