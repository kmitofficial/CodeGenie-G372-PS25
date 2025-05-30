import * as vscode from 'vscode';
import { getLoadingAnimation } from '../resources/getLoadingAnimation';
import { optimizeCode } from '../services/apiService';
import { getOptimizationResults } from '../templates/optimizeCodeTemplate';
import { getErrorContent } from '../resources/getErrorContent';

export function registerOptimizationCommands(context: vscode.ExtensionContext) {
    // Register command to optimize code
    const optimizeCodeCommand = vscode.commands.registerCommand('codegenie.optimizeCode', async () => {
        try {
            await codeOptimization();
        } catch (error) {
            console.error('Error in optimize code command:', error);
            getErrorContent("Error", `Failed to optimize code: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(optimizeCodeCommand);
}

async function codeOptimization() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const code = document.getText();
    const languageId = document.languageId;

    if (!code.trim()) {
        getErrorContent("Error", 'No code found to optimize');
        return;
    }

    try {
        // Show loading indicator in status bar
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(sync~spin) Optimizing code...";
        statusBarItem.show();

        // Create and show the optimization view
        const panel = vscode.window.createWebviewPanel(
            'codeOptimizationView', 
            'Code Optimization', 
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Set initial loading view
        panel.webview.html = getLoadingAnimation("CodeGenie: Optimizing the code...");

        // Call API to optimize code
        const response = await optimizeCode(code, languageId);
        
        if (response.status === 'success') {
            // Update view with optimization results
            panel.webview.html = getOptimizationResults(response.optimization, languageId);
        } else {
            // Show error message
            panel.webview.html = getErrorContent("Error", response.error || 'Failed to optimize code');
            // vscode.window.showErrorMessage(`Code optimization failed: ${response.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error during code optimization:', error);
        getErrorContent(`Error during code optimization: `, error instanceof Error ? error.message : String(error));
    }
}

