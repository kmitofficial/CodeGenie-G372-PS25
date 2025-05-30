// import { Webview, Uri } from "vscode";
// import { getNonce } from "../utils";

// export function getCodeConversionContent(
//     webview: Webview, 
//     extensionUri: Uri, 
//     sourceCode: string, 
//     convertedCode: string, 
//     sourceLanguage: string, 
//     targetLanguage: string
// ): string {
//     function escapeHtml(text: string): string {
//         return text
//             .replace(/&/g, "&amp;")
//             .replace(/</g, "&lt;")
//             .replace(/>/g, "&gt;")
//             .replace(/"/g, "&quot;")
//             .replace(/'/g, "&#039;");
//     }
    
//     const nonce = getNonce();
    
//     return `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; font-src https://fonts.googleapis.com https://fonts.gstatic.com;">
//     <title>CodeGenie Code Converter</title>
    
//     <!-- Import custom fonts -->
//     <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    
//     <!-- Include highlight.js for syntax highlighting -->
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    
//     <!-- Include line numbers plugin -->
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.8.0/highlightjs-line-numbers.min.js"></script>
    
//     <!-- Include languages -->
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/typescript.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/java.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/c.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/cpp.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/csharp.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/ruby.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/go.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/rust.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/php.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/swift.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/kotlin.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/sql.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/yaml.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/json.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/xml.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/bash.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/shell.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/powershell.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/scss.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dockerfile.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/haskell.min.js"></script>
//     <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dart.min.js"></script>
    
//     <style>
//         :root {
//             --vscode-editor-background: #1e1e1e;
//             --vscode-editor-foreground: #d4d4d4;
//             --vscode-button-background: #0e639c;
//             --vscode-button-hoverBackground: #1177bb;
//             --vscode-button-foreground: #ffffff;
//             --vscode-editorWidget-background: #252526;
//             --vscode-widget-shadow: #000000;
//             --vscode-focusBorder: #007fd4;
//             --vscode-tab-activeBackground: #1e1e1e;
//             --vscode-tab-inactiveBackground: #2d2d2d;
//         }

//         * {
//             box-sizing: border-box;
//             margin: 0;
//             padding: 0;
//         }

//         body {
//             font-family: 'JetBrains Mono', monospace;
//             background-color: var(--vscode-editor-background);
//             color: var(--vscode-editor-foreground);
//             margin: 0;
//             padding: 0;
//             line-height: 1.6;
//             height: 100vh;
//             overflow: hidden;
//         }

//         h1, h2 {
//             color: var(--vscode-editor-foreground);
//             font-weight: 500;
//         }

//         h1 {
//             font-size: 1.5rem;
//             margin-bottom: 0;
//         }

//         h2 {
//             font-size: 1.1rem;
//             margin: 0;
//         }

//         .container {
//             display: flex;
//             flex-direction: column;
//             height: 100vh;
//             padding: 20px;
//         }

//         .header {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             padding-bottom: 18px;
//             border-bottom: 1px solid var(--vscode-widget-shadow);
//             margin-bottom: 20px;
//         }

//         .logo {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//         }

//         .logo-icon {
//             font-size: 28px;
//         }

//         .code-container {
//             display: flex;
//             flex: 1;
//             gap: 20px;
//             min-height: 0;
//             margin-bottom: 20px;
//         }

//         .code-panel {
//             flex: 1;
//             display: flex;
//             flex-direction: column;
//             min-height: 0;
//             border-radius: 6px;
//             overflow: hidden;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
//             background-color: var(--vscode-editorWidget-background);
//             border: 1px solid var(--vscode-widget-shadow);
//         }

//         .panel-header {
//             padding: 14px 20px;
//             background-color: var(--vscode-tab-inactiveBackground);
//             border-bottom: 1px solid var(--vscode-widget-shadow);
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//         }

//         .language-badge {
//             background-color: var(--vscode-tab-inactiveBackground);
//             padding: 5px 12px;
//             border-radius: 20px;
//             font-size: 0.85rem;
//             font-weight: 500;
//         }

//         .code-editor {
//             flex: 1;
//             background-color: var(--vscode-editor-background);
//             overflow: auto;
//             position: relative;
//         }

//         .code-editor::-webkit-scrollbar {
//             width: 12px;
//             height: 12px;
//         }

//         .code-editor::-webkit-scrollbar-track {
//             background: var(--vscode-tab-inactiveBackground);
//             border-radius: 6px;
//         }

//         .code-editor::-webkit-scrollbar-thumb {
//             background-color: var(--vscode-button-background);
//             border-radius: 6px;
//             border: 2px solid var(--vscode-tab-inactiveBackground);
//         }

//         .code-editor::-webkit-scrollbar-thumb:hover {
//             background-color: var(--vscode-button-hoverBackground);
//         }

//         pre {
//             margin: 0;
//             padding: 10px 20px !important;
//             overflow: visible;
//             height: 100%;
//         }

//         code {
//             font-family: 'JetBrains Mono', monospace !important;
//             font-size: 14px !important;
//             line-height: 1.5 !important;
//             tab-size: 4;
//             -moz-tab-size: 4;
//         }

//         .code-area {
//             width: 100%;
//             height: 100%;
//             background-color: var(--vscode-editor-background);
//             color: var(--vscode-editor-foreground);
//             font-family: 'JetBrains Mono', monospace;
//             font-size: 14px;
//             line-height: 1.5;
//             padding: 10px;
//             border: none;
//             resize: none;
//             outline: none;
//             tab-size: 4;
//             -moz-tab-size: 4;
//         }

//         .button-container {
//             display: flex;
//             justify-content: flex-end;
//             gap: 14px;
//             padding-top: 18px;
//             border-top: 1px solid var(--vscode-widget-shadow);
//         }

//         button {
//             padding: 6px 12px;
//             background-color: var(--vscode-button-background);
//             color: var(--vscode-button-foreground);
//             border: none;
//             border-radius: 4px;
//             font-size: 13px;
//             cursor: pointer;
//             font-family: 'JetBrains Mono', monospace;
//         }

//         button:hover {
//             background-color: var(--vscode-button-hoverBackground);
//         }

//         .btn-reject {
//             background-color: transparent;
//             border: 1px solid var(--vscode-button-background);
//         }

//         .btn-reject:hover {
//             background-color: var(--vscode-tab-inactiveBackground);
//         }

//         /* Line numbers for source code */
//         .hljs-ln-numbers {
//             -webkit-touch-callout: none;
//             -webkit-user-select: none;
//             -khtml-user-select: none;
//             -moz-user-select: none;
//             -ms-user-select: none;
//             user-select: none;
//             text-align: right;
//             color: #858585;
//             border-right: 1px solid var(--vscode-widget-shadow);
//             vertical-align: top;
//             padding-right: 10px !important;
//             padding-left: 10px !important;
//             min-width: 40px;
//         }

//         .hljs-ln-code {
//             padding-left: 10px !important;
//         }
        
//         /* Custom styling for highlighted code */
//         .hljs {
//             background: transparent !important;
//             border-radius: 6px;
//         }
        
//         .hljs-comment, .hljs-quote {
//             font-style: italic;
//         }
        
//         /* Loading animation */
//         .loading {
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background-color: rgba(30, 30, 30, 0.8);
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             z-index: 100;
//             opacity: 0;
//             visibility: hidden;
//             transition: opacity 0.3s;
//         }
        
//         .loading.visible {
//             opacity: 1;
//             visibility: visible;
//         }
        
//         .spinner {
//             width: 50px;
//             height: 50px;
//             border: 4px solid rgba(255, 255, 255, 0.15);
//             border-radius: 50%;
//             border-top-color: #0e639c;
//             animation: spin 1s ease-in-out infinite;
//         }
        
//         @keyframes spin {
//             to { transform: rotate(360deg); }
//         }
        
//         /* Button icons */
//         .icon {
//             font-size: 16px;
//             line-height: 1;
//         }

//         /* Highlight current line when hovering */
//         .highlighted-line {
//             background-color: rgba(108, 205, 247, 0.15);
//             display: block;
//             width: 100%;
//             border-radius: 3px;
//         }

//         /* Enhance the code block appearance */
//         .token.operator, .token.entity, .token.url, 
//         .language-css .token.string, .style .token.string {
//             background: transparent;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <div class="logo">
//                 <span class="logo-icon">✨</span>
//                 <h1>CodeGenie Code Converter</h1>
//             </div>
//         </div>
//         <div class="code-container">
//             <div class="code-panel">
//                 <div class="panel-header">
//                     <h2>Source Code</h2>
//                     <span class="language-badge">${sourceLanguage}</span>
//                 </div>
//                 <div class="code-editor">
//                     <pre><code id="sourceCodeBlock" class="language-${mapLanguageId(sourceLanguage)}">${escapeHtml(sourceCode)}</code></pre>
//                 </div>
//             </div>
//             <div class="code-panel">
//                 <div class="panel-header">
//                     <h2>Converted Code</h2>
//                     <span class="language-badge">${targetLanguage}</span>
//                 </div>
//                 <div class="code-editor">
//                     <pre><code id="targetCodeBlock" class="language-${mapLanguageId(targetLanguage)}">${escapeHtml(convertedCode)}</code></pre>
//                     <textarea id="targetCodeArea" class="code-area" style="display: none;">${escapeHtml(convertedCode)}</textarea>
//                 </div>
//             </div>
//         </div>
//         <div class="button-container">
//             <button class="btn-reject" id="cancelButton">
//                 <span class="icon">❌</span> Cancel
//             </button>
//             <button id="copyButton">
//                 <span class="icon">📋</span> Copy
//             </button>
//             <button id="insertButton">
//                 <span class="icon">📥</span> Insert
//             </button>
//         </div>
//         <div class="loading" id="loadingOverlay">
//             <div class="spinner"></div>
//         </div>
//     </div>

//     <script nonce="${nonce}">
//         (function() {
//             const vscode = acquireVsCodeApi();
            
//             // Function to show loading overlay
//             function showLoading() {
//                 document.getElementById('loadingOverlay').classList.add('visible');
//             }
            
//             // Function to hide loading overlay
//             function hideLoading() {
//                 document.getElementById('loadingOverlay').classList.remove('visible');
//             }
            
//             // Wait for the page to fully load before applying syntax highlighting
//             window.addEventListener('load', () => {
//                 // First, tell VSCode to open in a new window instead of panel
//                 vscode.postMessage({
//                     command: 'openInNewWindow',
//                     viewType: 'codegenieConverter'
//                 });
                
//                 // Apply syntax highlighting
//                 try {
//                     hljs.configure({
//                         tabReplace: '    ', // 4 spaces for tabs
//                         languages: []       // Include all available languages
//                     });
                    
//                     // Apply highlighting to all code blocks
//                     document.querySelectorAll('pre code').forEach((block) => {
//                         hljs.highlightElement(block);
//                     });
                    
//                     // Apply line numbers if the plugin is available
//                     if (typeof hljs.lineNumbersBlock === 'function') {
//                         document.querySelectorAll('pre code').forEach((block) => {
//                             hljs.lineNumbersBlock(block, { singleLine: false });
//                         });
//                     }
                    
//                     // Add hover effect to lines
//                     setTimeout(() => {
//                         const codeLines = document.querySelectorAll('.hljs-ln-line');
//                         if (codeLines.length > 0) {
//                             codeLines.forEach(line => {
//                                 line.addEventListener('mouseenter', () => {
//                                     line.classList.add('highlighted-line');
//                                 });
//                                 line.addEventListener('mouseleave', () => {
//                                     line.classList.remove('highlighted-line');
//                                 });
//                             });
//                         }
//                     }, 100);
//                 } catch (error) {
//                     console.error('Error applying syntax highlighting:', error);
//                     // Fallback to basic display if highlighting fails
//                 }
                
//                 // Store the original content for the textarea
//                 const targetCodeArea = document.getElementById('targetCodeArea');
//                 const targetCodeBlock = document.getElementById('targetCodeBlock');
//                 targetCodeArea.value = targetCodeBlock.textContent;
                
//                 hideLoading(); // Hide loading indicator once everything is ready
//             });
            
//             const copyButton = document.getElementById('copyButton');
//             const insertButton = document.getElementById('insertButton');
//             const cancelButton = document.getElementById('cancelButton');
//             const targetCodeArea = document.getElementById('targetCodeArea');
            
//             // Copy button functionality
//             copyButton.addEventListener('click', () => {
//                 showLoading();
                
//                 vscode.postMessage({
//                     command: 'copy',
//                     code: targetCodeArea.value
//                 });
                
//                 const originalText = copyButton.innerHTML;
//                 copyButton.innerHTML = '<span class="icon">✅</span> Copied!';
                
//                 setTimeout(() => {
//                     copyButton.innerHTML = originalText;
//                     hideLoading();
//                 }, 1000);
//             });
            
//             // Insert button functionality
//             insertButton.addEventListener('click', () => {
//                 showLoading();
                
//                 vscode.postMessage({
//                     command: 'insert',
//                     code: targetCodeArea.value
//                 });
                
//                 setTimeout(hideLoading, 500);
//             });
            
//             // Cancel button functionality
//             cancelButton.addEventListener('click', () => {
//                 vscode.postMessage({
//                     command: 'cancel'
//                 });
//             });
            
//             // Handle keyboard shortcuts
//             document.addEventListener('keydown', (e) => {
//                 // Ctrl/Cmd+C for copy
//                 if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
//                     copyButton.click();
//                 }
                
//                 // Ctrl/Cmd+Enter for insert
//                 if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
//                     insertButton.click();
//                 }
                
//                 // Escape for cancel
//                 if (e.key === 'Escape') {
//                     cancelButton.click();
//                 }
//             });
//         })();
//     </script>
// </body>
// </html>`;
// }

// export function mapLanguageId(languageId: string): string {
//     const languageMap: { [key: string]: string } = {
//         'typescript': 'TypeScript',
//         'javascript': 'JavaScript',
//         'python': 'Python',
//         'java': 'Java',
//         'csharp': 'C#',
//         'cpp': 'C++',
//         'c': 'C',
//         'go': 'Go',
//         'ruby': 'Ruby',
//         'php': 'PHP',
//         'rust': 'Rust',
//         'swift': 'Swift',
//         'objective-c': 'Objective-C',
//         'html': 'HTML',
//         'css': 'CSS',
//         'scss': 'SCSS',
//         'less': 'Less',
//         'json': 'JSON',
//         'xml': 'XML',
//         'yaml': 'YAML',
//         'markdown': 'Markdown',
//         'powershell': 'PowerShell',
//         'shell': 'Shell',
//         'sql': 'SQL',
//         'plaintext': 'Plain Text',
//         'vue': 'Vue',
//         'dart': 'Dart',
//         'kotlin': 'Kotlin',
//         'scala': 'Scala',
//         'haskell': 'Haskell'
//     };
    
//     return languageMap[languageId.toLowerCase()] || 'plaintext';
// }






































import { Webview, Uri } from "vscode";
import { getNonce } from "../utils";

export function getCodeConversionContent(
    webview: Webview,
    extensionUri: Uri,
    sourceCode: string,
    convertedCode: string,
    sourceLanguage: string,
    targetLanguage: string
): string {
    function escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; font-src https://fonts.googleapis.com https://fonts.gstatic.com;">
    <title>CodeGenie Code Converter</title>

    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>

    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.8.0/highlightjs-line-numbers.min.js"></script>

    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/typescript.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/java.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/c.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/cpp.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/csharp.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/ruby.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/go.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/rust.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/php.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/swift.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/kotlin.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/sql.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/yaml.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/json.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/xml.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/bash.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/shell.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/powershell.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/scss.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dockerfile.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/haskell.min.js"></script>
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dart.min.js"></script>

    <style>
        :root {
            --vscode-editor-background: #1e1e1e;
            --vscode-editor-foreground: #d4d4d4;
            --vscode-button-background: #0e639c;
            --vscode-button-hoverBackground: #1177bb;
            --vscode-button-foreground: #ffffff;
            --vscode-editorWidget-background: #252526;
            --vscode-widget-shadow: #000000;
            --vscode-focusBorder: #007fd4;
            --vscode-tab-activeBackground: #1e1e1e;
            --vscode-tab-inactiveBackground: #2d2d2d;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'JetBrains Mono', monospace;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            height: 100vh;
            overflow: hidden;
        }

        h1, h2 {
            color: var(--vscode-editor-foreground);
            font-weight: 500;
        }

        h1 {
            font-size: 1.5rem;
            margin-bottom: 0;
        }

        h2 {
            font-size: 1.1rem;
            margin: 0;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 20px;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 18px;
            border-bottom: 1px solid var(--vscode-widget-shadow);
            margin-bottom: 20px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            font-size: 28px;
        }

        .code-container {
            display: flex;
            flex: 1;
            gap: 20px;
            min-height: 0;
            margin-bottom: 20px;
        }

        .code-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
            background-color: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-widget-shadow);
        }

        .panel-header {
            padding: 14px 20px;
            background-color: var(--vscode-tab-inactiveBackground);
            border-bottom: 1px solid var(--vscode-widget-shadow);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .language-badge {
            background-color: var(--vscode-tab-inactiveBackground);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .code-editor {
            flex: 1;
            background-color: var(--vscode-editor-background);
            overflow: auto;
            position: relative;
        }

        .code-editor::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }

        .code-editor::-webkit-scrollbar-track {
            background: var(--vscode-tab-inactiveBackground);
            border-radius: 6px;
        }

        .code-editor::-webkit-scrollbar-thumb {
            background-color: var(--vscode-button-background);
            border-radius: 6px;
            border: 2px solid var(--vscode-tab-inactiveBackground);
        }

        .code-editor::-webkit-scrollbar-thumb:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        pre {
            margin: 0;
            padding: 10px 20px !important;
            overflow: visible;
            height: 100%;
        }

        code {
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            tab-size: 4;
            -moz-tab-size: 4;
        }

        .code-area {
            width: 100%;
            height: 100%;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            padding: 10px;
            border: none;
            resize: none;
            outline: none;
            tab-size: 4;
            -moz-tab-size: 4;
        }

        .button-container {
            display: flex;
            justify-content: flex-end;
            gap: 14px;
            padding-top: 18px;
            border-top: 1px solid var(--vscode-widget-shadow);
        }

        button {
            padding: 6px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            font-family: 'JetBrains Mono', monospace;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-reject {
            background-color: transparent;
            border: 1px solid var(--vscode-button-background);
        }

        .btn-reject:hover {
            background-color: var(--vscode-tab-inactiveBackground);
        }

        /* Line numbers for source code */
        .hljs-ln-numbers {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            text-align: right;
            color: #858585;
            border-right: 1px solid var(--vscode-widget-shadow);
            vertical-align: top;
            padding-right: 10px !important;
            padding-left: 10px !important;
            min-width: 40px;
        }

        .hljs-ln-code {
            padding-left: 10px !important;
        }

        /* Custom styling for highlighted code */
        .hljs {
            background: transparent !important;
            border-radius: 6px;
        }

        .hljs-comment, .hljs-quote {
            font-style: italic;
        }

        /* Loading animation */
        .loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(30, 30, 30, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s;
        }

        .loading.visible {
            opacity: 1;
            visibility: visible;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            border-top-color: #0e639c;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Button icons */
        .icon {
            font-size: 16px;
            line-height: 1;
        }

        /* Highlight current line when hovering */
        .highlighted-line {
            background-color: rgba(108, 205, 247, 0.15);
            display: block;
            width: 100%;
            border-radius: 3px;
        }

        /* Enhance the code block appearance */
        .token.operator, .token.entity, .token.url,
        .language-css .token.string, .style .token.string {
            background: transparent;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">✨</span>
                <h1>CodeGenie Code Converter</h1>
            </div>
        </div>
        <div class="code-container">
            <div class="code-panel">
                <div class="panel-header">
                    <h2>Source Code</h2>
                    <span class="language-badge">${sourceLanguage}</span>
                </div>
                <div class="code-editor">
                    <pre><code id="sourceCodeBlock" class="language-${mapLanguageId(sourceLanguage)}">${escapeHtml(sourceCode)}</code></pre>
                </div>
            </div>
            <div class="code-panel">
                <div class="panel-header">
                    <h2>Converted Code</h2>
                    <span class="language-badge">${targetLanguage}</span>
                </div>
                <div class="code-editor">
                    <pre><code id="targetCodeBlock" class="language-${mapLanguageId(targetLanguage)}">${escapeHtml(convertedCode)}</code></pre>
                    <textarea id="targetCodeArea" class="code-area" style="display: none;">${escapeHtml(convertedCode)}</textarea>
                </div>
            </div>
        </div>
        <div class="button-container">
            <button class="btn-reject" id="cancelButton">
                <span class="icon">❌</span> Cancel
            </button>
            <button id="copyButton">
                <span class="icon">📋</span> Copy
            </button>
            <button id="insertButton">
                <span class="icon">📥</span> Insert
            </button>
        </div>
        <div class="loading" id="loadingOverlay">
            <div class="spinner"></div>
        </div>
    </div>

    <script nonce="${nonce}">
        (function() {
            const vscode = acquireVsCodeApi();

            // Function to show loading overlay
            function showLoading() {
                document.getElementById('loadingOverlay').classList.add('visible');
            }

            // Function to hide loading overlay
            function hideLoading() {
                document.getElementById('loadingOverlay').classList.remove('visible');
            }

            // Wait for the page to fully load before applying syntax highlighting
            window.addEventListener('load', () => {
                // First, tell VSCode to open in a new window instead of panel
                vscode.postMessage({
                    command: 'openInNewWindow',
                    viewType: 'codegenieConverter'
                });

                // Apply syntax highlighting
                try {
                    hljs.configure({
                        tabReplace: '    ', // 4 spaces for tabs
                        languages: []       // Include all available languages
                    });

                    // Apply highlighting to all code blocks
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });

                    // Apply line numbers if the plugin is available
                    if (typeof hljs.lineNumbersBlock === 'function') {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.lineNumbersBlock(block, { singleLine: false });
                        });
                    }

                    // Add hover effect to lines
                    setTimeout(() => {
                        const codeLines = document.querySelectorAll('.hljs-ln-line');
                        if (codeLines.length > 0) {
                            codeLines.forEach(line => {
                                line.addEventListener('mouseenter', () => {
                                    line.classList.add('highlighted-line');
                                });
                                line.addEventListener('mouseleave', () => {
                                    line.classList.remove('highlighted-line');
                                });
                            });
                        }
                    }, 100);
                } catch (error) {
                    console.error('Error applying syntax highlighting:', error);
                    // Fallback to basic display if highlighting fails
                }

                // Store the original content for the textarea
                const targetCodeArea = document.getElementById('targetCodeArea');
                const targetCodeBlock = document.getElementById('targetCodeBlock');
                targetCodeArea.value = targetCodeBlock.textContent;

                hideLoading(); // Hide loading indicator once everything is ready
            });

            const copyButton = document.getElementById('copyButton');
            const insertButton = document.getElementById('insertButton');
            const cancelButton = document.getElementById('cancelButton');
            const targetCodeArea = document.getElementById('targetCodeArea');

            // Copy button functionality
            copyButton.addEventListener('click', () => {
                showLoading();

                vscode.postMessage({
                    command: 'copy',
                    code: targetCodeArea.value
                });

                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<span class="icon">✅</span> Copied!';

                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                    hideLoading();
                }, 1000);
            });

            // Insert button functionality
            insertButton.addEventListener('click', () => {
                showLoading();

                vscode.postMessage({
                    command: 'insert',
                    code: targetCodeArea.value
                });

                setTimeout(hideLoading, 500);
            });

            // Cancel button functionality
            cancelButton.addEventListener('click', () => {
                // This sends the 'cancel' command to the VS Code extension
                // The extension is responsible for closing the webview panel
                vscode.postMessage({
                    command: 'cancel'
                });
            });

            // Handle keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd+C for copy
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    copyButton.click();
                }

                // Ctrl/Cmd+Enter for insert
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    insertButton.click();
                }

                // Escape for cancel
                if (e.key === 'Escape') {
                    cancelButton.click();
                }
            });
        })();
    </script>
</body>
</html>`;
}

export function mapLanguageId(languageId: string): string {
    const languageMap: { [key: string]: string } = {
        'typescript': 'TypeScript',
        'javascript': 'JavaScript',
        'python': 'Python',
        'java': 'Java',
        'csharp': 'C#',
        'cpp': 'C++',
        'c': 'C',
        'go': 'Go',
        'ruby': 'Ruby',
        'php': 'PHP',
        'rust': 'Rust',
        'swift': 'Swift',
        'objective-c': 'Objective-C',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'less': 'Less',
        'json': 'JSON',
        'xml': 'XML',
        'yaml': 'YAML',
        'markdown': 'Markdown',
        'powershell': 'PowerShell',
        'shell': 'Shell',
        'sql': 'SQL',
        'plaintext': 'Plain Text',
        'vue': 'Vue',
        'dart': 'Dart',
        'kotlin': 'Kotlin',
        'scala': 'Scala',
        'haskell': 'Haskell'
    };

    return languageMap[languageId.toLowerCase()] || 'plaintext';
}
