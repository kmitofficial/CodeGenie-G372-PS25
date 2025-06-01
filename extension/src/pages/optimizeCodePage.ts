export function getOptimizationResults(optimization: any, languageId: string): string {
    const { optimizations, summary } = optimization;
    
    // Create the HTML for optimization results
    let optimizationsHtml = '';
    
    if (optimizations && optimizations.length > 0) {
        optimizationsHtml = optimizations.map((opt: any, index: number) => {
            return `
                <div class="optimization-item">
                    <h3>Optimization #${index + 1} - ${opt.type} (Line ${opt.line})</h3>
                    <p class="description">${escapeHtml(opt.description)}</p>
                    <div class="code-comparison">
                        <div class="code-section">
                            <h4>Original Code:</h4>
                            <pre class="code-block language-${languageId}">${escapeHtml(opt.original)}</pre>
                        </div>
                        <div class="code-section">
                            <h4>Optimized Code:</h4>
                            <pre class="code-block language-${languageId}">${escapeHtml(opt.optimized)}</pre>
                        </div>
                    </div>
                    <button class="apply-btn" data-line="${opt.line}" data-code="${escapeHtml(opt.optimized)}">Apply This Optimization</button>
                </div>
            `;
        }).join('');
    } else {
        optimizationsHtml = `
            <div class="no-optimizations">
                <p>No optimization suggestions available for this code.</p>
            </div>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Optimization Results</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                    line-height: 1.5;
                }
                .summary {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 5px;
                }
                .optimization-item {
                    margin-bottom: 30px;
                    padding: 15px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                }
                .description {
                    margin-bottom: 10px;
                    font-style: italic;
                }
                .code-comparison {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                @media (min-width: 768px) {
                    .code-comparison {
                        flex-direction: row;
                    }
                }
                .code-section {
                    flex: 1;
                }
                .code-block {
                    padding: 10px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 3px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                }
                .apply-btn {
                    margin-top: 10px;
                    padding: 5px 10px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .apply-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .apply-all-btn {
                    margin-top: 20px;
                    padding: 8px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .apply-all-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .no-optimizations {
                    padding: 20px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 5px;
                    text-align: center;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
            <!-- Add language-specific highlighting if needed -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/${getHighlightLanguage(languageId)}.min.js"></script>
        </head>
        <body>
            <h1>Code Optimization Results</h1>
            
            <div class="summary">
                <h2>Summary</h2>
                <p>${escapeHtml(summary)}</p>
            </div>
            
            <h2>Optimizations (${optimizations?.length || 0})</h2>
            
            ${optimizationsHtml}
            
            ${optimizations && optimizations.length > 0 ? 
                `<button class="apply-all-btn">Apply All Optimizations</button>` : ''}
            
            <script>
                // Initialize syntax highlighting
                document.addEventListener('DOMContentLoaded', (event) => {
                    document.querySelectorAll('pre.code-block').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                });
                
                // Handle apply button clicks
                const vscode = acquireVsCodeApi();
                
                document.querySelectorAll('.apply-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const line = parseInt(button.getAttribute('data-line'));
                        const code = button.getAttribute('data-code');
                        
                        vscode.postMessage({
                            command: 'applyOptimization',
                            line: line,
                            code: code
                        });
                        
                        button.textContent = 'Applied!';
                        button.disabled = true;
                    });
                });
                
                // Handle apply all button
                const applyAllBtn = document.querySelector('.apply-all-btn');
                if (applyAllBtn) {
                    applyAllBtn.addEventListener('click', () => {
                        const optimizations = ${JSON.stringify(optimizations || [])};
                        
                        vscode.postMessage({
                            command: 'applyAllOptimizations',
                            optimizations: optimizations
                        });
                        
                        applyAllBtn.textContent = 'All Optimizations Applied!';
                        applyAllBtn.disabled = true;
                        
                        document.querySelectorAll('.apply-btn').forEach(btn => {
                            btn.textContent = 'Applied!';
                            btn.disabled = true;
                        });
                    });
                }
            </script>
        </body>
        </html>
    `;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper function to map VS Code language IDs to highlight.js language IDs
function getHighlightLanguage(languageId: string): string {
    const languageMap: Record<string, string> = {
        'typescript': 'typescript',
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java',
        'csharp': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'ruby': 'ruby',
        'go': 'go',
        'rust': 'rust',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'markdown': 'markdown',
        'sql': 'sql',
        'swift': 'swift',
        'kotlin': 'kotlin',
        'dart': 'dart',
        'shell': 'bash',
        'powershell': 'powershell'
    };
    
    return languageMap[languageId] || 'plaintext';
}