// popup.js - Handles the extension popup logic

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveKeyButton = document.getElementById('save-key');
  const toggleAssistantButton = document.getElementById('toggle-assistant');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const statusDetail = document.getElementById('status-detail');
  
  // Load saved API key
  const savedKey = await getSavedApiKey();
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }
  
  // Check current Google Meet status
  updateMeetStatus();
  
  // Set up event listeners
  saveKeyButton.addEventListener('click', saveApiKey);
  toggleAssistantButton.addEventListener('click', toggleAssistant);
  
  // Listen for status updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'statusUpdate') {
      updateStatusDisplay(message);
    }
  });
});

// Get saved API key from storage
function getSavedApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      resolve(result.geminiApiKey || '');
    });
  });
}

// Save API key to storage
async function saveApiKey() {
  const apiKey = document.getElementById('api-key').value.trim();
  
  if (!apiKey) {
    alert('Please enter a valid API key');
    return;
  }
  
  try {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
    alert('API key saved successfully!');
    
    // Enable the toggle button if we're in a Meet session
    updateMeetStatus();
  } catch (error) {
    console.error('Error saving API key:', error);
    alert('Error saving API key. Please try again.');
  }
}

// Update Google Meet status
async function updateMeetStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && tab.url.startsWith('https://meet.google.com/')) {
      // We're in a Google Meet session
      document.getElementById('status-indicator').className = 'status-indicator active';
      document.getElementById('status-text').textContent = 'In Google Meet';
      document.getElementById('status-detail').textContent = 'Assistant ready';
      document.getElementById('toggle-assistant').disabled = false;
      document.getElementById('toggle-assistant').textContent = 'Start Assistant';
    } else {
      // Not in a Google Meet session
      document.getElementById('status-indicator').className = 'status-indicator inactive';
      document.getElementById('status-text').textContent = 'Assistant Inactive';
      document.getElementById('status-detail').textContent = 'Not in a Google Meet session';
      document.getElementById('toggle-assistant').disabled = true;
    }
  } catch (error) {
    console.error('Error checking Meet status:', error);
  }
}

// Toggle assistant on/off
async function toggleAssistant() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && tab.url.startsWith('https://meet.google.com/')) {
      // Send message to content script to toggle assistant
      chrome.tabs.sendMessage(tab.id, { action: 'toggleAssistant' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.status) {
          const button = document.getElementById('toggle-assistant');
          if (response.status === 'started') {
            button.textContent = 'Stop Assistant';
          } else if (response.status === 'stopped') {
            button.textContent = 'Start Assistant';
          }
        }
      });
    }
  } catch (error) {
    console.error('Error toggling assistant:', error);
  }
}

// Update status display
function updateStatusDisplay(message) {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const statusDetail = document.getElementById('status-detail');
  
  if (message.status === 'active') {
    statusIndicator.className = 'status-indicator active';
    statusText.textContent = 'Assistant Active';
    statusDetail.textContent = message.detail || 'Listening for questions';
  } else {
    statusIndicator.className = 'status-indicator inactive';
    statusText.textContent = 'Assistant Inactive';
    statusDetail.textContent = message.detail || 'Paused';
  }
}