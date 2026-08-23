// app/module/quote-module.ts

export type QuoteType = "activity" | "event";

export interface QuoteCreateInput {
    type: QuoteType;
    image_url: string;
    public_id: string;
    description?: string;
    event_date: string; // "YYYY-MM-DD"
}

export interface QuoteRow {
    id: number;
    type: QuoteType;
    image_url: string;
    public_id: string;
    description: string | null;
    event_date: string;
    created_at: string;
}