// Background script for GitHub Absolute Dates Extension

// Initialize extension state
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({dateMode: 'absolute'}, function() {
      console.log('GitHub Date Format extension initialized with absolute dates.');
    });
  });
  
  // Add listener for extension icon click (quick toggle without popup)
  chrome.action.onClicked.addListener(function(tab) {
    if (tab.url.includes('github.com')) {
      chrome.storage.local.get('dateMode', function(data) {
        const currentMode = data.dateMode || 'absolute';
        const newMode = currentMode === 'absolute' ? 'relative' : 'absolute';
        
        // Save new state
        chrome.storage.local.set({dateMode: newMode}, function() {
          console.log('Date mode toggled to: ' + newMode);
          
          // Update the badge text to indicate current mode
          chrome.action.setBadgeText({
            text: newMode === 'absolute' ? 'ABS' : 'REL',
            tabId: tab.id
          });
          
          // Send message to content script
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleDateFormat'
          }, function(response) {
            console.log('Toggle response:', response);
          });
        });
      });
    }
  });
  
  // Update the badge when tabs change
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      if (tab.url && tab.url.includes('github.com')) {
        chrome.storage.local.get('dateMode', function(data) {
          const mode = data.dateMode || 'absolute';
          chrome.action.setBadgeText({
            text: mode === 'absolute' ? 'ABS' : 'REL',
            tabId: tab.id
          });
        });
      } else {
        chrome.action.setBadgeText({
          text: '',
          tabId: tab.id
        });
      }
    });
  });