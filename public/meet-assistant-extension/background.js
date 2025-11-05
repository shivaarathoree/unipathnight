// background.js - Service worker for the extension

// Listen for tab updates to detect Google Meet sessions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab URL matches Google Meet and the tab is fully loaded
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.startsWith('https://meet.google.com/')
  ) {
    console.log('Google Meet session detected:', tab.url);
    
    // Inject content script into the Google Meet tab
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => {
      console.error('Failed to inject content script:', err);
    });
  }
});

// Listen for tab activation to detect when user switches to Google Meet
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    if (tab.url && tab.url.startsWith('https://meet.google.com/')) {
      console.log('User switched to Google Meet tab');
      // Notify content script that the tab is active
      chrome.tabs.sendMessage(activeInfo.tabId, {
        action: 'meetTabActivated'
      }).catch(err => {
        // Ignore errors when content script is not yet loaded
      });
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startListening') {
    console.log('Starting to listen for audio in Google Meet');
    // This would be handled in the content script
    sendResponse({ status: 'listeningStarted' });
  } else if (message.action === 'stopListening') {
    console.log('Stopping audio listening');
    sendResponse({ status: 'listeningStopped' });
  }
});