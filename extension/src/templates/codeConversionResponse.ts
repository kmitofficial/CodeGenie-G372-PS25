export interface CodeConversionResponse {
    status: string;
    response?: string;
    refined_code?: string;
    error?: string;
    [key: string]: any; // Allow for other properties
}