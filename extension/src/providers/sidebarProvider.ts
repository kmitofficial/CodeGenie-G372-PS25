import * as vscode from 'vscode';
import { showLoginPage } from '../components/loginView';
import { getNonce } from '../utils';

interface MenuOption {
    label: string;
    description: string;
    command: string;
    icon: string;
}

export class CodeGenieSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codegenieView';

    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;

    private readonly menuOptions: MenuOption[] = [
        { label: "Login to CodeGenie", description: "Sign in to your CodeGenie account", command: "internal.login", icon: "account" },
        { label: "Process AI Comment", description: "Generate code from a comment", command: "codegenie.processAIComment", icon: "comment-discussion" },
        { label: "Convert Code", description: "Translate code to another language", command: "codegenie.convertCode", icon: "replace-all" },
        { label: "Remove Comments", description: "Removes all types of comments", command: "codegenie.removeAllComments", icon: "clear-all" },
        { label: "Analyze the Code", description: "Identify potential bugs and suggest fixes", command: "codegenie.analyzeCode", icon: "bug" },
        { label: "Optimize the Code", description: "Optimizes the code to the core", command: "codegenie.optimizeCode", icon: "star" },
        { label: "Project Analysis", description: "Get a summary, issues, fixes, and README walkthrough", command: "codegenie.analyzeProject", icon: "project" },
    ];

    constructor(private readonly context: vscode.ExtensionContext) {
        this._extensionUri = context.extensionUri;
        console.log("CodeGenieSidebarProvider: Extension URI:", this._extensionUri.toString());
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media'),
                // If codicon.ttf is in media/fonts, add that too:
                // vscode.Uri.joinPath(this._extensionUri, 'media', 'fonts')
            ]
        };
        console.log("CodeGenieSidebarProvider: Webview options set. Local resource roots:", webviewView.webview.options.localResourceRoots?.map(uri => uri.toString()));


        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            console.log("CodeGenieSidebarProvider: Message received from webview:", data);
            if (data.command) {
                if (data.command === "internal.login") {
                    showLoginPage(this._extensionUri);
                } else {
                    vscode.commands.executeCommand(data.command);
                }
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();

        const toUri = (filePath: string[]) => webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, ...filePath));

        const resetCssUri = toUri(['media', 'reset.css']);
        const vscodeCssUri = toUri(['media', 'vscode.css']); // For Codicons and base styles
        const customCssUri = toUri(['media', 'sidebar.css']);
        const scriptUri = toUri(['media', 'main.js']);

        let cardsHtml = '';
        this.menuOptions.forEach(option => {
            cardsHtml += `
                <div class="card" data-command="${option.command}" role="button" tabindex="0" aria-label="${option.label}: ${option.description}">
                    <div class="card-icon">
                        <span class="codicon codicon-${option.icon}"></span>
                    </div>
                    <div class="card-content">
                        <h3>${option.label}</h3>
                        <p>${option.description}</p>
                    </div>
                </div>
            `;
        });

        // More permissive CSP for debugging - tighten later!
        // Ensure font-src includes ${webview.cspSource} for codicons.
        // If you load images from specific domains, add them to img-src.
        const csp = `
            default-src 'none';
            style-src ${webview.cspSource} 'unsafe-inline';
            font-src ${webview.cspSource} data:;
            img-src ${webview.cspSource} https: data:;
            script-src 'nonce-${nonce}';
        `.replace(/\s{2,}/g, ' ').trim(); // Minify CSP string

        console.log("CodeGenieSidebarProvider: Using CSP:", csp);


        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="${csp}">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <link href="${resetCssUri}" rel="stylesheet">
                <link href="${vscodeCssUri}" rel="stylesheet">
                <link href="${customCssUri}" rel="stylesheet">

                <title>CodeGenie Actions</title>
            </head>
            <body>
                <div class="container">
                    <h1>CodeGenie Actions</h1>
                    ${cardsHtml}
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
