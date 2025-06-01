// import * as vscode from 'vscode';
// import { getLoadingAnimation } from '../resources/getLoadingAnimation';
// import { optimizeCode } from '../services/apiService';
// import { getOptimizationResults } from '../templates/optimizeCodeTemplate';
// import { getErrorContent } from '../resources/getErrorContent';

// export function registerOptimizationCommands(context: vscode.ExtensionContext) {
//     // Register command to optimize code
//     const optimizeCodeCommand = vscode.commands.registerCommand('codegenie.optimizeCode', async () => {
//         try {
//             await codeOptimization();
//         } catch (error) {
//             console.error('Error in optimize code command:', error);
//             getErrorContent("Error", `Failed to optimize code: ${error instanceof Error ? error.message : String(error)}`);
//         }
//     });

//     context.subscriptions.push(optimizeCodeCommand);
// }

// async function codeOptimization() {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//         vscode.window.showInformationMessage('No active editor found');
//         return;
//     }

//     const document = editor.document;
//     const code = document.getText();
//     const languageId = document.languageId;

//     if (!code.trim()) {
//         getErrorContent("Error", 'No code found to optimize');
//         return;
//     }

//     try {
//         // Show loading indicator in status bar
//         const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
//         statusBarItem.text = "$(sync~spin) Optimizing code...";
//         statusBarItem.show();

//         // Create and show the optimization view
//         const panel = vscode.window.createWebviewPanel(
//             'codeOptimizationView', 
//             'Code Optimization', 
//             vscode.ViewColumn.Beside,
//             {
//                 enableScripts: true,
//                 retainContextWhenHidden: true
//             }
//         );

//         // Set initial loading view
//         panel.webview.html = getLoadingAnimation("CodeGenie: Optimizing the code...");

//         // Call API to optimize code
//         const response = await optimizeCode(code, languageId);
        
//         if (response.status === 'success') {
//             // Update view with optimization results
//             panel.webview.html = getOptimizationResults(response.optimization, languageId);
//         } else {
//             // Show error message
//             panel.webview.html = getErrorContent("Error", response.error || 'Failed to optimize code');
//             // vscode.window.showErrorMessage(`Code optimization failed: ${response.error || 'Unknown error'}`);
//         }
//     } catch (error) {
//         console.error('Error during code optimization:', error);
//         getErrorContent(`Error during code optimization: `, error instanceof Error ? error.message : String(error));
//     }
// }






























import * as vscode from 'vscode';
import { getLoadingAnimation } from '../resources/getLoadingAnimation';
import { optimizeCode } from '../services/apiService';
import { getOptimizationResults } from '../pages/optimizeCodePage';
import { getErrorContent } from '../resources/getErrorContent';

export function registerOptimizationCommands(context: vscode.ExtensionContext) {
    // Register command to optimize code
    const optimizeCodeCommand = vscode.commands.registerCommand('codegenie.optimizeCode', async () => {
        try {
            await codeOptimization();
        } catch (error) {
            console.error('Error in optimize code command:', error);
            vscode.window.showErrorMessage(`Failed to optimize code: ${error instanceof Error ? error.message : String(error)}`);
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
        vscode.window.showErrorMessage('No code found to optimize');
        return;
    }

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

    try {
        // Call API to optimize code
        const response = await optimizeCode(code, languageId);
        
        // Hide loading indicator
        statusBarItem.hide();
        statusBarItem.dispose();
        
        if (response.status === 'success') {
            // Update view with optimization results
            panel.webview.html = getOptimizationResults(response.optimizations, languageId);
            
            // Handle messages from webview (for apply optimization buttons)
            panel.webview.onDidReceiveMessage(
                async (message) => {
                    switch (message.command) {
                        case 'applyOptimization':
                            await applyOptimization(editor, message.line, message.code);
                            break;
                        case 'applyAllOptimizations':
                            await applyAllOptimizations(editor, message.optimizations);
                            break;
                    }
                },
                undefined,
                // context.subscriptions
            );
            
        } else {
            // Show error message in webview
            panel.webview.html = getErrorContent("Code Optimization Error", response.error || 'Failed to optimize code');
        }
        
    } catch (error) {
        console.error('Error during code optimization:', error);
        
        // Hide loading indicator
        statusBarItem.hide();
        statusBarItem.dispose();
        
        // Update webview with error content
        panel.webview.html = getErrorContent(
            "Code Optimization Error", 
            `Error during code optimization: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

// Helper function to apply a single optimization
async function applyOptimization(editor: vscode.TextEditor, line: number, optimizedCode: string) {
    try {
        const document = editor.document;
        const lineToReplace = document.lineAt(line - 1); // VS Code uses 0-based indexing
        
        await editor.edit(editBuilder => {
            editBuilder.replace(lineToReplace.range, optimizedCode);
        });
        
        vscode.window.showInformationMessage(`Optimization applied to line ${line}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to apply optimization: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Helper function to apply all optimizations
async function applyAllOptimizations(editor: vscode.TextEditor, optimizations: any[]) {
    try {
        // Sort optimizations by line number in descending order to avoid line number conflicts
        const sortedOptimizations = optimizations.sort((a, b) => b.line - a.line);
        
        await editor.edit(editBuilder => {
            for (const opt of sortedOptimizations) {
                const document = editor.document;
                const lineToReplace = document.lineAt(opt.line - 1); // VS Code uses 0-based indexing
                editBuilder.replace(lineToReplace.range, opt.optimized);
            }
        });
        
        vscode.window.showInformationMessage(`Applied ${optimizations.length} optimizations`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to apply optimizations: ${error instanceof Error ? error.message : String(error)}`);
    }
}
