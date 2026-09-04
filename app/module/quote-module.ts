// app/module/quote-module.ts

export type QuoteType = "activity" | "event";
export type EventApprovalStatus = "Approved" | "Rejected" | "Pending";
export type EventStatus = "Active" | "Inactive";
export type HeroSectionChoice = "Yes" | "No";

export interface QuoteCreateInput {
    type: QuoteType;
    image_url: string;
    public_id: string;
    description?: string;
    event_date: string; // "YYYY-MM-DD"
    name?: string;
    display_start_date?: string;
    display_end_date?: string;
    event_start_date?: string;
    event_end_date?: string;
    is_approved?: EventApprovalStatus;
    status?: EventStatus;
    add_to_hero?: HeroSectionChoice;
}

export interface QuoteUpdateInput {
    type: QuoteType;
    image_url: string;
    public_id: string;
    description?: string;
    name?: string;
    display_start_date?: string;
    display_end_date?: string;
    event_start_date?: string;
    event_end_date?: string;
    is_approved?: EventApprovalStatus;
    status?: EventStatus;
    add_to_hero?: HeroSectionChoice;
}

export interface QuoteRow {
    id: number;
    type: QuoteType;
    image_url: string;
    public_id: string;
    description: string | null;
    event_date: string;
    created_at: string;
    name: string;
    display_start_date: string | null;
    display_end_date: string | null;
    event_start_date: string | null;
    event_end_date: string | null;
    is_approved: EventApprovalStatus | null;
    status: EventStatus | null;
    add_to_hero: HeroSectionChoice | null;
}