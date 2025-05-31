export interface ProjectAnalysisResponse {
    status: string;
    summary?: string;
    issues?: Array<any>;
    fixes?: Array<any>;
    readme?: string;
    error?: string;
    [key: string]: any;
}