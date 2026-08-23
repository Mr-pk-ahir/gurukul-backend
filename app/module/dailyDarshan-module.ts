// 🌅 Daily Darshan Module — DB row ane API DTOs na types

export interface DailyDarshanRow {
    id: number;
    title: string;
    image_url: string;
    description: string | null;
    date: string; // YYYY-MM-DD
    created_at: string;
    updated_at?: string;
}

// 🎯 Frontend interface (Daily-Darshan.tsx) sathe exact match — camelCase
export interface DailyDarshanDTO {
    id: number;
    title: string;
    imageUrl: string;
    description: string | null;
    date: string;
}

export interface CreateDailyDarshanInput {
    title: string;
    description?: string;
    date?: string; // na aapyu to CURRENT_DATE use thashe
}

export const mapDailyDarshanRowToDTO = (row: DailyDarshanRow): DailyDarshanDTO => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    description: row.description,
    date: row.date,
});