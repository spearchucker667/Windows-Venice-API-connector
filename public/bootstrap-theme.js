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
    var map = {
      '--bg': safeToken(t.background, boot.appearanceMode === 'light' ? '#f6f8fa' : '#0d1117'),
      '--surface': safeToken(t.surface, boot.appearanceMode === 'light' ? '#ffffff' : '#161b22'),
      '--surface-elevated': safeToken(t.surfaceElevated, boot.appearanceMode === 'light' ? '#ffffff' : '#1c2330'),
      '--border': safeToken(t.border, boot.appearanceMode === 'light' ? '#d0d7de' : '#2a3140'),
      '--text-primary': safeToken(t.textPrimary, boot.appearanceMode === 'light' ? '#1f2328' : '#e6edf3'),
      '--text-secondary': safeToken(t.textSecondary, boot.appearanceMode === 'light' ? '#57606a' : '#9aa7b8'),
      '--text-muted': safeToken(t.textMuted, boot.appearanceMode === 'light' ? '#8b949e' : '#6b7686'),
      '--accent': safeToken(t.accent, boot.appearanceMode === 'light' ? '#0969da' : '#2f81f7'),
      '--accent-hover': safeToken(t.accentHover, boot.appearanceMode === 'light' ? '#0860c4' : '#4c93f8'),
      '--accent-fg': safeToken(t.accentForeground, '#ffffff'),
      '--success': safeToken(t.success, boot.appearanceMode === 'light' ? '#1a7f37' : '#3fb950'),
      '--warning': safeToken(t.warning, boot.appearanceMode === 'light' ? '#9a6700' : '#d29922'),
      '--danger': safeToken(t.danger, boot.appearanceMode === 'light' ? '#cf222e' : '#f85149'),
      '--info': safeToken(t.info, boot.appearanceMode === 'light' ? '#0969da' : '#58a6ff'),
      '--focus-ring': safeToken(t.focusRing, boot.appearanceMode === 'light' ? '#0969da' : '#4c93f8'),
      '--overlay': safeToken(t.overlay, boot.appearanceMode === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)'),
      '--glow': safeToken(t.glow, boot.appearanceMode === 'light' ? 'rgba(9,105,218,0.18)' : 'rgba(47,129,247,0.25)'),
    };
    Object.keys(map).forEach(function(k) { root.style.setProperty(k, map[k]); });
    root.dataset.themeMode = boot.appearanceMode || 'dark';
  } catch (e) {}
})();
