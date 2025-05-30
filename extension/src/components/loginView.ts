import * as vscode from "vscode";
import { getLoginPageContent } from "../templates/loginTemplate"; // Adjusted path
import { getLoginSuccessAnimation } from "../resources/getLoginSuccessAnimation";

export function showLoginPage(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        "codeGenieLogin",
        "CodeGenie Login",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media'), vscode.Uri.joinPath(extensionUri, 'dist')] // Example paths
        }
    );

    panel.webview.html = getLoginPageContent(panel.webview, extensionUri);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case "login":                    
                    panel.webview.html = getLoginSuccessAnimation("Login Successful", message.email);
                    panel.title = "Login Successful";
                    
                    setTimeout(() => {
                        panel.dispose();
                    }, 3000); // Close after 3 seconds
                    
                    return;
                case "error":
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        },
        undefined,
        [] // context.subscriptions can be passed here if panel needs to be disposed with extension
    );
}