import * as vscode from "vscode";
import { analyzeCode } from "../services/apiService";
import { getLoadingAnimation } from "../resources/getLoadingAnimation"; 
import { generateBugAnalysisContent } from "../templates/analyzeCodeTemplate";
import { applyFix } from "../templates/analyzeCodeTemplate";
import { getErrorContent } from "../resources/getErrorContent";

export function registerAnalyzeCodeCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand("codegenie.analyzeCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found");
            return;
        }

        const document = editor.document;
        const code = document.getText();
        const languageId = document.languageId;

        if (!code) {
            getErrorContent("Error", "No code found in the current editor");
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "bugAnalysis",
            "CodeGenie Bug Analysis",
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getLoadingAnimation("CodeGenie: Analyzing code for bugs...");

        try {
            const response = await analyzeCode(code, languageId);
            let analysis = null;

            console.log("Raw API response:", response.data);

            if (typeof response.data === 'object') {
                if (response.data.status === "success" && response.data.analysis) {
                    try {
                        if (typeof response.data.analysis === "string") {
                            const jsonMatch = response.data.analysis.match(/({[\s\S]*})/);
                            if (jsonMatch) {
                                analysis = JSON.parse(jsonMatch[0]);
                            } else {
                                analysis = JSON.parse(response.data.analysis);
                            }
                        } else {
                            analysis = response.data.analysis;
                        }
                    } catch (error) {
                        console.error("Failed to parse analysis result:", error);
                    }
                } else if (response.data.issues ||
                        (response.data.summary !== undefined && Array.isArray(response.data.issues))) {
                    analysis = response.data;
                } else {
                    analysis = response.data;
                }
            } else if (typeof response.data === 'string') {
                try {
                    analysis = JSON.parse(response.data);
                } catch (error) {
                    console.error("Failed to parse string response:", error);
                }
            }

            if (!analysis) {
                analysis = {
                    summary: "No response received from the server.",
                    issues: []
                };
            }

            if (!analysis.issues) analysis.issues = [];
            if (!analysis.summary) analysis.summary = "No detailed summary available";

            console.log("Processed analysis:", JSON.stringify(analysis, null, 2));

            panel.webview.html = generateBugAnalysisContent(analysis, document.fileName);

        } catch (error) {
            console.error("Error during bug detection:", error);
            panel.webview.html = getErrorContent("Error", "Failed to connect to the server. Please ensure the CodeGenie server is running.");
        }

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'applyFix':
                        await applyFix(message.fix, message.line, document);
                        return;
                }
            },
            undefined,
            []
        );
    });

    context.subscriptions.push(disposable);
}
