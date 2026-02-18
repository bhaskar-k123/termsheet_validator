
export interface ScannedDocument {
    id: string;
    name: string;
    status: string;
    size?: number; // Made optional to match usage in Documents.tsx
    type?: string;
    uploadDate: string;
    extractedText?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    highlightedTerms?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectedTerms?: any[];
    url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface ValidationItem {
    term: string;
    extractedValue: string;
    expectedValue: string;
    confidence: number;
    status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
