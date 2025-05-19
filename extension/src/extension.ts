import * as vscode from "vscode";
import axios from "axios";
import { getLoginPageContent } from "./templates/loginTemplate";
import { getWebviewContent } from "./templates/previewTemplate";
import { getCodeConversionContent } from "./templates/codeConversionTemplate";
import { getSnippetLibraryContent } from "./templates/snippetLibraryTemplate";
import { SnippetManager } from "./snippetManager";

// Define configurations
const CONFIG = {
    GHOST_PREVIEW_MAX_LINES: 10, // Maximum lines for ghost preview (inline)
    WEBVIEW_TITLE: "CodeGenie Preview",
    CODE_CONVERSION_TITLE: "CodeGenie Code Converter",
    SNIPPET_LIBRARY_TITLE: "CodeGenie Snippet Library"
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

    // Initialize the snippet manager
    const snippetManager = SnippetManager.getInstance(context);

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

    // Register the unified menu command (Ctrl+Alt+C)
    let unifiedMenuCommand = vscode.commands.registerCommand("codegenie.showMenu", async () => {
        const options = [
            { label: "Process AI Comment", detail: "Generate code based on your comment" },
            { label: "Convert Code", detail: "Convert selected code to another language" },
            { label: "Open Snippet Library", detail: "Browse and manage your code snippets" },
            { label: "Save Selection as Snippet", detail: "Save selected code as a reusable snippet" },
            { label: "Suggest Snippets", detail: "Get context-aware snippet suggestions" }
        ];

        const selectedOption = await vscode.window.showQuickPick(options, {
            placeHolder: "Select CodeGenie action"
        });

        if (!selectedOption) return; // User cancelled

        switch (selectedOption.label) {
            case "Process AI Comment":
                await processAIComment();
                break;
            case "Convert Code":
                await convertCode(context.extensionUri);
                break;
            case "Open Snippet Library":
                showSnippetLibraryPanel(context.extensionUri);
                break;
            case "Save Selection as Snippet":
                await saveSnippet(snippetManager);
                break;
            case "Suggest Snippets":
                await suggestSnippets(snippetManager);
                break;
        }
    });

    // Process AI comment function
    async function processAIComment() {
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
                        line: lineNumber + 1, // Show preview on the line AFTER the comment
                        text: aiResponse,
                        indent: originalIndent
                    });
                    
                    // Move cursor to the next line to trigger the inline completion
                    const nextLinePosition = new vscode.Position(lineNumber + 1, 0);
                    editor.selection = new vscode.Selection(nextLinePosition, nextLinePosition);
                    
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
    }

    // Convert code function
    async function convertCode(extensionUri: vscode.Uri) {
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

                const convertedCode = response.data.converted_code;
                
                // Show the converted code in a webview panel
                showCodeConversionPanel(extensionUri, sourceLanguage, targetLanguage, selectedText, convertedCode);
                
                vscode.window.showInformationMessage(`✅ CodeGenie: Code converted from ${sourceLanguage} to ${targetLanguage}`);
            } catch (error: any) {
                console.error("Conversion error:", error?.response?.data || error.message);
                
                let errorMessage = "❌ Error converting code";
                if (error?.response?.data?.error) {
                    errorMessage += `: ${error.response.data.error}`;
                } else if (error.message) {
                    errorMessage += `: ${error.message}`;
                }
                
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }

    // Save snippet function
    async function saveSnippet(snippetManager: SnippetManager) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage("Please select code to save as a snippet.");
            return;
        }

        const code = editor.document.getText(selection);
        const languageId = editor.document.languageId;

        // Prompt for snippet name
        const snippetName = await vscode.window.showInputBox({
            placeHolder: "Enter a name for this snippet",
            prompt: "Give your code snippet a descriptive name"
        });

        if (!snippetName) {
            return; // User cancelled
        }

        // Prompt for snippet description
        const snippetDescription = await vscode.window.showInputBox({
            placeHolder: "Enter a description (optional)",
            prompt: "Add a short description about what this snippet does"
        });

        // Prompt for tags
        const snippetTags = await vscode.window.showInputBox({
            placeHolder: "Enter tags separated by commas (optional)",
            prompt: "Add tags to help find this snippet later"
        });

        const tags = snippetTags ? snippetTags.split(',').map(tag => tag.trim()) : [];

        // Save the snippet
        snippetManager.addSnippet({
            id: Date.now().toString(),
            name: snippetName,
            description: snippetDescription || "",
            code,
            language: languageId,
            tags,
            dateCreated: new Date().toISOString(),
            usage: 0
        });

        vscode.window.showInformationMessage(`✅ Snippet "${snippetName}" saved successfully!`);
    }

    // Suggest snippets function
    async function suggestSnippets(snippetManager: SnippetManager) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const languageId = document.languageId;
        
        // Get context around cursor
        const position = editor.selection.active;
        const lineNumber = position.line;
        const contextStart = Math.max(0, lineNumber - 5);
        const contextEnd = Math.min(document.lineCount - 1, lineNumber + 5);
        
        let context = "";
        for (let i = contextStart; i <= contextEnd; i++) {
            context += document.lineAt(i).text + "\n";
        }

        // Get relevant snippets based on language and context
        const relevantSnippets = snippetManager.getSuggestedSnippets(languageId, context);
        
        if (relevantSnippets.length === 0) {
            vscode.window.showInformationMessage("No relevant snippets found for current context.");
            return;
        }

        // Show quick pick with relevant snippets
        const selectedItem = await vscode.window.showQuickPick(
            relevantSnippets.map(snippet => ({
                label: snippet.name,
                description: snippet.description,
                detail: `Language: ${snippet.language} | Used: ${snippet.usage} times`,
                snippet
            })),
            {
                placeHolder: "Select a snippet to insert",
                matchOnDescription: true,
                matchOnDetail: true
            }
        );

        if (selectedItem) {
            // Insert the selected snippet
            editor.edit(editBuilder => {
                editBuilder.insert(position, selectedItem.snippet.code);
            });
            
            // Update usage count
            snippetManager.incrementSnippetUsage(selectedItem.snippet.id);
        }
    }

    // Register document change listener to detect frequent code patterns
    const frequencyDetectionChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        // Only process substantial changes (not just cursor movements)
        if (event.contentChanges.length > 0) {
            snippetManager.analyzeDocumentChanges(event);
        }
    });

    // Keep these other commands for backward compatibility
    let processAICommentCommand = vscode.commands.registerCommand("codegenie.processAIComment", () => processAIComment());
    let convertCodeCommand = vscode.commands.registerCommand("codegenie.convertCode", () => convertCode(context.extensionUri));
    let openSnippetLibraryCommand = vscode.commands.registerCommand("codegenie.openSnippetLibrary", () => showSnippetLibraryPanel(context.extensionUri));
    let saveSnippetCommand = vscode.commands.registerCommand("codegenie.saveSnippet", () => saveSnippet(snippetManager));
    let suggestSnippetsCommand = vscode.commands.registerCommand("codegenie.suggestSnippets", () => suggestSnippets(snippetManager));
    
    // Register a dummy command for tracking code usage
    const trackCodeUsageCommand = vscode.commands.registerCommand("codegenie.trackCodeUsage", () => {
        vscode.window.showInformationMessage("Tracking code usage is not yet implemented.");
    });

    // Register text document content provider for code usage tracking
    let trackCodeUsageProvider = vscode.workspace.registerTextDocumentContentProvider("codegenie-usage", {
        provideTextDocumentContent(uri) {
            return ""; // Nothing to display
        }
    });

    // Add all commands to subscriptions
    context.subscriptions.push(
        unifiedMenuCommand,
        processAICommentCommand,
        convertCodeCommand,
        openSnippetLibraryCommand,
        saveSnippetCommand,
        trackCodeUsageCommand,
        frequencyDetectionChangeListener,
        trackCodeUsageProvider,
        suggestSnippetsCommand
    );
}

// Function to show login page
function showLoginPage(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        "codeGenieLogin",
        "CodeGenie Login",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        }
    );

    panel.webview.html = getLoginPageContent(panel.webview, extensionUri);

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case "login":
                    // Here you would typically verify the credentials
                    // For now, just show a success message
                    vscode.window.showInformationMessage(`Successfully logged in as ${message.email}`);
                    panel.dispose();
                    return;
            }
        },
        undefined,
        []
    );
}

// Function to show code preview panel
function showPreviewPanel(
    extensionUri: vscode.Uri,
    code: string,
    editor: vscode.TextEditor,
    lineNumber: number,
    indent: string, 
    language: string
) {
    const panel = vscode.window.createWebviewPanel(
        "codeGeniePreview",
        CONFIG.WEBVIEW_TITLE,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        }
    );

    panel.webview.html = getWebviewContent(panel.webview, extensionUri, code, language);

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case "insert":
                    // Insert the code at the line after the comment
                    const indentedCode = message.code
                        .split('\n')
                        .map((line: string, index: number) => index === 0 ? line : indent + line)
                        .join('\n');
                    
                    // Create position for the line after the comment
                    const position = new vscode.Position(lineNumber + 1, 0);
                    editor.edit(editBuilder => {
                        // Insert at the next line with proper indentation
                        editBuilder.insert(position, indentedCode + '\n');
                    });
                    
                    panel.dispose();
                    return;
                
                case "saveSnippet":
                    // Save the code as a snippet
                    const snippetManager = SnippetManager.getInstance();
                    snippetManager.addSnippet({
                        id: Date.now().toString(),
                        name: message.name || "Untitled Snippet",
                        description: message.description || "",
                        code: message.code,
                        language: language,
                        tags: message.tags ? message.tags.split(',').map((t: string) => t.trim()) : [],
                        dateCreated: new Date().toISOString(),
                        usage: 0
                    });
                    
                    vscode.window.showInformationMessage(`✅ Snippet "${message.name}" saved successfully!`);
                    return;
            }
        },
        undefined,
        []
    );
}

// Function to show code conversion panel
function showCodeConversionPanel(
    extensionUri: vscode.Uri,
    sourceLanguage: string,
    targetLanguage: string,
    originalCode: string,
    convertedCode: string
) {
    const panel = vscode.window.createWebviewPanel(
        "codeGenieConverter",
        CONFIG.CODE_CONVERSION_TITLE,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        }
    );

    panel.webview.html = getCodeConversionContent(
        panel.webview,
        extensionUri,
        sourceLanguage,
        targetLanguage,
        originalCode,
        convertedCode
    );

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case "insert":
                    // Create a new document and insert the converted code
                    vscode.workspace.openTextDocument({
                        language: targetLanguage,
                        content: message.code
                    }).then(doc => {
                        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                    });
                    
                    panel.dispose();
                    return;
                
                case "saveSnippet":
                    // Save the converted code as a snippet
                    const snippetManager = SnippetManager.getInstance();
                    snippetManager.addSnippet({
                        id: Date.now().toString(),
                        name: message.name || `Converted from ${sourceLanguage} to ${targetLanguage}`,
                        description: message.description || `Code converted from ${sourceLanguage} to ${targetLanguage}`,
                        code: message.code,
                        language: targetLanguage,
                        tags: message.tags ? message.tags.split(',').map((t: string) => t.trim()) : [sourceLanguage, targetLanguage, "converted"],
                        dateCreated: new Date().toISOString(),
                        usage: 0
                    });
                    
                    vscode.window.showInformationMessage(`✅ Snippet "${message.name}" saved successfully!`);
                    return;
            }
        },
        undefined,
        []
    );
}

// Function to show snippet library panel
function showSnippetLibraryPanel(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        "codeGenieSnippetLibrary",
        CONFIG.SNIPPET_LIBRARY_TITLE,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        }
    );

    const snippetManager = SnippetManager.getInstance();
    const snippets = snippetManager.getAllSnippets();

    panel.webview.html = getSnippetLibraryContent(panel.webview, extensionUri, snippets);

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case "insert":
                    // Insert the snippet into the active editor
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const position = editor.selection.active;
                        editor.edit(editBuilder => {
                            editBuilder.insert(position, message.code);
                        });
                        
                        // Update usage count
                        snippetManager.incrementSnippetUsage(message.id);
                    } else {
                        vscode.window.showErrorMessage("No active editor to insert snippet.");
                    }
                    return;
                
                case "delete":
                    // Delete the snippet
                    snippetManager.deleteSnippet(message.id);
                    
                    // Refresh the webview with updated snippets
                    panel.webview.html = getSnippetLibraryContent(
                        panel.webview,
                        extensionUri,
                        snippetManager.getAllSnippets()
                    );
                    
                    vscode.window.showInformationMessage(`✅ Snippet deleted successfully.`);
                    return;
                
                case "edit":
                    // Update the snippet
                    snippetManager.updateSnippet({
                        id: message.id,
                        name: message.name,
                        description: message.description,
                        code: message.code,
                        language: message.language,
                        tags: message.tags ? message.tags.split(',').map((t: string) => t.trim()) : [],
                        dateCreated: message.dateCreated, // Keep original creation date
                        usage: parseInt(message.usage) || 0
                    });
                    
                    // Refresh the webview with updated snippets
                    panel.webview.html = getSnippetLibraryContent(
                        panel.webview,
                        extensionUri,
                        snippetManager.getAllSnippets()
                    );
                    
                    vscode.window.showInformationMessage(`✅ Snippet "${message.name}" updated successfully.`);
                    return;
                
                case "refresh":
                    // Refresh the webview with the latest snippets
                    panel.webview.html = getSnippetLibraryContent(
                        panel.webview,
                        extensionUri,
                        snippetManager.getAllSnippets()
                    );
                    return;
            }
        },
        undefined,
        []
    );
}

class CodeGenieCompletionProvider implements vscode.InlineCompletionItemProvider {
    private static currentCompletion: { line: number, text: string, indent: string } | null = null;

    static setCurrentCompletion(completion: { line: number, text: string, indent: string } | null) {
        this.currentCompletion = completion;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        if (!CodeGenieCompletionProvider.currentCompletion) {
            return [];
        }

        const { line, text, indent } = CodeGenieCompletionProvider.currentCompletion;
        
        // Only show completion at the specific line
        if (position.line !== line || position.character !== 0) {
            return [];
        }
        
        // Format the text with proper indentation
        const indentedText = text
            .split('\n')
            .map((line, index) => index === 0 ? indent + line : indent + line)
            .join('\n');
        
        return [
            new vscode.InlineCompletionItem(
                indentedText, 
                new vscode.Range(position, position)
            )
        ];
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "codegenie" is now deactivated!');
}