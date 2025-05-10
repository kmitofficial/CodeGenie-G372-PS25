export function getWebviewContent(code: string, languageId: string): string {
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  const originalCode = code;

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGenie Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/${mapLanguageId(languageId)}.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--vscode-foreground);
        background-color: var(--vscode-editor-background);
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .header {
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--vscode-editor-widget-background);
        border-bottom: 1px solid var(--vscode-widget-shadow);
      }
      .title {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
      }
      .title span {
        margin-left: 8px;
      }
      .actions {
        display: flex;
        gap: 10px;
      }
      .code-container {
        flex-grow: 1;
        overflow: auto;
        padding: 10px 0;
      }
      .editor {
        position: relative;
        height: calc(100% - 20px);
        width: 100%;
        box-sizing: border-box;
      }
      textarea {
        width: 100%;
        height: 100%;
        resize: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 10px;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        border: none;
        outline: none;
        tab-size: 2;
      }
      pre {
        margin: 0;
        width: 100%;
        box-sizing: border-box;
      }
      pre code {
        padding: 10px 20px !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 14px;
        line-height: 1.5;
        tab-size: 2;
      }
      .hljs {
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      }
      button {
        padding: 6px 12px;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
      }
      button:hover {
        background-color: var(--vscode-button-hoverBackground);
      }
      .btn-reject {
        background-color: transparent;
        border: 1px solid var(--vscode-button-background);
      }
      .btn-reject:hover {
        background-color: var(--vscode-button-secondaryHoverBackground);
      }
      .tabs {
        display: flex;
        background-color: var(--vscode-tab-inactiveBackground);
        padding: 0 20px;
        border-bottom: 1px solid var(--vscode-widget-shadow);
      }
      .tab {
        padding: 8px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      .tab.active {
        background-color: var(--vscode-tab-activeBackground);
        border-bottom: 2px solid var(--vscode-focusBorder);
        font-weight: bold;
      }
      .tab-content {
        display: none;
        height: calc(100% - 38px);
        width: 100%;
      }
      .tab-content.active {
        display: block !important;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">
        <span>✨ CodeGenie Preview</span>
      </div>
      <div class="actions">
        <button class="btn-reject" id="reject-btn">Reject</button>
        <button id="accept-btn">Accept & Insert</button>
      </div>
    </div>
    
    <div class="tabs">
      <div class="tab active" data-tab="preview">Preview</div>
      <div class="tab" data-tab="edit">Edit</div>
    </div>
    
    <div class="code-container">
      <div class="tab-content active" id="preview-tab">
        <pre><code class="language-${mapLanguageId(languageId)}">${escapeHtml(code)}</code></pre>
      </div>
      <div class="tab-content" id="edit-tab">
        <div class="editor">
          <textarea id="code-editor">${escapeHtml(code)}</textarea>
        </div>
      </div>
    </div>
    
    <script>
      (function() {
        const vscode = acquireVsCodeApi();
        const codeEditor = document.getElementById('code-editor');
        
        hljs.highlightAll();

        document.querySelectorAll('.tab').forEach(tab => {
          tab.addEventListener('click', function() {
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
              content.classList.remove('active');
            });
            
            const tabContent = document.getElementById(tabId + '-tab');
            if (tabContent) {
              tabContent.classList.add('active');
              console.log('Activated tab:', tabId);
            } else {
              console.error('Tab content not found:', tabId + '-tab');
            }
          });
        });
        
        document.getElementById('accept-btn').addEventListener('click', function() {
          console.log('Accept button clicked');
          
          const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
          console.log('Active tab:', activeTab);
          
          let finalCode;
          if (activeTab === 'edit') {
            finalCode = codeEditor.value;
            console.log('Using edited code');
          } else {
            finalCode = ${JSON.stringify(originalCode)};
            console.log('Using original code');
          }
          
          vscode.postMessage({
            command: 'accept',
            code: finalCode
          });
        });
        
        document.getElementById('reject-btn').addEventListener('click', function() {
          console.log('Reject button clicked');
          try {
            vscode.postMessage({
              command: 'reject'
            });
          } catch (e) {
            console.error('Failed to send reject message:', e);
          }
        });
      }());
    </script>
    <script>
      try {
        acquireVsCodeApi();
        console.log('VS Code API initialized successfully');
      } catch (e) {
        console.error('VS Code API initialization failed:', e);
      }
      
      window.addEventListener('load', function() {
        console.log('Window loaded, applying syntax highlighting');
        hljs.highlightAll();
        
        const tabs = document.querySelectorAll('.tab');
        console.log('Found ' + tabs.length + ' tabs');
        
        const acceptBtn = document.getElementById('accept-btn');
        const rejectBtn = document.getElementById('reject-btn');
        
        if (acceptBtn) console.log('Accept button found');
        if (rejectBtn) console.log('Reject button found');
      });
    </script>
  </body>
  </html>`;
}

function mapLanguageId(languageId: string): string {
  const languageMap: { [key: string]: string } = {
    'typescript': 'typescript',
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'csharp': 'csharp',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'ruby': 'ruby',
    'php': 'php',
    'rust': 'rust',
    'swift': 'swift',
    'objective-c': 'objectivec',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'markdown': 'markdown',
    'powershell': 'powershell',
    'shell': 'bash',
    'sql': 'sql',
    'plaintext': 'plaintext',
    'vue': 'vue',
    'dart': 'dart',
    'kotlin': 'kotlin',
    'scala': 'scala',
    'haskell': 'haskell'
  };
  
  return languageMap[languageId] || 'plaintext';
}