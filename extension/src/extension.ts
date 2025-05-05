import * as vscode from "vscode";
import axios from "axios";

// Define configurations
const CONFIG = {
    GHOST_PREVIEW_MAX_LINES: 10, // Maximum lines for ghost preview (inline)
    WEBVIEW_TITLE: "CodeGenie Preview",
};

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Extension "codegenie" is now active!');

    // Show login page immediately on activation
    showLoginPage(context.extensionUri);

    // Register inline completion provider for ghost preview
    const completionProvider = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: "**" },
        new CodeGenieCompletionProvider()
    );
    context.subscriptions.push(completionProvider);

    // Register command to process AI comments
    let disposable = vscode.commands.registerCommand("codegenie.processAIComment", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const lineNumber = selection.active.line;
        const languageId = document.languageId;

        let rawLine = document.lineAt(lineNumber).text.trim();
        const data = rawLine.replace(/^(\s*\/\/|\s*#|\s*--|\s*\/\*|\s*\*)/, "").trim();
        const fileContent = document.getText();
        const originalIndent = rawLine.match(/^\s*/)?.[0] || "";

        // Show progress notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `CodeGenie: Processing "${data}"...`,
            cancellable: false
        }, async (progress) => {
            try {
                const response = await axios.post("http://localhost:3000/generate", {
                    prompt: data,
                    file_content: fileContent,
                    cursor_line: lineNumber,
                    language_id: languageId
                });

                if (!response.data.status || response.data.status !== "success") {
                    throw new Error(response.data.error || "Unknown error from backend");
                }

                let aiResponse = response.data.refined_code || response.data.response;
                
                // Clean the response
                aiResponse = aiResponse
                    .replace(/^```[\w]*\n?/g, "")
                    .replace(/```$/g, "")
                    .replace(/^['"]{3}[\w]*\n?/g, "")
                    .replace(/['"]{3}$/g, "")
                    .trim();

                // Count lines to determine preview type
                const lineCount = aiResponse.split('\n').length;
                
                if (lineCount <= CONFIG.GHOST_PREVIEW_MAX_LINES) {
                    // For short responses, trigger ghost preview
                    // Store data for the completion provider to use
                    CodeGenieCompletionProvider.setCurrentCompletion({
                        line: lineNumber,
                        text: aiResponse,
                        indent: originalIndent
                    });
                    // Trigger the inline completion
                    await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
                } else {
                    // For longer responses, show webview panel with preview
                    showPreviewPanel(context.extensionUri, aiResponse, editor, lineNumber, originalIndent);
                }

                vscode.window.showInformationMessage("✅ CodeGenie: Generated code is ready!");

            } catch (error: any) {
                console.error("Backend error:", error?.response?.data || error.message);
                
                let errorMessage = "❌ Error fetching AI response";
                if (error?.response?.data?.error) {
                    errorMessage += `: ${error.response.data.error}`;
                } else if (error.message) {
                    errorMessage += `: ${error.message}`;
                }
                
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// Function to show login page
function showLoginPage(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        'codeGenie.login',
        'CodeGenie Login',
        vscode.ViewColumn.Active,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true
        }
    );
    
    panel.webview.html = getLoginPageContent();
    
    // Handle messages from the login form
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'login':
                    // Handle login (placeholder for now)
                    panel.dispose();
                    break;
            }
        },
        undefined,
        []
    );
}

// Generate HTML content for login page
function getLoginPageContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGenie Login</title>
    <style>
        :root {
            --border-radius: 6px;
            --animation-duration: 0.2s;
            --bg-color: #1e1e1e;
            --card-bg: #252526;
            --text-color: #e1e1e1;
            --input-bg: #333333;
            --input-border: #3c3c3c;
            --button-bg: #0e639c;
            --button-hover: #1177bb;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        
        .login-container {
            background-color: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            padding: 2rem;
            width: 320px;
        }
        
        .logo-container {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .logo-icon {
            margin-right: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background-color: var(--button-bg);
            border-radius: 50%;
            color: #ffffff;
            font-weight: bold;
            font-size: 18px;
        }
        
        .form-group {
            margin-bottom: 1.2rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 0.75rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--input-border);
            background-color: var(--input-bg);
            color: var(--text-color);
            font-size: 0.9rem;
            box-sizing: border-box;
            transition: border-color var(--animation-duration) ease;
        }
        
        input:focus {
            outline: none;
            border-color: var(--button-bg);
        }
        
        .login-button {
            width: 100%;
            padding: 0.8rem;
            background-color: var(--button-bg);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color var(--animation-duration) ease, transform var(--animation-duration) ease;
        }
        
        .login-button:hover {
            background-color: var(--button-hover);
            transform: translateY(-1px);
        }
        
        .forgot-password {
            margin-top: 1rem;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .forgot-password a {
            color: #75bfff;
            text-decoration: none;
        }
        
        .forgot-password a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo-container">
            <div class="logo">
                <span class="logo-icon">✨</span>
                CodeGenie
            </div>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-button">Login</button>
        </form>
        
        <div class="forgot-password">
            <a href="#">Forgot password?</a>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                vscode.postMessage({
                    command: 'login',
                    username: username,
                    password: password
                });
            }
        });
    </script>
</body>
</html>`;
}

// Class to handle inline ghost previews (similar to GitHub Copilot)
class CodeGenieCompletionProvider implements vscode.InlineCompletionItemProvider {
    private static currentCompletion: { line: number; text: string; indent: string } | null = null;

    static setCurrentCompletion(completion: { line: number; text: string; indent: string } | null) {
        this.currentCompletion = completion;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext
    ): Promise<vscode.InlineCompletionItem[] | null> {
        const currentCompletion = CodeGenieCompletionProvider.currentCompletion;
        
        // Only provide completion if we have stored data and cursor is at the right position
        if (!currentCompletion || position.line !== currentCompletion.line) {
            return null;
        }

        // Format the completion text with proper indentation
        const lines = currentCompletion.text.split('\n');
        const formattedText = lines.map((line, i) => {
            return i === 0 ? line : `${currentCompletion.indent}${line}`;
        }).join('\n');

        // Create the inline completion item
        const item = new vscode.InlineCompletionItem(
            `\n${currentCompletion.indent}${formattedText}\n${currentCompletion.indent}`,
            new vscode.Range(position, position)
        );

        // Register a handler to accept the completion with Tab key
        // Note: This functionality is handled at the VS Code level, so we just ensure
        // our completion item is properly formatted for replacement

        // Clear the current completion after providing it
        CodeGenieCompletionProvider.currentCompletion = null;
        
        return [item];
    }
}

// Set up to handle Tab key acceptance for ghost preview
// This is needed because VS Code's default behavior for accepting inline suggestions may vary
vscode.commands.registerCommand('editor.action.inlineSuggest.commit', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // VS Code's built-in command will handle the actual replacement
        // This is just to ensure our extension properly integrates with VS Code's inline suggestion system
        vscode.commands.executeCommand('editor.action.inlineSuggest.commit');
    }
});

// Function to show preview panel for larger code blocks
function showPreviewPanel(
    extensionUri: vscode.Uri,
    codeContent: string,
    editor: vscode.TextEditor,
    lineNumber: number,
    indent: string
) {
    // Create and show panel
    const panel = vscode.window.createWebviewPanel(
        'codeGenie.preview',
        CONFIG.WEBVIEW_TITLE,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true
        }
    );

    // Set HTML content with the original code
    panel.webview.html = getWebviewContent(codeContent);

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'accept':
                    // Use the potentially edited code from the message
                    await insertCode(editor, lineNumber, message.code, indent);
                    panel.dispose();
                    break;
                case 'reject':
                    panel.dispose();
                    break;
            }
        },
        undefined,
        []
    );
}

// Generate HTML content for webview
function getWebviewContent(code: string) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeGenie Preview</title>
        <style>
            :root {
                --border-radius: 6px;
                --animation-duration: 0.2s;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
                padding: 0;
                margin: 0;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
                line-height: 1.6;
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
                padding: 24px;
            }
            
            .header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .logo {
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background-color: var(--vscode-button-background);
                border-radius: 50%;
                color: var(--vscode-button-foreground);
                font-weight: bold;
                font-size: 18px;
            }
            
            h2 {
                color: var(--vscode-editor-foreground);
                font-weight: 500;
                margin: 0;
                flex-grow: 1;
                font-size: 18px;
            }
            
            .editor-container {
                position: relative;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: var(--border-radius);
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                overflow: hidden;
            }
            
            .editor-header {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background-color: var(--vscode-tab-activeBackground);
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .editor-title {
                font-size: 13px;
                color: var(--vscode-tab-activeForeground);
                font-weight: 500;
                flex-grow: 1;
            }
            
            #codeEditor {
                width: 100%;
                height: 300px;
                min-height: 150px;
                padding: 12px;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
                border: none;
                resize: vertical;
                tab-size: 4;
                white-space: pre;
                overflow: auto;
                outline: none;
            }
            
            .buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
            }
            
            button {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                border-radius: var(--border-radius);
                border: none;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all var(--animation-duration) ease;
            }
            
            button svg {
                margin-right: 6px;
            }
            
            .accept {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }
            
            .accept:hover {
                background-color: var(--vscode-button-hoverBackground);
                transform: translateY(-1px);
            }
            
            .reject {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            
            .reject:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
                transform: translateY(-1px);
            }
            
            .card {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                padding: 16px;
                border-radius: var(--border-radius);
                margin-top: 20px;
                font-size: 13px;
            }
            
            .card-title {
                font-size: 14px;
                font-weight: 500;
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .tip {
                display: flex;
                align-items: flex-start;
                color: var(--vscode-descriptionForeground);
            }
            
            .tip svg {
                flex-shrink: 0;
                margin-right: 8px;
                margin-top: 2px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✨CodeGenie Generated Code</h2>
            </div>
            
            <div class="editor-container">
                <textarea id="codeEditor" spellcheck="false">${code}</textarea>
            </div>
            
            <div class="buttons">
                <button class="reject" id="rejectBtn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="currentColor"/>
                        <path d="M10.7 5.3C10.5 5.1 10.2 5.1 10 5.3L8 7.3L6 5.3C5.8 5.1 5.5 5.1 5.3 5.3C5.1 5.5 5.1 5.8 5.3 6L7.3 8L5.3 10C5.1 10.2 5.1 10.5 5.3 10.7C5.4 10.8 5.5 10.9 5.7 10.9C5.8 10.9 6 10.8 6 10.7L8 8.7L10 10.7C10.1 10.8 10.3 10.9 10.4 10.9C10.5 10.9 10.7 10.8 10.7 10.7C10.9 10.5 10.9 10.2 10.7 10L8.7 8L10.7 6C10.9 5.8 10.9 5.5 10.7 5.3Z" fill="currentColor"/>
                    </svg>
                    Reject
                </button>
                <button class="accept" id="acceptBtn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="currentColor"/>
                        <path d="M6.7 9.7L5.3 8.3C5.1 8.1 4.8 8.1 4.6 8.3C4.4 8.5 4.4 8.8 4.6 9L6.3 10.7C6.5 10.9 6.8 10.9 7 10.7L11.4 6.3C11.6 6.1 11.6 5.8 11.4 5.6C11.2 5.4 10.9 5.4 10.7 5.6L6.7 9.7Z" fill="currentColor"/>
                    </svg>
                    Accept
                </button>
            </div>
            
            <div class="card">
                <h3 class="card-title">Tip</h3>
                <div class="tip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 1C4.1 1 1 4.1 1 8C1 11.9 4.1 15 8 15C11.9 15 15 11.9 15 8C15 4.1 11.9 1 8 1ZM8 14C4.7 14 2 11.3 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8C14 11.3 11.3 14 8 14Z" fill="currentColor"/>
                        <path d="M8 6C7.6 6 7.2 6.4 7.2 6.8V11.2C7.2 11.6 7.6 12 8 12C8.4 12 8.8 11.6 8.8 11.2V6.8C8.8 6.4 8.4 6 8 6Z" fill="currentColor"/>
                        <path d="M8 5.2C8.4 5.2 8.8 4.8 8.8 4.4C8.8 4 8.4 3.6 8 3.6C7.6 3.6 7.2 4 7.2 4.4C7.2 4.8 7.6 5.2 8 5.2Z" fill="currentColor"/>
                    </svg>
                    <span>You can edit the code above before accepting. When you click Accept, the original comment line will be replaced with your edited code.</span>
                </div>
            </div>
        </div>

        <script>
            (function() {
                // Get the VS Code API object
                const vscode = acquireVsCodeApi();
                const codeEditor = document.getElementById('codeEditor');
                
                // Add event listeners
                document.getElementById('acceptBtn').addEventListener('click', () => {
                    // Send the edited code back to the extension
                    vscode.postMessage({ 
                        command: 'accept',
                        code: codeEditor.value
                    });
                });
                
                document.getElementById('rejectBtn').addEventListener('click', () => {
                    vscode.postMessage({ command: 'reject' });
                });

                // Auto-adjust the height of the code editor based on content
                function adjustEditorHeight() {
                    codeEditor.style.height = 'auto';
                    codeEditor.style.height = (codeEditor.scrollHeight + 5) + 'px';
                }
                
                // Initialize height
                window.addEventListener('load', adjustEditorHeight);
                codeEditor.addEventListener('input', adjustEditorHeight);
                
                // Tab key handling for the editor
                codeEditor.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        
                        // Insert a tab at cursor position
                        const start = this.selectionStart;
                        const end = this.selectionEnd;
                        
                        this.value = this.value.substring(0, start) + 
                                     '    ' + 
                                     this.value.substring(end);
                        
                        // Put cursor after the inserted tab
                        this.selectionStart = this.selectionEnd = start + 4;
                    }
                });
            }());
        </script>
    </body>
    </html>`;
}

// Function to insert code into editor
async function insertCode(editor: vscode.TextEditor, lineNumber: number, code: string, indent: string) {
    // Format the code with proper indentation
    const formattedCode = code.split('\n').map((line, i) => {
        return `${indent}${line}`;
    }).join('\n');

    await editor.edit((editBuilder) => {
        // Replace the comment line with the formatted code
        const line = editor.document.lineAt(lineNumber);
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(lineNumber, 0),
                new vscode.Position(lineNumber, line.text.length)
            ),
            `${formattedCode}`
        );
    });

    // Notify user of successful insertion
    vscode.window.showInformationMessage("✅ CodeGenie: Code inserted successfully!");
}

export function deactivate() {
    // Make sure we show the login page next time the extension is activated
    // This is handled by the activate function
}
