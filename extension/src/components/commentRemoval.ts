import * as vscode from 'vscode';

export function registerCommentRemovalCommand(context: vscode.ExtensionContext) {
    const removeAllCommentsCommand = vscode.commands.registerCommand('codegenie.removeAllComments', async () => {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to remove all comments from this file?',
            { modal: true },
            'Yes'
        );

        if (confirmation !== 'Yes') {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );

        const lines = text.split('\n');
        const cleanedLines: string[] = [];
        
        // Detect language to apply the appropriate comment rules
        const languageId = document.languageId;
        
        // Define language-specific preprocessor directives to preserve
        const preprocessorRegexes: Record<string, RegExp> = {
            c: /^\s*#\s*(include|define|ifdef|ifndef|endif|pragma|undef|elif|else|error|warning|line)/i,
            cpp: /^\s*#\s*(include|define|ifdef|ifndef|endif|pragma|undef|elif|else|error|warning|line)/i,
            csharp: /^\s*#\s*(if|else|elif|endif|define|undef|warning|error|line|region|endregion|pragma)/i,
            rust: /^\s*#\s*\[/i,
            swift: /^\s*#\s*(if|else|elseif|endif|available|selector|keyPath)/i
        };
        
        // Get the appropriate preprocessor regex for the current language
        const preprocessorRegex = preprocessorRegexes[languageId] || null;
        
        // Track state for multi-line comment blocks
        let insideBlockComment = false;
        let insidePythonDocComment = false;
        let pythonDocDelimiter = '';
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let cleanedLine = line;
            const trimmedLine = line.trim();
            
            // Skip entirely if we're inside a block comment
            if (insideBlockComment) {
                // Look for the end of the block comment
                if (trimmedLine.includes('*/')) {
                    insideBlockComment = false;
                    // Get content after the end of the block comment
                    const afterCommentIndex = cleanedLine.indexOf('*/') + 2;
                    cleanedLine = cleanedLine.substring(afterCommentIndex);
                    
                    // If there's nothing meaningful left, skip this line
                    if (!cleanedLine.trim()) {
                        continue;
                    }
                } else {
                    continue;
                }
            }
            
            // Skip entirely if we're inside a Python-style doc comment
            if (insidePythonDocComment) {
                if (trimmedLine.includes(pythonDocDelimiter)) {
                    insidePythonDocComment = false;
                    // Get content after the end of the doc comment
                    const afterCommentIndex = cleanedLine.indexOf(pythonDocDelimiter) + 3;
                    cleanedLine = cleanedLine.substring(afterCommentIndex);
                    
                    // If there's nothing meaningful left, skip this line
                    if (!cleanedLine.trim()) {
                        continue;
                    }
                } else {
                    continue;
                }
            }
            
            // Check for start of block comments (C-style)
            if (cleanedLine.includes('/*')) {
                // Handle one-line block comments like /* comment */
                if (cleanedLine.includes('*/')) {
                    // Remove the block comment while preserving surrounding code
                    let inString = false;
                    let stringChar = '';
                    let resultLine = '';
                    let i = 0;
                    
                    while (i < cleanedLine.length) {
                        // Handle strings to avoid removing comments inside them
                        if (!inString && (cleanedLine[i] === '"' || cleanedLine[i] === "'" || cleanedLine[i] === '`')) {
                            inString = true;
                            stringChar = cleanedLine[i];
                            resultLine += cleanedLine[i];
                        } else if (inString && cleanedLine[i] === stringChar && cleanedLine[i-1] !== '\\') {
                            inString = false;
                            resultLine += cleanedLine[i];
                        } else if (!inString && cleanedLine.substring(i, i + 2) === '/*') {
                            // Skip until we find */
                            const endIndex = cleanedLine.indexOf('*/', i + 2);
                            if (endIndex !== -1) {
                                i = endIndex + 1; // Skip to character after */
                            } else {
                                // This shouldn't happen for a one-line block comment, but just in case
                                break;
                            }
                        } else {
                            resultLine += cleanedLine[i];
                        }
                        i++;
                    }
                    
                    cleanedLine = resultLine;
                } else {
                    // This is the start of a multi-line block comment
                    const commentStart = cleanedLine.indexOf('/*');
                    // Keep only the content before the comment
                    cleanedLine = cleanedLine.substring(0, commentStart);
                    insideBlockComment = true;
                }
            }
            
            // Check for Python-style doc comments (''' or """)
            const pythonDocMatch = cleanedLine.match(/^\s*('''|""")/);
            if (pythonDocMatch && !insideBlockComment) {
                pythonDocDelimiter = pythonDocMatch[1];
                // Check if the doc comment ends on the same line
                if (cleanedLine.substring(pythonDocMatch.index! + 3).includes(pythonDocDelimiter)) {
                    // It's a single-line doc comment - remove it entirely
                    const endIndex = cleanedLine.lastIndexOf(pythonDocDelimiter);
                    cleanedLine = cleanedLine.substring(endIndex + 3);
                } else {
                    // It's a multi-line doc comment
                    insidePythonDocComment = true;
                    continue;
                }
            }
            
            // Preserve preprocessor lines
            if (preprocessorRegex && preprocessorRegex.test(trimmedLine)) {
                cleanedLines.push(cleanedLine);
                continue;
            }
            
            // Handle single-line comments while being careful with code that looks like comments
            // For languages like Python, Ruby, Bash, etc.
            if (/^\s*(#|\/\/)/.test(trimmedLine) && 
                !(preprocessorRegex && preprocessorRegex.test(trimmedLine))) {
                // Skip completely if it's a full-line comment
                continue;
            }
            
            // Handle inline comments (# or //) that aren't in strings
            const processInlineComments = (line: string): string => {
                let result = '';
                let i = 0;
                let inString = false;
                let stringChar = '';
                
                while (i < line.length) {
                    // Check for string start/end
                    if (!inString && (line[i] === '"' || line[i] === "'" || line[i] === '`')) {
                        inString = true;
                        stringChar = line[i];
                        result += line[i];
                    } 
                    else if (inString && line[i] === stringChar && line[i-1] !== '\\') {
                        inString = false;
                        result += line[i];
                    } 
                    // Check for comment starts
                    else if (!inString && i < line.length - 1 && line.substring(i, i + 2) === '//') {
                        break; // Stop at the comment (no need to process further)
                    }
                    else if (!inString && line[i] === '#' && 
                            !(preprocessorRegex && preprocessorRegex.test(line.substring(0, i+1)))) {
                        break; // Stop at the comment
                    }
                    else {
                        result += line[i];
                    }
                    i++;
                }
                
                return result;
            };
            
            // Process inline comments
            cleanedLine = processInlineComments(cleanedLine);
            
            // Add the cleaned line if it's not empty
            if (cleanedLine.trim() !== '') {
                cleanedLines.push(cleanedLine);
            } else if (cleanedLine === '') {
                // Preserve empty lines that were originally empty (not comment lines)
                if (line.trim() === '') {
                    cleanedLines.push('');
                }
            }
        }
        
        const uncommentedText = cleanedLines.join('\n');
        
        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, uncommentedText);
        });
    });
    
    context.subscriptions.push(removeAllCommentsCommand);
}