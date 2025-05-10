import * as vscode from "vscode";
import axios from "axios";
import { getLoginPageContent } from "./templates/loginTemplate";
import { getWebviewContent } from "./templates/previewTemplate";
import { getCodeConversionContent } from "./templates/codeConversionTemplate";

// Define configurations
const CONFIG = {
    GHOST_PREVIEW_MAX_LINES: 10, // Maximum lines for ghost preview (inline)
    WEBVIEW_TITLE: "CodeGenie Preview",
    CODE_CONVERSION_TITLE: "CodeGenie Code Converter",
};

// List of supported languages for conversion
const SUPPORTED_LANGUAGES = [
    "python",
    "javascript",
    "typescript",
    "java",
    "c",
    "cpp",
    "csharp",
    "ruby",
    "go",
    "rust",
    "php",
    "swift",
    "kotlin",
    "sql"
];

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

    // Register command to handle tab key acceptance for ghost preview
    const acceptCommand = vscode.commands.registerCommand('codegenie.acceptInlineCompletion', () => {
        vscode.commands.executeCommand('editor.action.inlineSuggest.accept');
    });
    context.subscriptions.push(acceptCommand);
    
    // Listen for changes in the active editor and clear completions when changed
    vscode.window.onDidChangeActiveTextEditor(() => {
        CodeGenieCompletionProvider.setCurrentCompletion(null);
    }, null, context.subscriptions);

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
                const response = await axios.post("http://localhost:5000/generate", {
                    prompt: data,
                    file_content: fileContent,
                    cursor_line: lineNumber,
                    language_id: languageId
                });
                // const response = await axios.post("https://d9d4-183-82-97-138.ngrok-free.app/generate", {
                //     prompt: data,
                //     file_content: fileContent,
                //     cursor_line: lineNumber,
                //     language_id: languageId
                // });

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
                    showPreviewPanel(context.extensionUri, aiResponse, editor, lineNumber, originalIndent, languageId);
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

    // Register command to convert code from one language to another
    let convertCodeCommand = vscode.commands.registerCommand("codegenie.convertCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const sourceLanguage = document.languageId;
        
        // If no text is selected, use the entire document
        const selectedText = selection.isEmpty 
            ? document.getText() 
            : document.getText(selection);
        
        if (!selectedText.trim()) {
            vscode.window.showErrorMessage("No code selected for conversion.");
            return;
        }

        // Show quick pick for target language selection
        const targetLanguage = await vscode.window.showQuickPick(
            SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage),
            {
                placeHolder: "Select target language for conversion",
                canPickMany: false
            }
        );

        if (!targetLanguage) {
            return; // User cancelled
        }

        // Show progress notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `CodeGenie: Converting ${sourceLanguage} to ${targetLanguage}...`,
            cancellable: false
        }, async (progress) => {
            try {
                const response = await axios.post("http://localhost:5000/convert", {
                    code: selectedText,
                    source_language: sourceLanguage,
                    target_language: targetLanguage
                });

                if (!response.data.status || response.data.status !== "success") {
                    throw new Error(response.data.error || "Unknown error from backend");
                }

                const convertedCode = response.data.refined_code || response.data.response;
                
                // Show converted code in webview
                showCodeConversionPanel(
                    context.extensionUri,
                    selectedText,
                    convertedCode,
                    sourceLanguage,
                    targetLanguage
                );

                vscode.window.showInformationMessage(`✅ CodeGenie: Code converted to ${targetLanguage} successfully!`);

            } catch (error: any) {
                console.error("Backend error:", error?.response?.data || error.message);
                
                let errorMessage = "❌ Error converting code";
                if (error?.response?.data?.error) {
                    errorMessage += `: ${error.response.data.error}`;
                } else if (error.message) {
                    errorMessage += `: ${error.message}`;
                }
                
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    });

    context.subscriptions.push(disposable, convertCodeCommand);
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

// Function to show code conversion panel
function showCodeConversionPanel(
    extensionUri: vscode.Uri,
    sourceCode: string,
    convertedCode: string,
    sourceLanguage: string,
    targetLanguage: string
) {
    // Create and show panel
    const panel = vscode.window.createWebviewPanel(
        'codeGenie.codeConversion',
        CONFIG.CODE_CONVERSION_TITLE,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true
        }
    );

    // Set HTML content
    panel.webview.html = getCodeConversionContent(
        sourceCode,
        convertedCode,
        sourceLanguage,
        targetLanguage
    );

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'copy':
                    // Copy the converted code to clipboard
                    vscode.env.clipboard.writeText(message.code);
                    vscode.window.showInformationMessage("✅ CodeGenie: Converted code copied to clipboard!");
                    break;
                case 'insert':
                    // Insert the code at current cursor position
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        await editor.edit((editBuilder) => {
                            editBuilder.insert(editor.selection.active, message.code);
                        });
                        vscode.window.showInformationMessage("✅ CodeGenie: Converted code inserted!");
                    }
                    panel.dispose();
                    break;
                case 'cancel':
                    panel.dispose();
                    break;
            }
        },
        undefined,
        []
    );
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

        // Set command that will be executed when the item is accepted
        item.command = {
            command: 'editor.action.inlineSuggest.accept',
            title: 'Accept'
        };

        return [item];
    }
}

// Function to show preview panel for larger code blocks
function showPreviewPanel(
    extensionUri: vscode.Uri,
    codeContent: string,
    editor: vscode.TextEditor,
    lineNumber: number,
    indent: string,
    languageId: string
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
    panel.webview.html = getWebviewContent(codeContent, languageId);

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
