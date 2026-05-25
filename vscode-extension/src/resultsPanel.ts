import * as vscode from 'vscode';

export class ResultsPanel {
  private panel: vscode.WebviewPanel;
  public  isDisposed = false;

  constructor(extensionUri: vscode.Uri) {
    this.panel = vscode.window.createWebviewPanel(
      'devinspectai.results',
      'DevInspectAI Results',
      vscode.ViewColumn.Beside,
      {
        enableScripts:          true,
        retainContextWhenHidden: true,
        localResourceRoots:     [extensionUri],
      }
    );
    this.panel.onDidDispose(() => { this.isDisposed = true; });
    this.panel.iconPath = vscode.Uri.joinPath(extensionUri, 'media', 'icon.png');
  }

  reveal() {
    if (!this.isDisposed) this.panel.reveal(vscode.ViewColumn.Beside, true);
  }

  showLoading(filename: string, mode: string) {
    this.panel.title   = 'DevInspectAI — Analyzing...';
    this.panel.webview.html = this.buildHtml({ state: 'loading', filename, mode });
  }

  showError(message: string) {
    this.panel.title   = 'DevInspectAI — Error';
    this.panel.webview.html = this.buildHtml({ state: 'error', message });
  }

  showResults(data: any, filename: string, mode: string) {
    this.panel.title   = `DevInspectAI — ${filename}`;
    this.panel.webview.html = this.buildHtml({ state: 'results', data, filename, mode });
  }

  // ── HTML builder ────────────────────────────────────────────────────────────
  private buildHtml(opts: {
    state:    'loading' | 'error' | 'results';
    filename?: string;
    mode?:     string;
    message?:  string;
    data?:     any;
  }): string {
    const { state, filename = '', mode = 'developer', message = '', data } = opts;

    const scoreColor = (s: number) =>
      s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';

    const severityColor = (sev: string) => {
      const s = (sev || '').toLowerCase();
      if (s.includes('critical')) return '#ef4444';
      if (s.includes('high'))     return '#f97316';
      if (s.includes('medium'))   return '#f59e0b';
      return '#6366f1';
    };

    const escHtml = (str: string) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // ── Loading state ──────────────────────────────────────────────────────
    if (state === 'loading') {
      return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevInspectAI</title>
<style>${BASE_CSS}</style></head><body>
<div class="container">
  <div class="header"><span class="logo">⚡ DevInspectAI</span><span class="mode-badge">${escHtml(mode)}</span></div>
  <div class="loading-wrap">
    <div class="spinner"></div>
    <p class="loading-title">Analyzing <strong>${escHtml(filename)}</strong></p>
    <p class="loading-sub">AI is reviewing your code for bugs, security issues, and optimizations...</p>
  </div>
</div></body></html>`;
    }

    // ── Error state ────────────────────────────────────────────────────────
    if (state === 'error') {
      return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevInspectAI</title>
<style>${BASE_CSS}</style></head><body>
<div class="container">
  <div class="header"><span class="logo">⚡ DevInspectAI</span></div>
  <div class="error-wrap">
    <div class="error-icon">❌</div>
    <p class="error-title">Analysis Failed</p>
    <p class="error-msg">${escHtml(message)}</p>
    <div class="tip-box">
      <strong>Troubleshooting:</strong><br>
      • Check <code>devinspectai.apiToken</code> in settings.json<br>
      • Verify backend is running at your configured URL<br>
      • Run <em>DevInspectAI: Verify Connection</em> from Command Palette
    </div>
  </div>
</div></body></html>`;
    }

    // ── Results state ──────────────────────────────────────────────────────
    const r        = data?.result || {};
    const score    = data?.aiScore ?? 0;
    const lang     = data?.language || 'unknown';
    const errors   = Array.isArray(r.errors)      ? r.errors      : [];
    const suggs    = Array.isArray(r.suggestions) ? r.suggestions : [];
    const secIssues= Array.isArray(r.securityIssues)   ? r.securityIssues   : [];
    const perfIssues=Array.isArray(r.performanceIssues)? r.performanceIssues: [];
    const strengths= Array.isArray(r.strengths)   ? r.strengths   : [];
    const weaknesses=Array.isArray(r.weaknesses)  ? r.weaknesses  : [];
    const mistakes = Array.isArray(r.mistakes)    ? r.mistakes    : [];
    const tips     = Array.isArray(r.tips)        ? r.tips        : [];
    const explanation = r.explanation || r.modeOutput || '';
    const verdict  = r.verdict || (score >= 70 ? 'PASS' : 'FAIL');
    const prodReady= r.productionReady;
    const timeC    = r.timeComplexity  || '';
    const spaceC   = r.spaceComplexity || '';

    const errorsHtml = errors.length ? errors.map((e: any) => `
      <div class="issue-item">
        <div class="issue-header">
          <span class="sev-dot" style="background:${severityColor(e.severity)}"></span>
          <span class="issue-sev" style="color:${severityColor(e.severity)}">${escHtml(e.severity || 'info').toUpperCase()}</span>
          <span class="issue-cat">${escHtml(e.category || '')}</span>
          ${e.line ? `<span class="issue-line">Line ${e.line}</span>` : ''}
        </div>
        <p class="issue-msg">${escHtml(e.message || e.issue || '')}</p>
        ${e.fix ? `<p class="issue-fix">💡 ${escHtml(e.fix)}</p>` : ''}
      </div>`).join('') : '<p class="empty-msg">✅ No issues found</p>';

    const listHtml = (items: any[], color: string, icon: string) =>
      items.length
        ? items.map((s: any) => `<li style="color:${color}">${icon} ${escHtml(typeof s === 'string' ? s : JSON.stringify(s))}</li>`).join('')
        : `<li class="empty-msg">None</li>`;

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevInspectAI Results</title>
<style>${BASE_CSS}</style></head><body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <span class="logo">⚡ DevInspectAI</span>
    <div class="header-right">
      <span class="lang-badge">${escHtml(lang)}</span>
      <span class="mode-badge">${escHtml(mode)}</span>
    </div>
  </div>

  <!-- Score card -->
  <div class="score-card">
    <div class="score-circle" style="border-color:${scoreColor(score)};color:${scoreColor(score)}">${score}</div>
    <div class="score-info">
      <div class="score-label">AI Score</div>
      <div class="filename">${escHtml(filename)}</div>
      ${mode === 'interviewer' ? `<div class="verdict-badge" style="background:${verdict === 'PASS' ? '#22c55e22' : '#ef444422'};color:${verdict === 'PASS' ? '#22c55e' : '#ef4444'};border-color:${verdict === 'PASS' ? '#22c55e44' : '#ef444444'}">${verdict}</div>` : ''}
      ${mode === 'developer' && prodReady !== undefined ? `<div class="verdict-badge" style="background:${prodReady ? '#22c55e22' : '#ef444422'};color:${prodReady ? '#22c55e' : '#ef4444'};border-color:${prodReady ? '#22c55e44' : '#ef444444'}">${prodReady ? '✅ Production Ready' : '⚠️ Not Production Ready'}</div>` : ''}
    </div>
    <div class="score-stats">
      <div class="stat"><span class="stat-val" style="color:#ef4444">${errors.length}</span><span class="stat-lbl">Issues</span></div>
      <div class="stat"><span class="stat-val" style="color:#f59e0b">${suggs.length}</span><span class="stat-lbl">Suggestions</span></div>
      <div class="stat"><span class="stat-val" style="color:#22c55e">${strengths.length}</span><span class="stat-lbl">Strengths</span></div>
    </div>
  </div>

  ${timeC || spaceC ? `
  <div class="complexity-row">
    ${timeC  ? `<div class="complexity-chip"><span class="chip-label">Time</span><span class="chip-val">${escHtml(timeC)}</span></div>`  : ''}
    ${spaceC ? `<div class="complexity-chip"><span class="chip-label">Space</span><span class="chip-val">${escHtml(spaceC)}</span></div>` : ''}
  </div>` : ''}

  <!-- AI Explanation -->
  ${explanation ? `
  <div class="section">
    <div class="section-title">🧠 AI Feedback</div>
    <div class="explanation">${escHtml(explanation)}</div>
  </div>` : ''}

  <!-- Issues -->
  <div class="section">
    <div class="section-title">🐛 Issues Found <span class="count-badge">${errors.length}</span></div>
    <div class="issues-list">${errorsHtml}</div>
  </div>

  <!-- Security -->
  ${secIssues.length ? `
  <div class="section">
    <div class="section-title">🔒 Security Issues <span class="count-badge" style="background:#ef444422;color:#ef4444">${secIssues.length}</span></div>
    <ul class="plain-list">${listHtml(secIssues, '#ef4444', '🔴')}</ul>
  </div>` : ''}

  <!-- Performance -->
  ${perfIssues.length ? `
  <div class="section">
    <div class="section-title">⚡ Performance Issues <span class="count-badge" style="background:#f59e0b22;color:#f59e0b">${perfIssues.length}</span></div>
    <ul class="plain-list">${listHtml(perfIssues, '#f59e0b', '🟡')}</ul>
  </div>` : ''}

  <!-- Suggestions -->
  ${suggs.length ? `
  <div class="section">
    <div class="section-title">💡 Suggestions <span class="count-badge" style="background:#6366f122;color:#6366f1">${suggs.length}</span></div>
    <ul class="plain-list">${listHtml(suggs, '#a5b4fc', '→')}</ul>
  </div>` : ''}

  <!-- Mistakes -->
  ${mistakes.length ? `
  <div class="section">
    <div class="section-title">⚠️ Mistakes</div>
    <ul class="plain-list">${listHtml(mistakes, '#fca5a5', '•')}</ul>
  </div>` : ''}

  <!-- Strengths & Weaknesses -->
  ${(strengths.length || weaknesses.length) ? `
  <div class="section two-col">
    ${strengths.length ? `
    <div>
      <div class="section-title" style="color:#22c55e">✅ Strengths</div>
      <ul class="plain-list">${listHtml(strengths, '#86efac', '✓')}</ul>
    </div>` : ''}
    ${weaknesses.length ? `
    <div>
      <div class="section-title" style="color:#ef4444">❌ Weaknesses</div>
      <ul class="plain-list">${listHtml(weaknesses, '#fca5a5', '✗')}</ul>
    </div>` : ''}
  </div>` : ''}

  <!-- Tips -->
  ${tips.length ? `
  <div class="section">
    <div class="section-title">📚 Learning Tips</div>
    <ul class="plain-list">${listHtml(tips, '#c4b5fd', '💡')}</ul>
  </div>` : ''}

  <!-- Corrected code -->
  ${r.correctedCode && r.correctedCode !== data?.code ? `
  <div class="section">
    <div class="section-title">✨ Suggested Refactor</div>
    <pre class="code-block">${escHtml(r.correctedCode)}</pre>
  </div>` : ''}

  <div class="footer">Analyzed by DevInspectAI · ${new Date().toLocaleTimeString()}</div>
</div>
</body></html>`;
  }
}

// ── Shared CSS ────────────────────────────────────────────────────────────────
const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0f0f13;
    color: #e2e8f0;
    font-size: 13px;
    line-height: 1.6;
  }
  .container { max-width: 680px; margin: 0 auto; padding: 20px 16px 40px; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ffffff12; }
  .logo { font-size: 15px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .header-right { display: flex; gap: 8px; align-items: center; }
  .mode-badge { background: #6366f122; color: #a5b4fc; border: 1px solid #6366f133; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .lang-badge { background: #22c55e22; color: #86efac; border: 1px solid #22c55e33; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

  /* Score card */
  .score-card { background: #ffffff08; border: 1px solid #ffffff12; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .score-circle { width: 72px; height: 72px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; flex-shrink: 0; }
  .score-info { flex: 1; }
  .score-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: .05em; }
  .filename { font-size: 13px; font-weight: 700; color: #e2e8f0; margin: 2px 0 6px; word-break: break-all; }
  .verdict-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid; }
  .score-stats { display: flex; flex-direction: column; gap: 6px; }
  .stat { display: flex; flex-direction: column; align-items: center; }
  .stat-val { font-size: 18px; font-weight: 900; }
  .stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }

  /* Complexity */
  .complexity-row { display: flex; gap: 10px; margin-bottom: 16px; }
  .complexity-chip { background: #ffffff08; border: 1px solid #ffffff12; border-radius: 10px; padding: 6px 14px; display: flex; gap: 8px; align-items: center; }
  .chip-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
  .chip-val { font-size: 12px; font-weight: 800; color: #a5b4fc; font-family: monospace; }

  /* Sections */
  .section { background: #ffffff06; border: 1px solid #ffffff0e; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; }
  .section.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .section-title { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .count-badge { background: #ffffff12; color: #94a3b8; padding: 1px 7px; border-radius: 10px; font-size: 10px; font-weight: 700; }

  /* Explanation */
  .explanation { font-size: 12.5px; color: #cbd5e1; line-height: 1.7; white-space: pre-wrap; }

  /* Issues */
  .issues-list { display: flex; flex-direction: column; gap: 8px; }
  .issue-item { background: #ffffff06; border: 1px solid #ffffff0e; border-radius: 10px; padding: 10px 12px; }
  .issue-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
  .sev-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .issue-sev { font-size: 10px; font-weight: 800; text-transform: uppercase; }
  .issue-cat { font-size: 10px; color: #64748b; background: #ffffff0a; padding: 1px 6px; border-radius: 6px; }
  .issue-line { font-size: 10px; color: #64748b; margin-left: auto; font-family: monospace; }
  .issue-msg { font-size: 12px; color: #cbd5e1; }
  .issue-fix { font-size: 11px; color: #86efac; margin-top: 4px; }

  /* Plain list */
  .plain-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
  .plain-list li { font-size: 12px; line-height: 1.5; padding-left: 4px; }
  .empty-msg { font-size: 12px; color: #475569; font-style: italic; }

  /* Code block */
  .code-block { background: #0d0d11; border: 1px solid #ffffff12; border-radius: 10px; padding: 14px; font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 11.5px; color: #a5b4fc; overflow-x: auto; white-space: pre; line-height: 1.6; max-height: 400px; overflow-y: auto; }

  /* Loading */
  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; }
  .spinner { width: 44px; height: 44px; border: 3px solid #ffffff15; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-title { font-size: 14px; font-weight: 700; color: #e2e8f0; text-align: center; }
  .loading-sub { font-size: 12px; color: #64748b; text-align: center; max-width: 300px; }

  /* Error */
  .error-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 12px; }
  .error-icon { font-size: 40px; }
  .error-title { font-size: 16px; font-weight: 800; color: #ef4444; }
  .error-msg { font-size: 12px; color: #94a3b8; text-align: center; max-width: 360px; }
  .tip-box { background: #ffffff08; border: 1px solid #ffffff12; border-radius: 10px; padding: 12px 16px; font-size: 11.5px; color: #94a3b8; line-height: 1.8; max-width: 400px; }
  .tip-box code { background: #ffffff12; padding: 1px 5px; border-radius: 4px; font-family: monospace; color: #a5b4fc; }

  /* Footer */
  .footer { text-align: center; font-size: 10px; color: #334155; margin-top: 24px; padding-top: 12px; border-top: 1px solid #ffffff08; }
`;
