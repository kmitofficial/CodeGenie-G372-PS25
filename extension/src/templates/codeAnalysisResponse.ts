export interface CodeAnalysisResponse {
    status: string;
    analysis?: string;
    error?: string;
    [key: string]: any; // Allow for other properties
}