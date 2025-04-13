// Popup script for GitHub Absolute Dates Extension

document.addEventListener('DOMContentLoaded', function() {
    // Get the toggle button from popup.html
    const toggleButton = document.getElementById('toggleButton');
    const statusText = document.getElementById('status');
    
    // Initialize button state
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.storage.local.get('dateMode', function(data) {
        const isAbsolute = data.dateMode !== 'relative';
        updateButtonUI(isAbsolute);
      });
    });
    
    // Add click event
    toggleButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0].url.includes('github.com')) {
          // Get current state and toggle it
          chrome.storage.local.get('dateMode', function(data) {
            const currentMode = data.dateMode || 'absolute';
            const newMode = currentMode === 'absolute' ? 'relative' : 'absolute';
            
            // Save new state
            chrome.storage.local.set({dateMode: newMode}, function() {
              console.log('Date mode set to: ' + newMode);
              
              // Update UI
              updateButtonUI(newMode === 'absolute');
              
              // Send message to content script
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleDateFormat'
              }, function(response) {
                console.log('Toggle response:', response);
              });
            });
          });
        } else {
          statusText.textContent = 'This extension only works on GitHub.';
          statusText.style.color = 'red';
        }
      });
    });
    
    function updateButtonUI(isAbsolute) {
      if (isAbsolute) {
        toggleButton.textContent = 'Switch to Absolute Dates';
        statusText.textContent = 'Currently showing: Relative Dates';
        statusText.style.color = '#2ea44f';
      } else {
        toggleButton.textContent = 'Switch to Relative Dates';
        statusText.textContent = 'Currently showing: Absolute Dates';
        statusText.style.color = '#0969da';
      }
    }
  });