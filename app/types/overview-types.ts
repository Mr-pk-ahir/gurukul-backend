export type SectionType = "heroSlider" | "featureImage" | "smartInfrastructure";

export const validSections: SectionType[] = ["heroSlider", "featureImage", "smartInfrastructure"];

export interface OverviewImageRow {
    id: number;
    section: SectionType;
    url: string;
    title: string;
    description: string;
    public_id: string;
    created_at: Date;
}