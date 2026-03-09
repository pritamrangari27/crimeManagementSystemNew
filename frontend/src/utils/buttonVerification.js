/**
 * Button Visibility Verification Script
 * Run this in browser console to verify buttons are visible
 */

window.verifyButtonVisibility = function() {
  const results = {
    timestamp: new Date().toLocaleString(),
    totalButtons: 0,
    visibleButtons: 0,
    hiddenButtons: [],
    warnings: []
  };

  // Check all buttons
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  results.totalButtons = buttons.length;

  buttons.forEach((btn, idx) => {
    const style = window.getComputedStyle(btn);
    const isVisible = 
      style.visibility !== 'hidden' && 
      style.display !== 'none' && 
      style.opacity !== '0' &&
      btn.offsetParent !== null;

    if (isVisible && !btn.disabled) {
      results.visibleButtons++;
    } else if (!btn.disabled) {
      results.hiddenButtons.push({
        index: idx,
        tag: btn.tagName,
        text: btn.textContent?.substring(0, 50),
        visibility: style.visibility,
        display: style.display,
        opacity: style.opacity,
        disabled: btn.disabled
      });
    }
  });

  // Check for CSS rule violations
  const styleSheets = Array.from(document.styleSheets);
  styleSheets.forEach(sheet => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      Array.from(rules).forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('button')) {
          if (rule.style.display === 'none' || 
              rule.style.visibility === 'hidden' || 
              rule.style.opacity === '0') {
            results.warnings.push(`Found hiding rule: ${rule.selectorText}`);
          }
        }
      });
    } catch (e) {
      // Skip CORS-protected stylesheets
    }
  });

  // Report
  console.log('%c=== BUTTON VISIBILITY REPORT ===', 'color: blue; font-size: 16px; font-weight: bold;');
  console.log(`Total Buttons: ${results.totalButtons}`);
  console.log(`Visible Buttons: ${results.visibleButtons}`);
  console.log(`Hidden Buttons: ${results.hiddenButtons.length}`);
  
  if (results.hiddenButtons.length > 0) {
    console.warn('%cHidden buttons detected:', 'color: red; font-weight: bold;');
    console.table(results.hiddenButtons);
  } else {
    console.log('%cAll buttons are visible! ✓', 'color: green; font-weight: bold;');
  }

  if (results.warnings.length > 0) {
    console.warn('%cCSS warnings:', 'color: orange; font-weight: bold;');
    results.warnings.forEach(w => console.warn(w));
  }

  return results;
};

window.forceButtonVisibility = function() {
  console.log('Forcing all button visibility...');
  
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  buttons.forEach(btn => {
    btn.style.cssText = `
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    `;
  });

  console.log(`Fixed ${buttons.length} buttons`);
  return window.verifyButtonVisibility();
};

window.startButtonWatcher = function() {
  console.log('Starting button visibility watcher...');
  
  const watcher = setInterval(() => {
    const buttons = document.querySelectorAll('button, .btn');
    let fixed = 0;
    
    buttons.forEach(btn => {
      const style = window.getComputedStyle(btn);
      if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') {
        btn.style.visibility = 'visible';
        btn.style.display = 'inline-flex';
        btn.style.opacity = '1';
        fixed++;
      }
    });

    if (fixed > 0) {
      console.warn(`Fixed ${fixed} buttons that were hidden`);
    }
  }, 1000);

  window.stopButtonWatcher = () => {
    clearInterval(watcher);
    console.log('Button watcher stopped');
  };

  return { message: 'Watcher started. Call stopButtonWatcher() to stop.', watcher };
};

// Auto-run on load
console.info('Button visibility utilities loaded. Available functions:');
console.info('- verifyButtonVisibility(): Check all buttons');
console.info('- forceButtonVisibility(): Force all buttons visible');
console.info('- startButtonWatcher(): Monitor and fix hidden buttons');
