import * as vscode from "vscode";

// Define the interface for a code snippet
export interface CodeSnippet {
    id: string;
    name: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    dateCreated: string;
    usage: number;
}

// Define the threshold for detecting frequent code blocks
const FREQUENCY_THRESHOLD = 3;
// Define the minimum code block size to track (in characters)
const MIN_CODE_BLOCK_SIZE = 50;
// Define the time window to track frequency (in milliseconds)
const FREQUENCY_TIME_WINDOW = 7 * 24 * 60 * 60 * 1000; // 1 week

export class SnippetManager {
    private static instance: SnippetManager;
    private snippets: CodeSnippet[] = [];
    private codeBlockFrequency: Map<string, number> = new Map();
    private codeBlockHistory: Map<string, string[]> = new Map(); // Maps code hash to array of timestamps
    private context: vscode.ExtensionContext | undefined;

    private constructor(context?: vscode.ExtensionContext) {
        this.context = context;
        this.loadSnippets();
    }

    // Implement singleton pattern
    public static getInstance(context?: vscode.ExtensionContext): SnippetManager {
        if (!SnippetManager.instance) {
            SnippetManager.instance = new SnippetManager(context);
        }
        return SnippetManager.instance;
    }

    // Load snippets from storage
    private loadSnippets(): void {
        if (this.context) {
            const storedSnippets = this.context.globalState.get<CodeSnippet[]>("codeGenieSnippets", []);
            this.snippets = storedSnippets;
            
            const storedFrequency = this.context.globalState.get<{ key: string, value: number }[]>("codeGenieFrequency", []);
            storedFrequency.forEach(item => {
                this.codeBlockFrequency.set(item.key, item.value);
            });
            
            const storedHistory = this.context.globalState.get<{ key: string, value: string[] }[]>("codeGenieHistory", []);
            storedHistory.forEach(item => {
                this.codeBlockHistory.set(item.key, item.value);
            });
        }
    }

    // Save snippets to storage
    private saveSnippets(): void {
        if (this.context) {
            this.context.globalState.update("codeGenieSnippets", this.snippets);
            
            const frequencyArray = Array.from(this.codeBlockFrequency.entries()).map(([key, value]) => ({ key, value }));
            this.context.globalState.update("codeGenieFrequency", frequencyArray);
            
            const historyArray = Array.from(this.codeBlockHistory.entries()).map(([key, value]) => ({ key, value }));
            this.context.globalState.update("codeGenieHistory", historyArray);
        }
    }

    // Get all snippets
    public getAllSnippets(): CodeSnippet[] {
        return [...this.snippets];
    }

    // Get snippets filtered by language
    public getSnippetsByLanguage(language: string): CodeSnippet[] {
        return this.snippets.filter(snippet => snippet.language === language);
    }

    // Get snippets filtered by tags
    public getSnippetsByTags(tags: string[]): CodeSnippet[] {
        return this.snippets.filter(snippet => 
            tags.some(tag => snippet.tags.includes(tag))
        );
    }

    // Get snippets filtered by search term (name, description, code)
    public searchSnippets(searchTerm: string): CodeSnippet[] {
        const term = searchTerm.toLowerCase();
        return this.snippets.filter(snippet => 
            snippet.name.toLowerCase().includes(term) ||
            snippet.description.toLowerCase().includes(term) ||
            snippet.code.toLowerCase().includes(term) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }

    // Add a new snippet
    public addSnippet(snippet: CodeSnippet): void {
        this.snippets.push(snippet);
        this.saveSnippets();
    }

    // Update an existing snippet
    public updateSnippet(updatedSnippet: CodeSnippet): void {
        const index = this.snippets.findIndex(s => s.id === updatedSnippet.id);
        if (index !== -1) {
            this.snippets[index] = updatedSnippet;
            this.saveSnippets();
        }
    }

    // Delete a snippet
    public deleteSnippet(id: string): void {
        this.snippets = this.snippets.filter(s => s.id !== id);
        this.saveSnippets();
    }

    // Increment usage count for a snippet
    public incrementSnippetUsage(id: string): void {
        const index = this.snippets.findIndex(s => s.id === id);
        if (index !== -1) {
            this.snippets[index].usage += 1;
            this.saveSnippets();
        }
    }

    // Generate a simple hash for a code block
    private hashCode(code: string): string {
        // Normalize the code by removing whitespace
        const normalizedCode = code.replace(/\s+/g, ' ').trim();
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < normalizedCode.length; i++) {
            const char = normalizedCode.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }

    // Analyze document changes to detect frequently used code blocks
    public analyzeDocumentChanges(event: vscode.TextDocumentChangeEvent): void {
        // Only process substantial changes (pasted code is likely to be substantial)
        const changes = event.contentChanges;
        
        for (const change of changes) {
            // Only track code blocks that are substantial enough
            const code = change.text;
            if (code.length < MIN_CODE_BLOCK_SIZE) {
                continue;
            }
            
            // Hash the code block to use as a unique identifier
            const codeHash = this.hashCode(code);
            
            // Update frequency counter
            const currentCount = this.codeBlockFrequency.get(codeHash) || 0;
            this.codeBlockFrequency.set(codeHash, currentCount + 1);
            
            // Add timestamp to history
            const now = new Date().toISOString();
            const history = this.codeBlockHistory.get(codeHash) || [];
            history.push(now);
            this.codeBlockHistory.set(codeHash, history);
            
            // Clean up old history entries
            this.cleanupHistory();
            
            // Check if this code block should be suggested as a snippet
            this.checkFrequentCodeBlock(code, event.document.languageId, codeHash);
        }
        
        // Save the updated frequency data
        this.saveSnippets();
    }

    // Clean up old history entries
    private cleanupHistory(): void {
        const now = new Date().getTime();
        const cutoffTime = now - FREQUENCY_TIME_WINDOW;
        
        for (const [codeHash, timestamps] of this.codeBlockHistory.entries()) {
            // Filter out timestamps older than the cutoff
            const recentTimestamps = timestamps.filter(timestamp => 
                new Date(timestamp).getTime() >= cutoffTime
            );
            
            if (recentTimestamps.length === 0) {
                // No recent uses, remove from tracking
                this.codeBlockHistory.delete(codeHash);
                this.codeBlockFrequency.delete(codeHash);
            } else {
                // Update with only recent timestamps
                this.codeBlockHistory.set(codeHash, recentTimestamps);
                // Recalculate frequency based on recent usage
                this.codeBlockFrequency.set(codeHash, recentTimestamps.length);
            }
        }
    }

    // Check if a code block is used frequently enough to suggest as a snippet
    private checkFrequentCodeBlock(code: string, language: string, codeHash: string): void {
        // Check if this is already a saved snippet (by code content)
        const isAlreadySnippet = this.snippets.some(snippet => 
            this.hashCode(snippet.code) === codeHash
        );
        
        if (isAlreadySnippet) {
            return; // Already saved, no need to suggest
        }
        
        // Check if the frequency meets our threshold within the time window
        const frequency = this.codeBlockFrequency.get(codeHash) || 0;
        
        if (frequency >= FREQUENCY_THRESHOLD) {
            // This is a frequently used code block, suggest it as a snippet
            this.suggestFrequentCodeAsSnippet(code, language, frequency);
        }
    }

    // Suggest a frequent code block as a snippet to the user
    private suggestFrequentCodeAsSnippet(code: string, language: string, frequency: number): void {
        // Show an information message with buttons
        vscode.window.showInformationMessage(
            `You've used this code block ${frequency} times recently. Save it as a snippet?`,
            "Save as Snippet",
            "No Thanks"
        ).then(selection => {
            if (selection === "Save as Snippet") {
                // Prompt for snippet details
                this.promptForSnippetDetails(code, language);
            }
        });
    }

    // Prompt user for snippet details
    private async promptForSnippetDetails(code: string, language: string): Promise<void> {
        // Prompt for snippet name
        const snippetName = await vscode.window.showInputBox({
            placeHolder: "Enter a name for this snippet",
            prompt: "Give your code snippet a descriptive name"
        });

        if (!snippetName) {
            return; // User cancelled
        }

        // Prompt for snippet description
        const snippetDescription = await vscode.window.showInputBox({
            placeHolder: "Enter a description (optional)",
            prompt: "Add a short description about what this snippet does"
        });

        // Prompt for tags
        const snippetTags = await vscode.window.showInputBox({
            placeHolder: "Enter tags separated by commas (optional)",
            prompt: "Add tags to help find this snippet later"
        });

        const tags = snippetTags ? snippetTags.split(',').map(tag => tag.trim()) : [];

        // Save the snippet
        this.addSnippet({
            id: Date.now().toString(),
            name: snippetName,
            description: snippetDescription || "",
            code,
            language,
            tags,
            dateCreated: new Date().toISOString(),
            usage: 0
        });

        vscode.window.showInformationMessage(`✅ Snippet "${snippetName}" saved successfully!`);
    }

    // Get suggested snippets based on current context
    public getSuggestedSnippets(language: string, context: string): CodeSnippet[] {
        // First, filter by language
        const languageSnippets = this.getSnippetsByLanguage(language);
        
        if (languageSnippets.length === 0) {
            return [];
        }
        
        // Extract context keywords
        const contextWords = this.extractKeywords(context);
        
        // Score snippets based on relevance to context
        const scoredSnippets = languageSnippets.map(snippet => {
            const snippetWords = this.extractKeywords(
                snippet.name + ' ' + 
                snippet.description + ' ' + 
                snippet.tags.join(' ')
            );
            
            // Calculate relevance score
            const relevanceScore = this.calculateRelevanceScore(contextWords, snippetWords);
            
            return {
                snippet,
                score: relevanceScore + (snippet.usage * 0.5) // Weight by usage
            };
        });
        
        // Sort by score and return top 5
        return scoredSnippets
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.snippet);
    }

    // Extract keywords from text
    private extractKeywords(text: string): string[] {
        // Remove common symbols and split into words
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2) // Filter out very short words
            .filter(word => !this.isCommonWord(word)); // Filter out common words
    }

    // Check if a word is a common programming word that shouldn't be used for matching
    private isCommonWord(word: string): boolean {
        const commonWords = [
            'the', 'and', 'for', 'var', 'let', 'const', 'function',
            'import', 'export', 'from', 'class', 'interface', 'type',
            'return', 'this', 'if', 'else', 'while', 'for', 'do',
            'switch', 'case', 'break', 'continue', 'try', 'catch'
        ];
        
        return commonWords.includes(word);
    }

    // Calculate relevance score between context and snippet
    private calculateRelevanceScore(contextWords: string[], snippetWords: string[]): number {
        let score = 0;
        
        // Increase score for each matching word
        for (const snippetWord of snippetWords) {
            if (contextWords.includes(snippetWord)) {
                score += 1;
            }
        }
        
        return score;
    }
}