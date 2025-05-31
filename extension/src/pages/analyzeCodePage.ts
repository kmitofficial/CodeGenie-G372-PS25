import * as vscode from 'vscode';

export function generateBugAnalysisContent(analysis: any, fileName: string) {
    const baseName = fileName.split(/[\\/]/).pop() || "Unknown File";
    const issues = Array.isArray(analysis.issues) ? analysis.issues : [];

    const issuesHtml = issues.length > 0
        ? issues.map((issue: any, index: number) => {
            const type = issue.type || "bug";
            const line = issue.line || "unknown";
            const description = issue.description || "No description provided";
            const fix = issue.fix || "// No fix available";

            return `
            <div class="issue">
                <div class="issue-header">
                    <span class="issue-type ${type.toLowerCase()}">${type.toUpperCase()}</span>
                    <span class="issue-line">Line ${line}</span>
                </div>
                <div class="issue-description">${description}</div>
                <div class="issue-fix">
                    <h4>Suggested Fix:</h4>
                    <pre class="code">${escapeHtml(fix)}</pre>
                    <button class="apply-button" onclick="applyFix(${index})">Apply Fix</button>
                </div>
            </div>
            `;
        }).join('')
        : '<div class="no-issues">No issues found or no response from the server.</div>';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CodeGenie Bug Analysis</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    padding: 20px;
                    line-height: 1.5;
                }
                h1 {
                    font-size: 1.3em;
                    margin-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                .summary {
                    padding: 15px;
                    margin-bottom: 20px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 5px;
                    border-left: 4px solid var(--vscode-activityBarBadge-background);
                }
                .issues-container {
                    margin-top: 20px;
                }
                .issue {
                    margin-bottom: 15px;
                    padding: 15px;
                    background-color: var(--vscode-editor-background);
                    border-radius: 5px;
                    border-left: 4px solid var(--vscode-editorWarning-foreground);
                }
                .issue-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .issue-type {
                    font-weight: bold;
                    padding: 3px 10px;
                    border-radius: 3px;
                    color: white;
                }
                .bug { background-color: #d32f2f; }
                .edge_case { background-color: #fb8c00; }
                .vulnerability { background-color: #c2185b; }
                .performance { background-color: #0288d1; }
                .logic { background-color: #7b1fa2; }
                .issue-line {
                    font-weight: bold;
                }
                .issue-description {
                    margin-bottom: 10px;
                }
                .issue-fix {
                    background-color: var(--vscode-input-background);
                    padding: 10px;
                    border-radius: 5px;
                }
                .code {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    border-radius: 3px;
                    overflow-x: auto;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                    white-space: pre-wrap;
                }
                .apply-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 14px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                .apply-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .no-issues {
                    padding: 20px;
                    text-align: center;
                    font-style: italic;
                    color: var(--vscode-disabledForeground);
                }
            </style>
        </head>
        <body>
            <h1>Bug Analysis for ${baseName}</h1>

            <div class="summary">
                <h3>Summary</h3>
                <p>${analysis.summary || 'No summary available'}</p>
            </div>

            <h3>Found ${issues.length} issue(s)</h3>
            <div class="issues-container">
                ${issuesHtml}
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function applyFix(index) {
                    const issues = ${JSON.stringify(issues)};
                    const issue = issues[index];

                    if (issue) {
                        vscode.postMessage({
                            command: 'applyFix',
                            fix: issue.fix,
                            line: issue.line
                        });
                    }
                }
            </script>
        </body>
        </html>
    `;
}

function escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') {
        unsafe = String(unsafe);
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function applyFix(fix: string, lineNumber: number, document: vscode.TextDocument) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== document) {
        vscode.window.showErrorMessage("Cannot apply fix: Editor has changed");
        return;
    }

    try {
        const line = typeof lineNumber === 'string' ? parseInt(lineNumber, 10) : lineNumber;

        if (isNaN(line) || line < 1 || line > document.lineCount) {
            vscode.window.showErrorMessage(`Invalid line number: ${lineNumber}`);
            return;
        }

        const docLine = document.lineAt(line - 1);

        await editor.edit(editBuilder => {
            editBuilder.replace(docLine.range, fix);
        });

        vscode.window.showInformationMessage("Fix applied successfully");
    } catch (error) {
        console.error("Error applying fix:", error);
        vscode.window.showErrorMessage("Failed to apply the fix");
    }
}