// content.js - Content script that runs in Google Meet tabs

let isListening = false;
let mediaRecorder = null;
let audioChunks = [];
let recognition = null;
let isAnswerDisplayed = false;

// Create the overlay element for displaying answers
function createAnswerOverlay() {
  // Check if overlay already exists
  if (document.getElementById('ai-coach-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'ai-coach-overlay';
  overlay.className = 'ai-coach-overlay';
  
  const content = document.createElement('div');
  content.className = 'ai-coach-content';
  
  const header = document.createElement('div');
  header.className = 'ai-coach-header';
  header.innerHTML = '<span>AI Career Coach</span><button id="close-overlay">×</button>';
  
  const body = document.createElement('div');
  body.className = 'ai-coach-body';
  body.innerHTML = '<p>Listening for questions...</p>';
  
  content.appendChild(header);
  content.appendChild(body);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  
  // Add event listener to close button
  document.getElementById('close-overlay').addEventListener('click', () => {
    overlay.style.display = 'none';
    isAnswerDisplayed = false;
  });
  
  console.log('AI Coach overlay created');
}

// Initialize speech recognition
function initializeSpeechRecognition() {
  try {
    // Use the Web Speech API for speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return null;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript.trim() !== '') {
        console.log('Recognized text:', finalTranscript);
        processQuestion(finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      if (isListening) {
        // Restart recognition if still listening
        recognition.start();
      }
    };
    
    return recognition;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return null;
  }
}

// Process the recognized question using Gemini API
async function processQuestion(question) {
  try {
    console.log('Processing question:', question);
    
    // Update UI to show we're processing
    updateAnswerDisplay('Thinking...', true);
    
    // Get API key from extension storage or environment
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    // Call Gemini API to generate answer
    const answer = await callGeminiAPI(question, apiKey);
    
    // Display the answer
    updateAnswerDisplay(answer, false);
    
  } catch (error) {
    console.error('Error processing question:', error);
    updateAnswerDisplay('Sorry, I encountered an error. Please try again.', false);
  }
}

// Get API key from storage
function getApiKey() {
  return new Promise((resolve) => {
    // First try to get from extension storage
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        resolve(result.geminiApiKey);
      } else {
        // Fallback to a default (this would typically come from your backend)
        resolve(null);
      }
    });
  });
}

// Call Gemini API to generate answer
async function callGeminiAPI(question, apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI career coach helping a student during a job interview. 
                     The student is being interviewed and needs your help to answer questions.
                     Keep your answer concise (under 100 words), helpful, and professional.
                     The interview question is: "${question}"`
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated';
    
    return answer.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Update the answer display
function updateAnswerDisplay(text, isLoading) {
  const overlay = document.getElementById('ai-coach-overlay');
  if (!overlay) {
    createAnswerOverlay();
    return;
  }
  
  const body = overlay.querySelector('.ai-coach-body');
  if (body) {
    if (isLoading) {
      body.innerHTML = `<div class="loading"><div class="spinner"></div><p>${text}</p></div>`;
    } else {
      body.innerHTML = `<p>${text}</p>`;
    }
    
    // Show overlay if it was hidden
    if (!isAnswerDisplayed) {
      overlay.style.display = 'block';
      isAnswerDisplayed = true;
    }
  }
}

// Start listening for audio
function startListening() {
  if (isListening) return;
  
  isListening = true;
  
  // Initialize speech recognition
  recognition = initializeSpeechRecognition();
  if (recognition) {
    try {
      recognition.start();
      console.log('Speech recognition started');
      updateAnswerDisplay('Listening for questions...', false);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      isListening = false;
    }
  } else {
    console.error('Failed to initialize speech recognition');
    isListening = false;
  }
}

// Stop listening for audio
function stopListening() {
  if (!isListening) return;
  
  isListening = false;
  
  if (recognition && recognition.state !== 'inactive') {
    recognition.stop();
  }
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  console.log('Stopped listening');
  updateAnswerDisplay('Assistant paused', false);
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'meetTabActivated') {
    console.log('Meet tab activated - starting assistant');
    // Auto-start when user activates the meet tab
    createAnswerOverlay();
    startListening();
    sendResponse({ status: 'assistantStarted' });
  } else if (message.action === 'toggleAssistant') {
    if (isListening) {
      stopListening();
    } else {
      createAnswerOverlay();
      startListening();
    }
    sendResponse({ status: isListening ? 'stopped' : 'started' });
  }
});

// Initialize when the content script loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI Career Coach content script loaded');
  createAnswerOverlay();
});

// Also initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createAnswerOverlay);
} else {
  createAnswerOverlay();
}

// Auto-detect Google Meet and start assistant
window.addEventListener('load', () => {
  if (window.location.href.startsWith('https://meet.google.com/')) {
    console.log('Google Meet detected - initializing assistant');
    setTimeout(() => {
      createAnswerOverlay();
      startListening();
    }, 3000); // Wait a bit for Meet to fully load
  }
});