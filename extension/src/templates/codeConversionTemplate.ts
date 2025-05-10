export function getCodeConversionContent(
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
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGenie Code Converter</title>
    <style>
        :root {
            --background-color: #1e1e1e;
            --foreground-color: #d4d4d4;
            --button-background: #0e639c;
            --button-hover: #1177bb;
            --button-active: #0d5c91;
            --button-foreground: #ffffff;
            --cancel-background: #6c757d;
            --cancel-hover: #5a6268;
            --cancel-active: #545b62;
            --editor-background: #252526;
            --border-color: #3e3e42;
            --heading-color: #569cd6;
            color-scheme: dark;
        }

        body {
            font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
            background-color: var(--background-color);
            color: var(--foreground-color);
            margin: 0;
            padding: 20px;
            line-height: 1.5;
        }

        h1, h2 {
            color: var(--heading-color);
            margin-top: 0;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 40px);
        }

        .code-container {
            display: flex;
            flex: 1;
            margin-bottom: 20px;
            gap: 20px;
            min-height: 0;
        }

        .code-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .panel-header {
            padding: 8px;
            background-color: var(--editor-background);
            border: 1px solid var(--border-color);
            border-bottom: none;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        .code-editor {
            flex: 1;
            border: 1px solid var(--border-color);
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
            overflow: auto;
            min-height: 0;
        }

        .code-area {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            background-color: var(--editor-background);
            color: var(--foreground-color);
            font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            padding: 12px;
            border: none;
            resize: none;
            outline: none;
        }

        .readonly {
            opacity: 0.8;
        }

        .button-container {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 16px;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        .copy-btn, .insert-btn {
            background-color: var(--button-background);
            color: var(--button-foreground);
        }

        .copy-btn:hover, .insert-btn:hover {
            background-color: var(--button-hover);
        }

        .copy-btn:active, .insert-btn:active {
            background-color: var(--button-active);
        }

        .cancel-btn {
            background-color: var(--cancel-background);
            color: var(--button-foreground);
        }

        .cancel-btn:hover {
            background-color: var(--cancel-hover);
        }

        .cancel-btn:active {
            background-color: var(--cancel-active);
        }

        pre {
            margin: 0;
            padding: 0;
            overflow: visible;
        }

        code {
            font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
        }

        /* Ensure the code editor doesn't wrap text */
        pre code {
            white-space: pre;
            overflow-x: auto;
        }
    </style>
    <!-- Include highlight.js for syntax highlighting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/vs2015.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <!-- Include languages -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/typescript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/java.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/c.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/cpp.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/csharp.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/ruby.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/go.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/rust.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/php.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/swift.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/kotlin.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/sql.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/yaml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/json.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/bash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/shell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/powershell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/scss.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dockerfile.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/haskell.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/dart.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>CodeGenie Code Converter</h1>
        <div class="code-container">
            <div class="code-panel">
                <div class="panel-header">
                    <h2>Source: ${sourceLanguage}</h2>
                </div>
                <div class="code-editor">
                    <pre><code id="sourceCodeBlock" class="${sourceLanguage}">${escapeHtml(sourceCode)}</code></pre>
                </div>
            </div>
            <div class="code-panel">
                <div class="panel-header">
                    <h2>Target: ${targetLanguage}</h2>
                </div>
                <div class="code-editor">
                    <textarea id="targetCodeArea" class="code-area">${escapeHtml(convertedCode)}</textarea>
                </div>
            </div>
        </div>
        <div class="button-container">
            <button class="copy-btn" id="copyButton">Copy</button>
            <button class="insert-btn" id="insertButton">Insert</button>
            <button class="cancel-btn" id="cancelButton">Cancel</button>
        </div>
    </div>

    <script>
        (function() {
            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            
            document.addEventListener('DOMContentLoaded', (event) => {
                hljs.highlightAll();
            });

            const vscode = acquireVsCodeApi();
            
            window.addEventListener('load', () => {
                vscode.postMessage({
                    command: 'openInDedicatedPanel',
                    viewColumn: 'Active'
                });
            });
            
            const targetCodeArea = document.getElementById('targetCodeArea');
            const copyButton = document.getElementById('copyButton');
            const insertButton = document.getElementById('insertButton');
            const cancelButton = document.getElementById('cancelButton');
            
            copyButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'copy',
                    code: targetCodeArea.value
                });
                
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1500);
            });
            
            insertButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'insert',
                    code: targetCodeArea.value
                });
            });
            
            cancelButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'cancel'
                });
            });
            
            targetCodeArea.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    const start = targetCodeArea.selectionStart;
                    const end = targetCodeArea.selectionEnd;
                    
                    targetCodeArea.value = 
                        targetCodeArea.value.substring(0, start) + 
                        "    " + 
                        targetCodeArea.value.substring(end);
                    
                    targetCodeArea.selectionStart = targetCodeArea.selectionEnd = start + 4;
                }
            });
            
            function resizeTextarea() {
                targetCodeArea.style.height = 'auto';
                targetCodeArea.style.height = targetCodeArea.scrollHeight + 'px';
            }
            
            window.addEventListener('load', () => {
                hljs.highlightAll();
                targetCodeArea.focus();
            });
        })();
    </script>
</body>
</html>`;
}