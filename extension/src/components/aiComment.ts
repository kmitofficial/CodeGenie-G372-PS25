import * as vscode from "vscode";
import { generateCodeFromAI } from "../services/apiService";
import { CodeGenieCompletionProvider } from "../providers/completionProvider";
import { CONFIG } from "../constants";
import { getLoadingAnimation } from "../resources/getLoadingAnimation";
import { getWebviewContent } from "../templates/previewTemplate"; 
import { getErrorContent } from "../resources/getErrorContent";

interface PreviewPanelOptions {
    commentLine: number;
    originalIndent: string;
    editor: vscode.TextEditor;
}

export function registerProcessAICommentCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("codegenie.processAIComment", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const lineNumber = selection.active.line;
        const languageId = document.languageId;

        const lineObject = document.lineAt(lineNumber);
        const rawLine = lineObject.text;
        const originalIndent = rawLine.match(/^\s*/)?.[0] || "";
        const commentData = rawLine.replace(/^(\s*\/\/|\s*#|\s*--|\s*\/\*|\s*\*)\s*/, "").trim();

        if (!commentData) {
            vscode.window.showWarningMessage("Empty AI comment. Please provide a prompt.");
            return;
        }

        const fileContent = document.getText();

        // Show temporary loading webview
        const panel = vscode.window.createWebviewPanel(
            "codegenieLoading",
            "CodeGenie: Generating...",
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = getLoadingAnimation(`CodeGenie: Generating the code...`);

        try {
            const responseData = await generateCodeFromAI(commentData, fileContent, lineNumber, languageId);
            let aiResponse = responseData.refined_code || responseData.response || "";

            aiResponse = aiResponse
                .replace(/^```[\w-]*\n?/gm, "")
                .replace(/```$/gm, "")
                .replace(/^['"]{3}[\w-]*\n?/gm, "")
                .replace(/['"]{3}$/gm, "")
                .trim();

            const lineCount = aiResponse.split('\n').length;

            if (aiResponse.length === 0) {
                panel.webview.html = getErrorContent("Error", "AI returned an empty response.");
                return;
            }

            if (lineCount <= CONFIG.GHOST_PREVIEW_MAX_LINES) {
                CodeGenieCompletionProvider.setCurrentCompletion({
                    line: lineNumber + 1,
                    text: aiResponse,
                    indent: originalIndent
                });

                const nextLineNumber = lineNumber + 1;
                let needsNewLine = true;
                if (nextLineNumber < document.lineCount) {
                    if (document.lineAt(nextLineNumber).isEmptyOrWhitespace) {
                        needsNewLine = false;
                    }
                }

                if (needsNewLine) {
                    await editor.edit((editBuilder) => {
                        editBuilder.insert(
                            new vscode.Position(lineNumber, lineObject.text.length),
                            "\n" + originalIndent
                        );
                    });
                }

                const nextLinePos = new vscode.Position(lineNumber + 1, originalIndent.length);
                editor.selection = new vscode.Selection(nextLinePos, nextLinePos);

                panel.dispose(); // Remove loading screen
                await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
                // vscode.window.showInformationMessage("💡 CodeGenie: Suggestion ready (Press Tab to accept).");

            } else {
                panel.dispose(); // Remove loading screen
                showPreviewPanel(
                    context.extensionUri,
                    aiResponse,
                    languageId,
                    {
                        commentLine: lineNumber,
                        originalIndent: originalIndent,
                        editor: editor
                    }
                );
            }

        } catch (error: any) {
            console.error("Failed to process AI comment:", error);
            panel.webview.html = getErrorContent("Error", error?.message || "An unknown error occurred.");
        }
    });

    context.subscriptions.push(disposable);
}

function showPreviewPanel(
extensionUri: vscode.Uri, code: string, language: string, options: PreviewPanelOptions) {
    const panel = vscode.window.createWebviewPanel(
        "codeGeniePreview",
        CONFIG.WEBVIEW_TITLE,
        vscode.ViewColumn.Beside, 
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media'), vscode.Uri.joinPath(extensionUri, 'dist')]
        }
    );

    panel.webview.html = getWebviewContent(panel.webview, extensionUri, code, language);

    panel.webview.onDidReceiveMessage(async (message) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found to insert the code.");
            return;
        }

        switch (message.command) {
            case 'accept':
                await insertCode(editor, options.commentLine, message.code, options.originalIndent);
                panel.dispose();
                break;
            case 'reject':
                vscode.window.showInformationMessage("CodeGenie: Code insertion rejected.");
                panel.dispose();
                break;
            case "error":
                vscode.window.showErrorMessage(message.text);
                break;
        }
    });
}

async function insertCode(editor: vscode.TextEditor, lineNumber: number, code: string, indent: string) {
    const formattedCode = code.split('\n').map((line, i) => {
        return `${indent}${line}`;
    }).join('\n');

    await editor.edit((editBuilder) => {
        const line = editor.document.lineAt(lineNumber);
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(lineNumber, 0),
                new vscode.Position(lineNumber, line.text.length)
            ),
            `${formattedCode}`
        );
    });

    vscode.window.showInformationMessage("✅ CodeGenie: Code inserted successfully!");
}
