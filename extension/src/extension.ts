import * as vscode from "vscode";
import { CodeGenieCompletionProvider } from "./providers/completionProvider";
import { registerProcessAICommentCommand } from "./components/aiComment";
import { registerConvertCodeCommand } from "./components/codeConversion";
import { createAndShowMenuStatusBarItem, registerShowMenuCommand } from "./components/menu";
import { registerCommentRemovalCommand } from "./components/commentRemoval";
import { registerAnalyzeCodeCommand } from "./components/analyzeCode";
import { registerOptimizationCommands } from "./components/optimizeCode";
import { CodeGenieSidebarProvider } from "./providers/sidebarProvider";

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Extension "codegenie" is now active!');

    createAndShowMenuStatusBarItem(context);

    registerShowMenuCommand(context);
    registerProcessAICommentCommand(context);
    registerConvertCodeCommand(context);
    registerCommentRemovalCommand(context);
    registerAnalyzeCodeCommand(context);
    registerOptimizationCommands(context);

    const completionProvider = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: "**" },
        new CodeGenieCompletionProvider()
    );
    context.subscriptions.push(completionProvider);

    const acceptInlineCompletionCommand = vscode.commands.registerCommand('codegenie.acceptInlineCompletion', () => {
        vscode.commands.executeCommand('editor.action.inlineSuggest.accept');
    });
    context.subscriptions.push(acceptInlineCompletionCommand);
    const activeEditorChangeListener = vscode.window.onDidChangeActiveTextEditor(() => {
        CodeGenieCompletionProvider.setCurrentCompletion(null);
    }, null, context.subscriptions);
    context.subscriptions.push(activeEditorChangeListener);

    const sidebarProvider = new CodeGenieSidebarProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CodeGenieSidebarProvider.viewType,
            sidebarProvider
        )
    );
}

export function deactivate() {
    console.log('Extension "codegenie" is now deactivated!');
}