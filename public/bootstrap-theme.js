(function() {
  try {
    var raw = localStorage.getItem('vf.theme.bootstrap');
    if (!raw) return;
    var boot = JSON.parse(raw);
    var root = document.documentElement;
    var t = (boot.customTheme && boot.customTheme.tokens) || {};
    // Validate token values to prevent CSS injection via malicious localStorage.
    function validColor(v) {
      if (typeof v !== 'string' || v.length > 128) return false;
      if (/url\(|expression\(|javascript:|@import/i.test(v)) return false;
      return /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[-+\d\s.,%/]+\s*\)|hsla?\(\s*[-+\d\s.,deg%/]+\s*\)|transparent|currentColor)$/i.test(v);
    }
    function safeToken(val, fallback) {
      return validColor(val) ? val : fallback;
    }
    var isDracula = boot.selectedThemeId === 'builtin-dracula';
    var map = {
      '--bg': safeToken(t.background, isDracula ? '#282a36' : (boot.appearanceMode === 'light' ? '#f6f8fa' : '#0d1117')),
      '--surface': safeToken(t.surface, isDracula ? '#44475a' : (boot.appearanceMode === 'light' ? '#ffffff' : '#161b22')),
      '--surface-elevated': safeToken(t.surfaceElevated, isDracula ? '#6272a4' : (boot.appearanceMode === 'light' ? '#ffffff' : '#1c2330')),
      '--border': safeToken(t.border, isDracula ? '#6272a4' : (boot.appearanceMode === 'light' ? '#d0d7de' : '#2a3140')),
      '--text-primary': safeToken(t.textPrimary, isDracula ? '#f8f8f2' : (boot.appearanceMode === 'light' ? '#1f2328' : '#e6edf3')),
      '--text-secondary': safeToken(t.textSecondary, isDracula ? '#bfbfbf' : (boot.appearanceMode === 'light' ? '#57606a' : '#9aa7b8')),
      '--text-muted': safeToken(t.textMuted, isDracula ? '#6272a4' : (boot.appearanceMode === 'light' ? '#8b949e' : '#6b7686')),
      '--accent': safeToken(t.accent, isDracula ? '#bd93f9' : (boot.appearanceMode === 'light' ? '#0969da' : '#2f81f7')),
      '--accent-hover': safeToken(t.accentHover, isDracula ? '#ff79c6' : (boot.appearanceMode === 'light' ? '#0860c4' : '#4c93f8')),
      '--accent-fg': safeToken(t.accentForeground, isDracula ? '#f8f8f2' : '#ffffff'),
      '--success': safeToken(t.success, isDracula ? '#50fa7b' : (boot.appearanceMode === 'light' ? '#1a7f37' : '#3fb950')),
      '--warning': safeToken(t.warning, isDracula ? '#f1fa8c' : (boot.appearanceMode === 'light' ? '#9a6700' : '#d29922')),
      '--danger': safeToken(t.danger, isDracula ? '#ff5555' : (boot.appearanceMode === 'light' ? '#cf222e' : '#f85149')),
      '--info': safeToken(t.info, isDracula ? '#8be9fd' : (boot.appearanceMode === 'light' ? '#0969da' : '#58a6ff')),
      '--focus-ring': safeToken(t.focusRing, isDracula ? '#bd93f9' : (boot.appearanceMode === 'light' ? '#0969da' : '#4c93f8')),
      '--overlay': safeToken(t.overlay, isDracula ? 'rgba(40,42,54,0.7)' : (boot.appearanceMode === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)')),
      '--glow': safeToken(t.glow, isDracula ? 'rgba(189,147,249,0.2)' : (boot.appearanceMode === 'light' ? 'rgba(9,105,218,0.18)' : 'rgba(47,129,247,0.25)')),
    };
    Object.keys(map).forEach(function(k) { root.style.setProperty(k, map[k]); });
    root.dataset.themeMode = boot.appearanceMode || 'dark';
  } catch (e) {}
})();
