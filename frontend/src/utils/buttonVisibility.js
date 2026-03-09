/**
 * Button Visibility Manager
 * Prevents buttons from disappearing due to state race conditions
 */

import React from 'react';

export const ensureButtonVisibility = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* ===== GLOBAL BUTTON VISIBILITY RULES ===== */
    /* Prevent ANY button from being hidden */
    .btn, button, [role="button"] {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      appearance: button;
    }

    .btn:disabled, button:disabled {
      opacity: 0.6 !important;
      pointer-events: auto !important;
      cursor: not-allowed !important;
      visibility: visible !important;
    }

    /* Bootstrap button variants */
    .btn-primary, .btn-success, .btn-danger, .btn-warning, .btn-info, .btn-secondary {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
    }

    /* Export page specific */
    .export-buttons-container {
      visibility: visible !important;
      display: block !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      z-index: 5 !important;
      position: relative !important;
    }

    .export-buttons-container .btn {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    /* Card containers should never hide buttons */
    .card, [class*="card"] {
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* Form elements */
    form, [role="form"] {
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* Flex containers with buttons */
    .d-flex button, .d-flex .btn {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
    }

    /* Grid containers */
    .row button, .col button {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
    }

    /* Modal buttons */
    .modal-body button, .modal-footer button {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
    }

    /* Prevent display:none on buttons */
    button { 
      display: inline-flex !important; 
    }

    /* Prevent opacity 0 */
    button, .btn { 
      opacity: inherit !important; 
    }

    /* Prevent hidden attributes */
    button[hidden], .btn[hidden] {
      display: none !important;
    }

    /* Management table actions */
    .mgmt-actions button {
      visibility: visible !important;
      display: inline-flex !important;
      opacity: 1 !important;
    }
  `;
  
  // Inject into document head
  if (document.head) {
    document.head.appendChild(style);
  }
};

/**
 * Check if all buttons on a page are visible
 */
export const checkButtonVisibility = () => {
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  let hiddenCount = 0;

  buttons.forEach(btn => {
    const computed = window.getComputedStyle(btn);
    const isHidden = 
      computed.visibility === 'hidden' || 
      computed.display === 'none' || 
      computed.opacity === '0' ||
      btn.offsetParent === null;
    
    if (isHidden && !btn.disabled) {
      hiddenCount++;
      console.warn('Hidden button detected:', btn);
      // Force visibility
      btn.style.visibility = 'visible !important';
      btn.style.display = 'inline-flex !important';
      btn.style.opacity = '1 !important';
      btn.style.pointerEvents = 'auto !important';
    }
  });

  return { total: buttons.length, hidden: hiddenCount };
};

/**
 * Prevent state from causing button disappearance
 */
export const preventButtonHiding = (ref) => {
  if (!ref || !ref.current) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const el = mutation.target;
        const attr = mutation.attributeName;
        
        // Prevent style changes that hide buttons
        if (attr === 'style' && (el.tagName === 'BUTTON' || el.classList.contains('btn'))) {
          const style = el.getAttribute('style') || '';
          if (style.includes('display:none') || style.includes('visibility:hidden')) {
            el.style.visibility = 'visible';
            el.style.display = 'inline-flex';
            el.style.opacity = '1';
          }
        }
      }
    });
  });

  observer.observe(ref.current, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    subtree: true,
  });

  return observer;
};

/**
 * Initialize button visibility on component mount
 */
export const useButtonVisibility = () => {
  React.useEffect(() => {
    ensureButtonVisibility();
    
    // Check button visibility periodically
    const interval = setInterval(() => {
      checkButtonVisibility();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);
};

export default ensureButtonVisibility;
