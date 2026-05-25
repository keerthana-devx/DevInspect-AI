import * as vscode from 'vscode';
import { analyzeCode } from './apiClient';
import { ResultsPanel } from './resultsPanel';

let statusBarItem: vscode.StatusBarItem;
let currentPanel: ResultsPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  // ── Status bar ────────────────────────────────────────────────────────────
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'devinspectai.openPanel';
  updateStatusBar('idle');
  const cfg = vscode.workspace.getConfiguration('devinspectai');
  if (cfg.get<boolean>('showStatusBar', true)) statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // ── Commands ──────────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('devinspectai.analyzeFile', () => runAnalysis(context, 'file')),
    vscode.commands.registerCommand('devinspectai.analyzeSelection', () => runAnalysis(context, 'selection')),
    vscode.commands.registerCommand('devinspectai.verifyToken', () => verifyConnection()),
    vscode.commands.registerCommand('devinspectai.setMode', () => pickMode()),
    vscode.commands.registerCommand('devinspectai.openPanel', () => {
      if (currentPanel) currentPanel.reveal();
    }),
  );

  // ── Auto-analyze on save ──────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      const config = vscode.workspace.getConfiguration('devinspectai');
      if (config.get<boolean>('autoAnalyze') && doc === vscode.window.activeTextEditor?.document) {
        await runAnalysis(context, 'file');
      }
    })
  );

  // ── Config change: show/hide status bar ───────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('devinspectai.showStatusBar')) {
        const show = vscode.workspace.getConfiguration('devinspectai').get<boolean>('showStatusBar', true);
        show ? statusBarItem.show() : statusBarItem.hide();
      }
    })
  );

  // ── Verify token on startup (silent) ─────────────────────────────────────
  silentVerify();
}

// ── Core analysis runner ──────────────────────────────────────────────────────
async function runAnalysis(context: vscode.ExtensionContext, scope: 'file' | 'selection') {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('DevInspectAI: No active editor found.');
    return;
  }

  const config   = vscode.workspace.getConfiguration('devinspectai');
  const token    = config.get<string>('apiToken', '').trim();
  const apiUrl   = config.get<string>('apiUrl', 'http://localhost:5000').trim();
  const mode     = config.get<string>('mode', 'developer');

  if (!token) {
    const action = await vscode.window.showErrorMessage(
      'DevInspectAI: No API token configured.',
      'Open Settings'
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'devinspectai.apiToken');
    }
    return;
  }

  const code = scope === 'selection' && !editor.selection.isEmpty
    ? editor.document.getText(editor.selection)
    : editor.document.getText();

  if (!code.trim()) {
    vscode.window.showWarningMessage('DevInspectAI: File is empty.');
    return;
  }

  const filename = editor.document.fileName.split(/[\\/]/).pop() || '';

  updateStatusBar('analyzing');

  // Show or reuse panel
  if (!currentPanel || currentPanel.isDisposed) {
    currentPanel = new ResultsPanel(context.extensionUri);
  }
  currentPanel.showLoading(filename, mode);

  try {
    const result = await analyzeCode({ token, apiUrl, code, mode, filename });
    currentPanel.showResults(result, filename, mode);
    updateStatusBar('done', result.aiScore);

    // Inline diagnostics
    applyDiagnostics(editor.document, result.result?.errors || []);

    vscode.window.showInformationMessage(
      `DevInspectAI: Analysis complete — Score ${result.aiScore}/100`
    );
  } catch (err: any) {
    const msg = err?.message || 'Analysis failed';
    currentPanel.showError(msg);
    updateStatusBar('error');
    vscode.window.showErrorMessage(`DevInspectAI: ${msg}`);
  }
}

// ── Diagnostics (inline squiggles) ───────────────────────────────────────────
const diagnosticCollection = vscode.languages.createDiagnosticCollection('devinspectai');

function applyDiagnostics(document: vscode.TextDocument, errors: any[]) {
  diagnosticCollection.clear();
  if (!errors?.length) return;

  const diagnostics: vscode.Diagnostic[] = errors.map((e) => {
    const lineNum = Math.max(0, (e.line || 1) - 1);
    const line    = document.lineAt(Math.min(lineNum, document.lineCount - 1));
    const range   = new vscode.Range(line.range.start, line.range.end);

    const sev = String(e.severity || '').toLowerCase();
    const severity =
      sev.includes('critical') || sev.includes('high') ? vscode.DiagnosticSeverity.Error :
      sev.includes('medium')                           ? vscode.DiagnosticSeverity.Warning :
                                                         vscode.DiagnosticSeverity.Information;

    const diag = new vscode.Diagnostic(range, `[DevInspectAI] ${e.message || e.issue || 'Issue found'}`, severity);
    diag.source = 'DevInspectAI';
    diag.code   = e.category || 'review';
    return diag;
  });

  diagnosticCollection.set(document.uri, diagnostics);
}

// ── Status bar helpers ────────────────────────────────────────────────────────
function updateStatusBar(state: 'idle' | 'analyzing' | 'done' | 'error' | 'connected', score?: number) {
  switch (state) {
    case 'idle':
      statusBarItem.text        = '$(search) DevInspectAI';
      statusBarItem.tooltip     = 'Click to open results panel';
      statusBarItem.backgroundColor = undefined;
      break;
    case 'analyzing':
      statusBarItem.text        = '$(sync~spin) Analyzing...';
      statusBarItem.tooltip     = 'DevInspectAI is analyzing your code';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      break;
    case 'done':
      statusBarItem.text        = `$(check) DevInspectAI ${score !== undefined ? `${score}/100` : ''}`;
      statusBarItem.tooltip     = `Last analysis score: ${score}/100`;
      statusBarItem.backgroundColor = score !== undefined && score >= 70
        ? new vscode.ThemeColor('statusBarItem.activeBackground')
        : new vscode.ThemeColor('statusBarItem.errorBackground');
      break;
    case 'error':
      statusBarItem.text        = '$(error) DevInspectAI';
      statusBarItem.tooltip     = 'Analysis failed — check token and connection';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      break;
    case 'connected':
      statusBarItem.text        = '$(check) DevInspectAI ✅';
      statusBarItem.tooltip     = 'Connected to DevInspectAI';
      statusBarItem.backgroundColor = undefined;
      break;
  }
}

// ── Verify token command ──────────────────────────────────────────────────────
async function verifyConnection() {
  const config = vscode.workspace.getConfiguration('devinspectai');
  const token  = config.get<string>('apiToken', '').trim();
  const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000').trim();

  if (!token) {
    vscode.window.showErrorMessage('DevInspectAI: No token configured. Add devinspectai.apiToken to settings.json');
    return;
  }

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'DevInspectAI: Verifying connection...' },
    async () => {
      try {
        const axios = require('axios');
        const res   = await axios.post(`${apiUrl}/api/extension/verify-token`,
          { token },
          { headers: { 'X-Extension-Token': token, 'Content-Type': 'application/json' }, timeout: 10000 }
        );
        if (res.data?.success) {
          updateStatusBar('connected');
          vscode.window.showInformationMessage(`DevInspectAI: ✅ ${res.data.message || 'Connected successfully!'}`);
        } else {
          updateStatusBar('error');
          vscode.window.showErrorMessage(`DevInspectAI: ❌ ${res.data?.message || 'Token invalid'}`);
        }
      } catch (err: any) {
        updateStatusBar('error');
        vscode.window.showErrorMessage(`DevInspectAI: Connection failed — ${err?.response?.data?.message || err.message}`);
      }
    }
  );
}

// ── Silent startup verify ─────────────────────────────────────────────────────
async function silentVerify() {
  const config = vscode.workspace.getConfiguration('devinspectai');
  const token  = config.get<string>('apiToken', '').trim();
  const apiUrl = config.get<string>('apiUrl', 'http://localhost:5000').trim();
  if (!token) return;
  try {
    const axios = require('axios');
    const res   = await axios.post(`${apiUrl}/api/extension/verify-token`,
      { token },
      { headers: { 'X-Extension-Token': token }, timeout: 8000 }
    );
    if (res.data?.success) updateStatusBar('connected');
  } catch { /* silent */ }
}

// ── Mode picker ───────────────────────────────────────────────────────────────
async function pickMode() {
  const picked = await vscode.window.showQuickPick(
    [
      { label: '$(tools) Developer', description: 'Production-grade review: security, performance, architecture', value: 'developer' },
      { label: '$(mortar-board) Student', description: 'Beginner-friendly explanations and learning tips', value: 'student' },
      { label: '$(person) Interviewer', description: 'FAANG-style interview evaluation with scoring', value: 'interviewer' },
    ],
    { placeHolder: 'Select DevInspectAI analysis mode' }
  );
  if (picked) {
    await vscode.workspace.getConfiguration('devinspectai').update('mode', (picked as any).value, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`DevInspectAI: Mode set to ${(picked as any).value}`);
  }
}

export function deactivate() {
  diagnosticCollection.dispose();
  statusBarItem.dispose();
}
