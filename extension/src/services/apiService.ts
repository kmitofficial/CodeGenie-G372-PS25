import axios from "axios";
import * as vscode from "vscode";

const API_BASE_URL = "http://localhost:5000"; // Centralized API base URL

// Define interfaces for API responses
export interface GenerateCodeResponse {
    status: string;
    response?: string;
    refined_code?: string;
    error?: string;
    [key: string]: any; // Allow for other properties
}

export interface ConvertCodeResponse {
    status: string;
    response?: string;
    refined_code?: string;
    error?: string;
    [key: string]: any; // Allow for other properties
}

export interface CodeAnalysisResponse {
    status: string;
    analysis?: string;
    error?: string;
    [key: string]: any; // Allow for other properties
}

export interface CodeOptimizationResponse {
    status: string;
    optimization?: JSON;
    error?: string;
    [key: string]: any;
}

export async function generateCodeFromAI(
    prompt: string,
    file_content: string,
    cursor_line: number,
    language_id: string
): Promise<GenerateCodeResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/generate`, {
            prompt,
            file_content,
            cursor_line,
            language_id
        });
        
        if (!response.data || !response.data.status || response.data.status !== "success") {
            throw new Error(response.data?.error || "Unknown error from backend (generate)");
        }
        
        return response.data;
    } catch (error: any) {
        console.error("Backend error (generateCodeFromAI):", error?.response?.data || error.message);
        let errorMessage = "❌ Error fetching AI response for code generation";
        if (error?.response?.data?.error) {
            errorMessage += `: ${error.response.data.error}`;
        } else if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        // vscode.window.showErrorMessage(errorMessage);
        throw error; // Re-throw to be caught by the caller
    }
}

export async function convertCodeLang(
    code: string,
    source_language: string,
    target_language: string
): Promise<ConvertCodeResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/convert`, {
            code,
            source_language,
            target_language
        });
        
        // Check if response has data and status is success
        if (!response.data || !response.data.status || response.data.status !== "success") {
            throw new Error(response.data?.error || "Unknown error from backend (convert)");
        }
        
        // Validate the response contains the refined_code property (from backend)
        if (!response.data.refined_code) {
            console.error("API response missing refined_code property:", response.data);
            throw new Error(`API response missing refined_code property for ${target_language}`);
        }
        
        return response.data;
    } catch (error: any) {
        console.error("Backend error (convertCodeLang):", error?.response?.data || error.message);
        let errorMessage = "❌ Error fetching AI response for code conversion";
        if (error?.response?.data?.error) {
            errorMessage += `: ${error.response.data.error}`;
        } else if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        // vscode.window.showErrorMessage(errorMessage);
        throw error; // Re-throw to be caught by the caller
    }
}

export async function analyzeCode (
    code: string,
    language_id: string
): Promise<CodeAnalysisResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/analyze`, {
            code,
            language_id
        });

        if (!response.data || !response.data.status || response.data.status !== "success") {
            throw new Error(response.data?.error || "Unknown error from backend (convert)");
        }

        return response.data;
    } catch (error: any) {
        let errorMessage = "";
        if (error?.response?.data?.error) {
            errorMessage += `: ${error.response.data.error}`;
        } else if (error.message) {
            errorMessage += `: ${error.message}`;
        }

        // vscode.window.showErrorMessage(errorMessage);
        throw error;
    }
}

export async function optimizeCode(
    code: string,
    language_id: string
): Promise<CodeAnalysisResponse> {
    try {
        const response = await axios.post(`${API_BASE_URL}/optimize`, {
            code, 
            language_id
        });

        if (!response.data || !response.data.status) {
            throw new Error(response.data?.error || "Unknown error from backend (optimize)");
        }

        return response.data;
    } catch (error: any) {
        let errorMessage = "";
        if (error?.response?.data?.error) {
            errorMessage += `: ${error.response.data.error}`;
        } else if (error.message) {
            errorMessage += `: ${error.message}`;
        }

        // vscode.window.showErrorMessage(errorMessage);
        throw error;
    }
}