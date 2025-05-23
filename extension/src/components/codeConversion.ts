import * as vscode from "vscode";
import { convertCodeLang } from "../services/apiService";
import { SUPPORTED_LANGUAGES } from "../constants";
import { getLoadingAnimation } from "../resources/getLoadingAnimation";
import { getCodeConversionContent, mapLanguageId } from "../templates/codeConversionTemplate";
import { CONFIG } from "../constants";
import { getErrorContent } from "../resources/getErrorContent";

export function registerConvertCodeCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("codegenie.convertCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const sourceLanguage = mapLanguageId(document.languageId);

        // If no text is selected, use the entire document content
        const selectedText = selection.isEmpty
            ? document.getText()
            : document.getText(selection);

        if (!selectedText.trim()) {
            getErrorContent("Error", "No code selected or document is empty for conversion.");
            return;
        }

        // Filter out the source language from the target language options
        const targetLanguageOptions = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLanguage);
        
        if (targetLanguageOptions.length === 0) {
            getErrorContent("Error", `No other supported languages available for conversion from ${sourceLanguage}.`);
            return;
        }

        const targetLanguage = await vscode.window.showQuickPick(
            targetLanguageOptions,
            {
                placeHolder: `Convert ${sourceLanguage} code to which language?`,
                canPickMany: false
            }
        );

        if (!targetLanguage) {
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "codeConversion",
            "CodeGenie Code conversion",
            vscode.ViewColumn.Active,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getLoadingAnimation(`CodeGenie: Converting the code from ${sourceLanguage} to ${targetLanguage}...`);

        try {
            // The convertCodeLang function now validates the response format
            const responseData = await convertCodeLang(selectedText, sourceLanguage, targetLanguage);
            
            // The response from the backend contains refined_code, not converted_code
            const convertedCode = responseData.refined_code;
            
            // Just double-check that it's not empty
            if (!convertedCode || convertedCode.trim() === '') {
                getErrorContent("Error", `CodeGenie: Conversion to ${targetLanguage} resulted in empty code.`);
                return;
            }

            panel.dispose();

            // Show the converted code in a new window (not a side panel)
            showCodeConversionPanel(
                context.extensionUri, 
                sourceLanguage, 
                targetLanguage, 
                selectedText, 
                convertedCode,
                { 
                    viewColumn: vscode.ViewColumn.Active, // Open in the active column
                    preserveFocus: false                  // Give focus to the new window
                }
            );
        } catch (error: any) {
            console.error("Failed to convert code:", error);
            // Error handling is already done in the apiService, but we'll add a fallback message
            const errorMessage = error.message || "An unknown error occurred during conversion.";
            getErrorContent("Error", `CodeGenie: Conversion failed. ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}

function showCodeConversionPanel(
    extensionUri: vscode.Uri,
    sourceLanguage: string,
    targetLanguage: string,
    originalCode: string,
    convertedCode: string,
    options: { viewColumn: vscode.ViewColumn; preserveFocus: boolean }
) {
    // Create a webview panel that takes up the full editor space
    const panel = vscode.window.createWebviewPanel(
        "codeGenieConverter",
        CONFIG.CODE_CONVERSION_TITLE,
        vscode.ViewColumn.Active, // Changed from Beside to Active
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media'), vscode.Uri.joinPath(extensionUri, 'dist')],
            enableFindWidget: true
        }
    );

    // Set the webview content
    panel.webview.html = getCodeConversionContent(
        panel.webview,
        extensionUri,
        originalCode,
        convertedCode,
        sourceLanguage,
        targetLanguage
    );

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case "insert":
                    try {
                        const doc = await vscode.workspace.openTextDocument({
                            language: targetLanguage,
                            content: message.code
                        });
                        await vscode.window.showTextDocument(doc, {
                            viewColumn: vscode.ViewColumn.Active,
                            preview: false
                        });
                        panel.dispose();
                    } catch (e) {
                        getErrorContent("Error", "Failed to open document with converted code.");
                        console.error(e);
                    }
                    return;

                case "cancel":
                    panel.dispose();

                case "error":
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        },
        undefined,
        []
    );

    // Make the panel take focus
    panel.reveal(vscode.ViewColumn.Active, true);
}