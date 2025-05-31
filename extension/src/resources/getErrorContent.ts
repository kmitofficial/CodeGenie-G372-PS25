export function getErrorContent(title: string, errorMessage: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                :root {
                    color-scheme: light dark;
                }
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    font-family: var(--vscode-font-family, sans-serif);
                    background-color: var(--vscode-editor-background, #1e1e1e);
                    color: var(--vscode-editor-foreground, #cccccc);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 1rem;
                }
                .error-card {
                    background-color: #ff4b4b;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    max-width: 90%;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: fadeIn 0.3s ease-in-out;
                }
                .error-card h2 {
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                    font-size: 1.25rem;
                }
                .error-card p {
                    margin: 0;
                    font-size: 1rem;
                    line-height: 1.4;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-card">
                    <h2>🚫 Error</h2>
                    <p>${errorMessage}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
