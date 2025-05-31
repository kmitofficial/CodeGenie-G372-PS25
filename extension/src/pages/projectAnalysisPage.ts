export function generateProjectAnalysisContent(analysis: any) {
    const summary = analysis.summary || "No summary available.";
    const issues = Array.isArray(analysis.issues) ? analysis.issues : [];
    const fixes = Array.isArray(analysis.fixes) ? analysis.fixes : [];
    const readme = analysis.readme || "No README walkthrough available.";

    const issuesHtml = issues.length > 0
        ? issues.map((issue: any, idx: number) => `<li>${issue.description || JSON.stringify(issue)}</li>`).join("")
        : '<li>No issues found.</li>';
    const fixesHtml = fixes.length > 0
        ? fixes.map((fix: any, idx: number) => `<li>${fix.suggestion || JSON.stringify(fix)}</li>`).join("")
        : '<li>No fixes available.</li>';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Project Analysis</title>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; }
            h2 { margin-top: 1.5em; }
            ul { margin-left: 1.5em; }
            pre { background: #222; color: #fff; padding: 1em; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>Project Analysis</h1>
        <h2>Summary</h2>
        <p>${summary}</p>
        <h2>Potential Issues</h2>
        <ul>${issuesHtml}</ul>
        <h2>Suggested Fixes</h2>
        <ul>${fixesHtml}</ul>
        <h2>README Walkthrough</h2>
        <pre>${readme}</pre>
    </body>
    </html>
    `;
}
