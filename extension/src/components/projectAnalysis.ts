import * as vscode from "vscode";
import { analyzeProject } from "../services/apiService";
import { generateProjectAnalysisContent } from "../pages/projectAnalysisPage";
import { getLoadingAnimation } from "../resources/getLoadingAnimation";
import { getErrorContent } from "../resources/getErrorContent";

export function registerProjectAnalysisCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("codegenie.analyzeProject", async () => {
        const panel = vscode.window.createWebviewPanel(
            "projectAnalysis",
            "Project Analysis",
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );
        panel.webview.html = getLoadingAnimation("Analyzing project...");
        try {
            const response = await analyzeProject();
            panel.webview.html = generateProjectAnalysisContent(response);
        } catch (error: any) {
            panel.webview.html = getErrorContent("Error", error.message || "Failed to analyze project.");
        }
    });
    context.subscriptions.push(disposable);
}
