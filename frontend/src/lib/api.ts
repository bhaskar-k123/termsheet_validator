import { ScannedDocument } from "@/types";

const API_BASE_URL = "http://localhost:5000";

export const api = {
    /**
     * Upload and process a PDF termsheet via Gemini.
     */
    async extractTermsheet(file: File): Promise<any> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/extract`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to process termsheet");
        }

        return response.json();
    },

    /**
     * Fetch all processed termsheets.
     */
    async getTermsheets(): Promise<ScannedDocument[]> {
        const response = await fetch(`${API_BASE_URL}/termsheets`);
        if (!response.ok) {
            throw new Error("Failed to fetch termsheets");
        }
        return response.json();
    },

    /**
     * Fetch trader statistics.
     */
    async getTraderStats(email: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/trader_stats?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error("Failed to fetch trader statistics");
        }
        return response.json();
    }
};
