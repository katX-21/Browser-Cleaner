const form = document.getElementById('clearCookie');
const input = document.getElementById('input');
const message = document.getElementById('message');

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
    } catch {
      // ignore
    }
  }

  input.focus();
})();

form.addEventListener('click', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  //hides message in html file
  clearMessage();
//strings users input
  let url = stringToUrl(input.value);
  if (!url) {
    setMessage('Invalid URL'); // if the users input is invalid, display this message
    return;
  }

  let message = await deleteDomainCookies(url.hostname);
  setMessage(message); // 
}

function stringToUrl(input) {
  // Start with treating the provided value as a URL
  try {
    return new URL(input);
  } catch {
    // ignore
  }
  // If that fails, try assuming the provided input is an HTTP host
  try {
    return new URL('http://' + input);
  } catch {
    // ignore
  }
  
  return null;
}

async function deleteDomainCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      return 'No cookies found';
    }

    let pending = cookies.map(deleteCookie);
    await Promise.all(pending);

    cookiesDeleted = pending.length;
  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }
  //returns a message showing how many cookies were deleted
  return `Deleted ${cookiesDeleted} cookie(s).`;
}

function deleteCookie(cookie) {
 
  const protocol = cookie.secure ? 'https:' : 'http:';
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`; 

  return chrome.cookies.remove({ //removes websites cookies
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId
  });
}

const cache = document.getElementById('clearCache');
if(cache){
  clearCache.addEventListener('click',deleteCache);
  
}
function prompt(removed){
  if(removed === true){
    
  setMessage('Cleared Cache');
  }
  else{
    setMessage('Unexpected Error'); 
  }
}


function deleteCache(){
  
  var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var weekDate = (new Date()).getTime() - millisecondsPerWeek;
  chrome.browsingData.remove({
    "since": weekDate // assigning the date/time of deletion
  }, {
    "appcache": true,
    "cache": true,
    "cacheStorage": true,
    "cookies": true,
    "downloads": true,
    "fileSystems": true,
    "formData": true,
    "history": true,
    "indexedDB": true,
    "localStorage": true,
    "passwords": true,
    "serviceWorkers": true,
    "webSQL": true
  },
  prompt(true));
}
function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}