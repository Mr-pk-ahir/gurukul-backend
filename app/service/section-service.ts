import { SectionModule, SectionRow } from "../module/section-module";

export class SectionService {
    static async createSection(name: string, departmentId: number, description?: string): Promise<SectionRow> {
        if (!name || !departmentId) {
            throw new Error("Section name and Department ID are required.");
        }
        return await SectionModule.create(name, departmentId, description);
    }

    static async getAllSections(): Promise<SectionRow[]> {
        return await SectionModule.getAll();
    }

    static async getSectionById(sectionId: number): Promise<SectionRow> {
        const section = await SectionModule.getById(sectionId);
        if (!section) {
            throw new Error("Section not found.");
        }
        return section;
    }
}