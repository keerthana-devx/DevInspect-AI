# DevInspectAI VS Code Extension

AI-powered code review directly inside VS Code — bug detection, security analysis, performance optimization, and more.

## Quick Setup

### 1. Generate Token
1. Go to [DevInspectAI](http://localhost:5173) → **Settings → VS Code**
2. Click **Generate Token**
3. Copy the token

### 2. Configure settings.json
Press `Ctrl+Shift+P` → *Open User Settings (JSON)* and add:

```json
{
  "devinspectai.apiToken": "YOUR_TOKEN_HERE",
  "devinspectai.apiUrl":   "http://localhost:5000",
  "devinspectai.mode":     "developer"
}
```

### 3. Analyze Code
- **Right-click** any file → **Analyze with DevInspectAI**
- Or press `Ctrl+Shift+D`
- Or `Ctrl+Shift+P` → *DevInspectAI: Analyze File*

## Commands

| Command | Shortcut | Description |
|---|---|---|
| Analyze File | `Ctrl+Shift+D` | Analyze entire active file |
| Analyze Selection | — | Analyze selected code only |
| Verify Connection | — | Test token and backend connection |
| Set Analysis Mode | — | Switch between developer/student/interviewer |

## Settings

| Setting | Default | Description |
|---|---|---|
| `devinspectai.apiToken` | `""` | Your extension token |
| `devinspectai.apiUrl` | `http://localhost:5000` | Backend URL |
| `devinspectai.mode` | `developer` | Analysis mode |
| `devinspectai.autoAnalyze` | `false` | Auto-analyze on save |
| `devinspectai.showStatusBar` | `true` | Show status bar item |

## Analysis Modes

- **Developer** — Production-grade review: security, performance, architecture, SOLID principles
- **Student** — Beginner-friendly explanations with learning tips and step-by-step guidance  
- **Interviewer** — FAANG-style evaluation with PASS/FAIL verdict and scoring

## Build from Source

```bash
cd vscode-extension
npm install
npm run compile
# Package as .vsix:
npm run package
```

Install the `.vsix`:
```
code --install-extension devinspectai-2.0.0.vsix
```
