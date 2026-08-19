export type SectionType = "heroSlider" | "featureImage" | "smartInfrastructure";

export const validSections: SectionType[] = [
    "heroSlider",
    "featureImage",
    "smartInfrastructure",
];

export interface OverviewImageRow {
    id: number;
    section: SectionType;
    url: string;
    public_id: string;
    created_at: Date;
}

export interface GroupedOverviewData {
    heroSlider: string[];
    featureImage: string[];
    smartInfrastructure: string[];
}

// module/overview-module.ts ma add karo
export interface OverviewImageWithId {
    id: number;
    url: string;
}

export interface GroupedOverviewDataWithId {
    heroSlider: OverviewImageWithId[];
    featureImage: OverviewImageWithId[];
    smartInfrastructure: OverviewImageWithId[];
}