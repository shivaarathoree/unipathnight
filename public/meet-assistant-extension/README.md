# AI Career Coach Google Meet Assistant

A browser extension that integrates with Google Meet to provide real-time AI assistance during job interviews.

## Features

- Automatically detects Google Meet sessions
- Listens to interview questions using speech recognition
- Processes questions with Google's Gemini 2.5 Flash AI
- Displays answers only on the student's screen (invisible to interviewer)
- Secure API key storage

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `meet-assistant-extension` folder
4. Pin the extension to your toolbar for easy access

## Setup

1. Click the extension icon in your toolbar
2. Enter your Gemini API key in the popup
3. Click "Save API Key"
4. Join a Google Meet session
5. The assistant will automatically activate

## How It Works

1. **Detection**: The extension automatically detects when you join a Google Meet session
2. **Listening**: Uses your microphone to capture audio from the meeting
3. **Transcription**: Converts spoken questions to text using Web Speech API
4. **Processing**: Sends questions to Gemini 2.5 Flash for answer generation
5. **Display**: Shows answers in a discreet overlay visible only to you

## Privacy & Security

- Audio is processed locally and never sent to external servers (except for speech recognition)
- Your API key is stored securely in browser storage
- The overlay is only visible to you, not to other meeting participants
- No data is collected or stored by the extension

## Troubleshooting

### Microphone Permissions
If the assistant isn't hearing questions:
1. Check that the extension has microphone permissions
2. Ensure your microphone is working and selected in Google Meet
3. Check that your browser allows microphone access for Meet

### API Key Issues
If answers aren't generating:
1. Verify your Gemini API key is valid
2. Check that you have access to the Gemini 2.5 Flash model
3. Ensure you have internet connectivity

### Overlay Not Visible
If the answer overlay isn't appearing:
1. The extension may still be initializing (wait a few seconds)
2. Try refreshing the Google Meet page
3. Check the browser console for errors (F12)

## Technical Details

### Technologies Used
- Chrome Extension Manifest V3
- Web Speech API for speech recognition
- Google Gemini API for natural language processing
- Vanilla JavaScript for content scripts

### Files
- `manifest.json` - Extension configuration
- `background.js` - Service worker for tab detection
- `content.js` - Main logic running in Google Meet tabs
- `content.css` - Styling for the answer overlay
- `popup.html/js` - Configuration interface