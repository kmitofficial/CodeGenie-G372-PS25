import * as vscode from "vscode";

export class CodeGenieCompletionProvider implements vscode.InlineCompletionItemProvider {
    private static currentCompletion: { line: number, text: string, indent: string } | null = null;

    public static setCurrentCompletion(completion: { line: number, text: string, indent: string } | null) {
        CodeGenieCompletionProvider.currentCompletion = completion;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
        if (!CodeGenieCompletionProvider.currentCompletion) {
            return [];
        }

        const { line, text, indent } = CodeGenieCompletionProvider.currentCompletion;

        if (position.line !== line) {
            return [];
        }

        const indentedText = text
            .split('\n')
            .map((lineContent, index) => (index === 0 ? indent + lineContent : indent + lineContent))
            .join('\n');

        const commentLineRange = new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(line, document.lineAt(line).text.length)
        );

        return [
            new vscode.InlineCompletionItem(
                indentedText,
                commentLineRange
            )
        ];
    }
}
