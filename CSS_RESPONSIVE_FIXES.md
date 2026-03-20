# CSS Responsive Design Fixes - Code Snippets

Ready-to-use fixes for the identified responsive design issues. Apply these in priority order.

---

## Phase 1: CRITICAL FIXES (Apply Immediately)

### Fix 1.1: Form Input Accessibility (iOS Zoom Issue)

**Apply to:** `forms.css`, `auth-modern.css`

```css
/* ========== MOBILE-FIRST FORM INPUTS ========== */

/* Add to global :root or use in @media queries */
@media (max-width: 767px) {
  .form-control,
  .form-select,
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="tel"],
  textarea {
    font-size: 16px !important;  /* CRITICAL: Prevents iOS zoom-on-focus */
    padding: 12px 12px !important;
    min-height: 44px;  /* WCAG accessibility minimum */
    border-radius: 8px;
  }
}

@media (min-width: 768px) {
  .form-control,
  .form-select {
    font-size: 0.88rem;
    padding: 0.625rem 0.875rem;
    min-height: auto;
  }
}
```

**Why:** Users on iOS cannot see text while typing if font-size < 16px (text hides behind keyboard)

---

### Fix 1.2: Button Touch Targets (Accessibility)

**Apply to:** `global.css`, `dashboard.css`, `button-visibility.css`

```css
/* ========== WCAG ACCESSIBLE BUTTONS ========== */

/* ALL buttons must be >= 44x44px on mobile */
.btn,
button,
[role="button"],
.mgmt-actions button {
  min-height: 44px;  /* WCAG minimum */
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;  /* Achieves 44px with default 16px line-height */
}

/* Small buttons can be slightly smaller but never < 36px */
.btn-sm {
  min-height: 36px;
  padding: 8px 12px;
}

/* Table action buttons - CRITICAL FIX */
.mgmt-actions button {
  padding: 6px 12px;  /* Was 3px! */
  font-size: 0.75rem;
  min-height: 36px;
  border-radius: 8px;
  margin: 2px;  /* Add spacing to prevent accidental clicks */
}

@media (min-width: 768px) {
  .btn {
    padding: 0.625rem 1.25rem;
    min-height: auto;  /* Let content determine on desktop */
  }

  .mgmt-actions button {
    padding: 4px 10px;
    margin: 1px;
  }
}
```

---

### Fix 1.3: No Media Queries in Forms.css (CRITICAL)

**Replace entire form rules in `forms.css`:**

```css
/* ========== MOBILE-FIRST FORMS ========== */

/* Main Container - MOBILE FIRST */
.form-container {
  background: #ffffff;
  padding: 1rem;  /* Was 2rem - wastes 20% of mobile screen */
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
}

.form-section {
  margin-bottom: 1.25rem;  /* Was 2rem */
}

.form-section-title {
  font-size: 1.1rem;  /* Was 1.25rem */
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #10b981;
}

/* Form Label */
.form-label {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;  /* Was 0.95rem */
  display: block;
}

.form-label .required {
  color: #ef4444;
  margin-left: 2px;
}

/* Form Controls - MOBILE FIRST */
.form-control,
.form-select {
  border-radius: 0.5rem;
  border: 1.5px solid #e2e8f0;
  padding: 12px 12px;  /* Was 0.6rem 0.85rem - too small */
  font-size: 16px;  /* iOS requirement - prevents zoom */
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease;
  background-color: #ffffff;
  color: #0f172a;
  min-height: 44px;  /* Accessibility */
  width: 100%;
}

.form-control:focus,
.form-select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  background-color: #ffffff;
  color: #0f172a;
}

.form-control::placeholder {
  color: #999999;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #ef4444;
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Form Text Help */
.form-text {
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Invalid Feedback */
.invalid-feedback {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

/* Textarea - MOBILE FIRST */
textarea.form-control {
  min-height: 80px;  /* Was 120px - wastes space on mobile */
  resize: vertical;
}

/* Input Group */
.input-group {
  gap: 0.5rem;
  display: flex;
}

.input-group-text {
  background-color: #f8f9fa;
  border-radius: 0.35rem;
  border: 1px solid #e2e8f0;
  color: #495057;
  padding: 12px;
}

/* File Input */
.form-control[type="file"] {
  padding: 0.5rem;
}

.file-upload-area {
  border: 2px dashed #0ea5e9;
  border-radius: 0.5rem;
  padding: 1.5rem;  /* Was 2rem */
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f0f9ff;
}

.file-upload-area:hover {
  background-color: #e0f2fe;
  border-color: #0284c7;
}

/* ========== TABLET & LARGER ========== */
@media (min-width: 576px) {
  .form-container {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .form-section-title {
    font-size: 1.25rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
  }

  .form-label {
    font-size: 0.95rem;
  }

  .form-control,
  .form-select {
    padding: 0.625rem 0.875rem;
    font-size: 0.88rem;
    min-height: auto;
  }

  .input-group-text {
    padding: 0.625rem 0.875rem;
  }

  textarea.form-control {
    min-height: 100px;
  }

  .file-upload-area {
    padding: 2rem;
  }
}

/* ========== DESKTOP ========== */
@media (min-width: 992px) {
  .form-container {
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .form-section-title {
    font-size: 1.4rem;
  }

  textarea.form-control {
    min-height: 120px;
  }
}
```

---

### Fix 1.4: Auth Form Mobile Responsive

**Add to `auth-modern.css` after existing styles:**

```css
/* ========== MOBILE-FIRST AUTH FORM ========== */

@media (max-width: 575px) {
  .auth-container {
    padding: 1rem 1rem;
  }

  .auth-page-title h1 {
    font-size: 1.35rem;  /* Was same size everywhere */
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }

  .auth-page-subtitle {
    font-size: 0.75rem;
  }

  .auth-wrapper {
    width: 100%;
    max-width: 100%;
  }

  .auth-card {
    border-radius: 12px;
    margin: 0 -1rem;  /* Full width */
  }

  .auth-tabs {
    padding: 0.4rem 0.4rem 0;
  }

  .auth-tab {
    padding: 0.6rem 0.4rem 0.55rem;
    font-size: 0.65rem;
  }

  .auth-tab-content.active {
    padding: 1.25rem 1rem 1rem;  /* Was 1.5rem 1.75rem */
  }

  .form-group {
    margin-bottom: 0.9rem;
  }

  .form-label {
    font-size: 0.68rem;
    margin-bottom: 0.35rem;
  }

  .form-control {
    font-size: 16px !important;  /* iOS requirement */
    padding: 10px 10px;
    min-height: 40px;
  }

  .btn {
    padding: 10px 1.25rem;
    font-size: 0.8rem;
    min-height: 40px;
    width: 100%;
  }

  .alert {
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
    margin-bottom: 0.6rem;
  }
}

@media (min-width: 576px) {
  .auth-page-title h1 {
    font-size: 1.65rem;
  }

  .auth-page-subtitle {
    font-size: 0.82rem;
  }

  .auth-card {
    border-radius: 16px;
  }

  .auth-tabs {
    padding: 0.5rem 0.5rem 0;
  }

  .auth-tab {
    padding: 0.7rem 0.5rem 0.65rem;
    font-size: 0.7rem;
  }

  .auth-tab-content.active {
    padding: 1.5rem 1.75rem 1.25rem;
  }

  .form-control {
    font-size: 0.88rem;
    padding: 0.65rem 0.9rem;
  }

  .btn {
    padding: 0.72rem 1.5rem;
    font-size: 0.85rem;
    width: 100%;
  }
}
```

---

## Phase 2: HIGH PRIORITY FIXES (Polish & Optimization)

### Fix 2.1: Responsive Typography System

**Create new file:** `responsive-typography.css` or add to `global.css`

```css
/* ========== RESPONSIVE TYPOGRAPHY SYSTEM ========== */

:root {
  /* Mobile-first Typography (base) */
  --fs-xs: 0.75rem;
  --fs-sm: 0.875rem;
  --fs-base: 13px;
  --fs-lg: 1rem;
  --fs-xl: 1.1rem;
  --fs-2xl: 1.3rem;
  --fs-3xl: 1.5rem;
  --fs-4xl: 1.8rem;

  --lh-tight: 1.2;
  --lh-normal: 1.6;
  --lh-relaxed: 1.8;
}

/* Mobile-first base sizes */
html {
  font-size: 13px;
}

body {
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

h1 {
  font-size: var(--fs-3xl);
  line-height: var(--lh-tight);
}

h2 {
  font-size: var(--fs-2xl);
  line-height: var(--lh-tight);
}

h3 {
  font-size: var(--fs-xl);
  line-height: var(--lh-tight);
}

h4 {
  font-size: var(--fs-lg);
  line-height: var(--lh-normal);
}

h5 {
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

h6 {
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.text-xs { font-size: var(--fs-xs); }
.text-sm { font-size: var(--fs-sm); }
.text-lg { font-size: var(--fs-lg); }
.text-xl { font-size: var(--fs-xl); }

/* ========== TABLET: 576px ========== */
@media (min-width: 576px) {
  :root {
    --fs-base: 14px;
    --fs-lg: 1.05rem;
    --fs-xl: 1.2rem;
    --fs-2xl: 1.5rem;
    --fs-3xl: 1.75rem;
    --fs-4xl: 2rem;
  }

  html {
    font-size: 14px;
  }
}

/* ========== LANDSCAPE TABLET: 768px ========== */
@media (min-width: 768px) {
  :root {
    --fs-base: 14.5px;
    --fs-lg: 1.1rem;
    --fs-xl: 1.3rem;
    --fs-2xl: 1.65rem;
    --fs-3xl: 2rem;
    --fs-4xl: 2.25rem;
  }
}

/* ========== DESKTOP: 992px ========== */
@media (min-width: 992px) {
  :root {
    --fs-base: 15px;
    --fs-lg: 1.15rem;
    --fs-xl: 1.4rem;
    --fs-2xl: 1.8rem;
    --fs-3xl: 2.2rem;
    --fs-4xl: 2.6rem;
  }

  html {
    font-size: 15px;
  }
}

/* ========== LARGE DESKTOP: 1200px ========== */
@media (min-width: 1200px) {
  :root {
    --fs-base: 16px;
    --fs-lg: 1.25rem;
    --fs-xl: 1.5rem;
    --fs-2xl: 2rem;
    --fs-3xl: 2.5rem;
    --fs-4xl: 3rem;
  }

  html {
    font-size: 16px;
  }
}
```

**Import in `global.css` (at the top):**
```css
@import './responsive-typography.css';
```

---

### Fix 2.2: Responsive Spacing & Layout Variables

**Add to `global.css` after :root:**

```css
/* ========== RESPONSIVE SPACING & LAYOUT SYSTEM ========== */

:root {
  /* Mobile-first Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.25rem;
  --space-2xl: 1.5rem;
  --space-3xl: 2rem;

  /* Container Padding */
  --container-pad: 1rem;

  /* Grid Gap */
  --grid-gap: 8px;

  /* Card Padding */
  --card-pad: 12px;
}

@media (min-width: 576px) {
  :root {
    --space-xs: 0.3rem;
    --space-sm: 0.6rem;
    --space-md: 0.9rem;
    --space-lg: 1.2rem;
    --space-xl: 1.5rem;
    --space-2xl: 1.8rem;
    --space-3xl: 2.4rem;

    --container-pad: 1.25rem;
    --grid-gap: 10px;
    --card-pad: 14px;
  }
}

@media (min-width: 768px) {
  :root {
    --container-pad: 1.5rem;
    --grid-gap: 12px;
    --card-pad: 16px;
  }
}

@media (min-width: 992px) {
  :root {
    --space-xs: 0.5rem;
    --space-sm: 0.75rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 1.75rem;
    --space-2xl: 2rem;
    --space-3xl: 3rem;

    --container-pad: 2rem;
    --grid-gap: 14px;
    --card-pad: 18px;
  }
}

/* Apply spacing consistently */
.btn {
  padding: var(--space-md) var(--space-lg);
}

.card-body {
  padding: var(--card-pad);
}

.container-fluid,
.dashboard-container,
.mgmt-container {
  padding: var(--container-pad);
}

.form-group {
  margin-bottom: var(--space-lg);
}
```

---

### Fix 2.3: Sidebar Responsive Width

**Replace in `sidebar.css`:**

```css
/* ========== RESPONSIVE SIDEBAR ========== */

:root {
  --sidebar-width: 260px;  /* Desktop default */
}

/* ========== MOBILE: < 576px ========== */
@media (max-width: 575px) {
  :root {
    --sidebar-width: 85vw;
  }

  .sidebar {
    width: var(--sidebar-width);
    max-width: 300px;
    position: fixed;
    left: -100%;  /* Off-canvas */
    top: var(--banner-height, 38px);
    height: 100vh;
    transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2000;
    padding: 8px 12px;
  }

  .sidebar.show {
    left: 0;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: var(--banner-height, 38px);
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 1999;
  }

  .sidebar-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .hamburger-menu {
    display: flex !important;
  }
}

/* ========== TABLET: 576px - 768px ========== */
@media (min-width: 576px) and (max-width: 768px) {
  :root {
    --sidebar-width: 220px;  /* Reduced for tablet */
  }

  .sidebar {
    width: var(--sidebar-width);
    position: fixed;
    left: 0;
    top: var(--banner-height, 38px);
    height: calc(100vh - var(--banner-height, 38px) - var(--footer-height, 42px));
    z-index: 1001;
    padding: 8px 10px;
  }

  .hamburger-menu {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }
}

/* ========== DESKTOP: >= 992px ========== */
@media (min-width: 992px) {
  :root {
    --sidebar-width: 260px;
  }

  .sidebar {
    width: var(--sidebar-width);
    position: fixed;
    left: 0;
    top: var(--banner-height, 38px);
    height: calc(100vh - var(--banner-height, 38px) - var(--footer-height, 42px));
    z-index: 1001;
    padding: 8px 12px;
    overflow-y: auto;
  }

  .hamburger-menu {
    display: none !important;
  }

  .sidebar-overlay {
    display: none !important;
  }
}

/* Core sidebar styles */
.sidebar {
  background: var(--sidebar-bg);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08);
  border-right: 2px solid #d1fae5;
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  padding: 8px 0;
  flex: 1;
  overflow-y: auto;
}

.sidebar-link {
  color: var(--sidebar-text) !important;
  padding: 10px 12px !important;  /* Achieves 44px height */
  margin-bottom: 2px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  font-weight: 600;
  min-height: 44px;  /* WCAG */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.sidebar-link:hover,
.sidebar-link.active {
  background-color: var(--sidebar-hover);
  color: #059669 !important;
  border-left-color: #10b981;
}
```

---

### Fix 2.4: Footer Mobile Positioning

**Replace in `footer.css`:**

```css
/* ========== RESPONSIVE FOOTER ========== */

.app-footer {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-top: 2px solid #10b981;
  padding: 10px 16px;  /* Reduced from 24px */
  position: fixed;
  bottom: 0;
  left: 0;  /* Mobile-first: full width */
  right: 0;
  z-index: 1000;
  height: var(--footer-height, 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.3s both;
}

.footer-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 8px;
  flex-wrap: wrap;
}

.footer-year {
  font-size: 0.75rem;  /* Smaller on mobile */
  color: #94a3b8;
  margin: 0;
  font-weight: 600;
}

.footer-credit {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

/* ========== TABLET & LARGER ========== */
@media (min-width: 576px) {
  .app-footer {
    padding: 10px 24px;
  }

  .footer-year {
    font-size: 0.82rem;
  }

  .footer-credit {
    font-size: 0.82rem;
  }
}

/* ========== DESKTOP: Adjust for sidebar ========== */
@media (min-width: 992px) {
  .app-footer {
    left: var(--sidebar-width, 260px);  /* Only on desktop */
  }
}
```

---

### Fix 2.5: Dashboard Tables Responsive

**Add to `dashboard.css`:**

```css
/* ========== RESPONSIVE TABLE SYSTEM ========== */

.mgmt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;  /* Mobile-first: smaller */
  margin: 0;
  table-layout: fixed;
}

.mgmt-table thead th {
  padding: 8px 10px;  /* Mobile-first: reduced */
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  white-space: nowrap;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  border: 1px solid #334155;
  text-align: left;
  vertical-align: middle;
}

.mgmt-table tbody td {
  display: table-cell;
  padding: 7px 10px;  /* Mobile-first: reduced */
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  color: #334155;
  font-size: 0.75rem;  /* Mobile-first: smaller */
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mgmt-table tbody tr {
  display: table-row;
  transition: background 0.2s ease;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}

.mgmt-table tbody tr:hover {
  background: #f0fdf4;
  box-shadow: inset 0 0 0 1px #dcfce7;
}

/* ========== TABLET: 576px+ ========== */
@media (min-width: 576px) {
  .mgmt-table {
    font-size: 0.82rem;
  }

  .mgmt-table thead th {
    padding: 9px 12px;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
  }

  .mgmt-table tbody td {
    padding: 9px 12px;
    font-size: 0.8rem;
  }
}

/* ========== DESKTOP: 992px+ ========== */
@media (min-width: 992px) {
  .mgmt-table {
    font-size: 0.85rem;
  }

  .mgmt-table thead th {
    padding: 10px 12px;
    font-size: 0.72rem;
  }

  .mgmt-table tbody td {
    padding: 10px 12px;
    font-size: 0.82rem;
  }
}

/* Action buttons in table */
.mgmt-actions {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
}

.mgmt-actions button {
  padding: 6px 10px;  /* Mobile-first: was 3px! */
  font-size: 0.7rem;
  border-radius: 6px;
  font-weight: 600;
  gap: 3px;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  min-height: 32px;  /* Touch-friendly */
}

@media (min-width: 768px) {
  .mgmt-actions button {
    padding: 5px 10px;
    font-size: 0.68rem;
  }
}
```

---

### Fix 2.6: Dashboard Controls Responsive

**Replace in `dashboard.css`:**

```css
/* ========== RESPONSIVE CONTROLS BAR ========== */

.mgmt-controls {
  display: flex;
  gap: 8px;  /* Reduced from 10px */
  margin-bottom: var(--grid-gap);
  flex-wrap: wrap;
}

.mgmt-controls .mgmt-search {
  flex: 1;
  min-width: 0;  /* Mobile-first: no minimum */
  padding: 8px 12px;  /* Mobile-first: smaller */
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  background: #fff;
  color: #0f172a;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.mgmt-controls .mgmt-search:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

.mgmt-controls .mgmt-filter {
  flex: 1;  /* Mobile-first: full width */
  min-width: 0;
  padding: 8px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.mgmt-controls .mgmt-filter:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}

/* ========== TABLET: 576px+ ========== */
@media (min-width: 576px) {
  .mgmt-controls {
    gap: 10px;
  }

  .mgmt-controls .mgmt-search {
    flex: 2;  /* Search gets 2x width */
    min-width: 150px;
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
  }

  .mgmt-controls .mgmt-filter {
    flex: 1;
    min-width: 120px;
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
  }
}

/* ========== DESKTOP: 992px+ ========== */
@media (min-width: 992px) {
  .mgmt-controls .mgmt-search {
    flex: 2;
    min-width: 200px;
    padding: 0.5rem 0.85rem;
    font-size: 0.82rem;
  }

  .mgmt-controls .mgmt-filter {
    flex: 1;
    min-width: 160px;
  }
}
```

---

### Fix 2.7: Grid Layouts Responsive

**Replace grid system in `dashboard.css`:**

```css
/* ========== RESPONSIVE BENTO GRID ========== */

:root {
  --grid-gap: 8px;  /* Mobile-first */
}

@media (min-width: 576px) {
  :root {
    --grid-gap: 10px;
  }
}

@media (min-width: 992px) {
  :root {
    --grid-gap: 14px;
  }
}

.bento-grid {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: 1fr;  /* Mobile-first: single column */
}

/* Mobile: all 1 column */
.bento-grid.cols-1 { grid-template-columns: 1fr; }
.bento-grid.cols-2 { grid-template-columns: 1fr; }
.bento-grid.cols-3 { grid-template-columns: 1fr; }
.bento-grid.cols-4 { grid-template-columns: 1fr; }

/* Tablet: 2 columns */
@media (min-width: 576px) {
  .bento-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .bento-grid.cols-3 { grid-template-columns: repeat(2, 1fr); }
  .bento-grid.cols-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: full columns */
@media (min-width: 992px) {
  .bento-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .bento-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .bento-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
}

.bento-card {
  background: #fff;
  border-radius: var(--card-radius);
  padding: var(--card-pad);  /* Now responsive */
  box-shadow: var(--shadow-rest);
  border: 1.5px solid #e2e8f0;
  transition: all var(--transition-base);
}

.bento-card:hover {
  transform: translateY(-3px) scale(1.008);
  box-shadow: var(--shadow-hover);
  border-color: #cbd5e1;
}
```

---

## Phase 3: Test Checklist

After applying fixes, test on these breakpoints:

```
[ ] 320px (iPhone SE)
[ ] 375px (iPhone 12)
[ ] 480px (Android)
[ ] 576px (Bootstrap tablet)
[ ] 768px (iPad)
[ ] 992px (Large tablet)
[ ] 1024px (Desktop)
[ ] 1440px (Large desktop)
```

### Mobile Testing Checklist
```
[ ] No horizontal scrolling
[ ] Form inputs 16px font on iOS
[ ] All buttons >= 44x44px
[ ] Sidebar properly toggles
[ ] Footer doesn't overlap
[ ] Tables readable (no cramping)
[ ] Modals centered and sized
[ ] Text hierarchy clear
[ ] Touch targets have spacing (no accidental clicks)
[ ] Forms work without zoom on iOS
```

---

## Summary of Changes

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Form input font | 16px | 0.88rem | 0.88rem |
| Form input padding | 12px | 0.625rem | 0.625rem |
| Form container padding | 1rem | 1.5rem | 2rem |
| Button padding | 10px 16px (44px min) | 0.625rem 1.25rem | auto |
| Sidebar width | 85vw (max 300px) | 220px | 260px |
| Table cell padding | 7px 10px | 9px 12px | 10px 12px |
| Typography scales | Yes | Yes | Yes |
| Grid: 4 cols | 1 col | 2 cols | 4 cols |
| Card padding | 12px | 16px | 18px |
| Space gap | 8px | 10px | 14px |
