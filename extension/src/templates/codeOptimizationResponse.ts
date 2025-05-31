export interface CodeOptimizationResponse {
    status: string;
    optimization?: JSON;
    error?: string;
    [key: string]: any;
}