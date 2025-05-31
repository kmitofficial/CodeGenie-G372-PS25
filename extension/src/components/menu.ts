import * as vscode from "vscode";
import { showLoginPage } from "./loginView";

export function createAndShowMenuStatusBarItem(context: vscode.ExtensionContext) {
    const menuStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    menuStatusBarItem.text = "$(sparkle) CodeGenie";
    menuStatusBarItem.tooltip = "Open CodeGenie Menu";
    menuStatusBarItem.command = "codegenie.showMenu";
    menuStatusBarItem.show();
    context.subscriptions.push(menuStatusBarItem);
}

export function registerShowMenuCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("codegenie.showMenu", async () => {
        const menuOptions = [
            { label: "$(account) Login to CodeGenie", description: "Sign in to your CodeGenie account", command: "internal.login" },
            { label: "$(comment-discussion) Process AI Comment", description: "Generate code from a comment", command: "codegenie.processAIComment" },
            { label: "$(replace-all) Convert Code", description: "Translate code to another language", command: "codegenie.convertCode" },
            { label: "$(clear-all) Remove Comments", description: "Removes all types of comments form the entire file", command: "codegenie.removeAllComments"},
            { label: "$(bug) Analyze the Code", description: "Identify potential bugs, edge cases, and suggest fixes", command: "codegenie.analyzeCode" },
            { label: "$(star) Optimize the Code", description: "Optimizes the code to the core", command: "codegenie.optimizeCode" },
            { label: "$(project) Project Analysis", description: "Get a summary, issues, fixes, and README walkthrough", command: "codegenie.analyzeProject" },
        ];

        const selectedOption = await vscode.window.showQuickPick(menuOptions, {
            placeHolder: "Select a CodeGenie action"
        });

        if (!selectedOption) {
            return;
        }

        if (selectedOption.command === "internal.login") {
            showLoginPage(context.extensionUri);
        } else if (selectedOption.command) {
            vscode.commands.executeCommand(selectedOption.command);
        }
    });
    context.subscriptions.push(disposable);
}
