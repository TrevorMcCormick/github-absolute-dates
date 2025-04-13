// GitHub Absolute Dates Extension - Simple Version
// This version only toggles dates via the Chrome extension button

let showAbsoluteDates = true;

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch (e) {
    console.error('Date format error:', e);
    return dateStr;
  }
}

function loadPreference() {
  const saved = localStorage.getItem('github-date-mode');
  if (saved === 'absolute' || saved === 'relative') {
    showAbsoluteDates = saved === 'absolute';
  }
}

function savePreference() {
  localStorage.setItem('github-date-mode', showAbsoluteDates ? 'absolute' : 'relative');
}

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .github-absolute-date {
      font-size: 14px;
      display: inline-block;
      white-space: nowrap;
      color: inherit;
    }
    
    /* Force latest commit details to be visible */
    [data-testid="latest-commit-details"] {
      display: flex !important;
      visibility: visible !important;
    }
    
    /* Style for latest commit details specifically */
    [data-testid="latest-commit-details"] .github-absolute-date {
      font-size: inherit;
      color: var(--color-fg-muted, #57606a);
    }
    
    th.Box-sc-g0xbh4-0.jMbWeI {
      width: fit-content !important;
    }
  `;
  document.head.appendChild(style);
}

function updateDates() {
  // Select all relative-time elements
  const times = document.querySelectorAll('relative-time');
  console.log(`Found ${times.length} relative-time elements`);

  times.forEach(el => {
    // Check if this is inside a latest commit details div
    const isLatestCommitDetails = el.closest('[data-testid="latest-commit-details"]');
    
    // Get the appropriate parent element
    const parent = el.closest('td') || el.parentElement;
    if (!parent) return;

    let abs = parent.querySelector('.github-absolute-date');

    if (!abs) {
      abs = document.createElement('span');
      abs.className = 'github-absolute-date';
      const datetime = el.getAttribute('datetime');
      abs.textContent = datetime ? formatDate(datetime) : '';
      
      // For the latest commit details, we need to handle the placement differently
      if (isLatestCommitDetails) {
        // Make sure to maintain any existing text/spacing
        const originalText = el.textContent;
        abs.style.whiteSpace = 'nowrap';
        abs.style.display = showAbsoluteDates ? 'inline-block' : 'none';
        el.insertAdjacentElement('beforebegin', abs);
      } else {
        el.insertAdjacentElement('beforebegin', abs);
      }
      
      console.log(`Added absolute date: ${abs.textContent} ${isLatestCommitDetails ? '(in latest commit details)' : ''}`);
    }

    abs.style.display = showAbsoluteDates ? 'inline-block' : 'none';
    el.style.display = showAbsoluteDates ? 'none' : 'inline-block';
  });
  
  // Additionally, let's check for the specific latest commit details div format
  const latestCommitDetails = document.querySelectorAll('[data-testid="latest-commit-details"]');
  latestCommitDetails.forEach(detailsDiv => {
    // Ensure it's visible, even if it has d-none class
    if (detailsDiv.classList.contains('d-none') && !detailsDiv.classList.contains('d-sm-flex')) {
      detailsDiv.classList.add('d-sm-flex');
    }
  });

  adjustColumnWidths();
}

function adjustColumnWidths() {
  const tables = document.querySelectorAll('.repository-content table.files');
  tables.forEach(table => {
    const msgs = table.querySelectorAll('td.message');
    const ages = table.querySelectorAll('td.age');

    msgs.forEach(td => td.style.width = showAbsoluteDates ? '50%' : '60%');
    ages.forEach(td => td.style.width = showAbsoluteDates ? '280px' : '140px');
  });
}

function initExtension() {
  loadPreference();
  addStyles();

  const observer = new MutationObserver(() => {
    updateDates();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  updateDates();
}

// Listen for messages from the extension popup/background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleDateFormat') {
    showAbsoluteDates = !showAbsoluteDates;
    savePreference();
    updateDates();
    sendResponse({success: true, mode: showAbsoluteDates ? 'absolute' : 'relative'});
  }
  return true; // Indicates we'll send a response asynchronously
});

document.addEventListener('DOMContentLoaded', initExtension);
window.addEventListener('load', initExtension);
setTimeout(initExtension, 500);