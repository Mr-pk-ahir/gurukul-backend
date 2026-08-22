import { Request, Response } from "express";
import { GroupService } from "../service/group-service";

export class GroupController {
    async createGroup(req: Request, res: Response): Promise<Response> {
        try {
            const { group_name, description, member_ids } = req.body;

            if (!group_name || !Array.isArray(member_ids) || member_ids.length === 0) {
                return res.status(400).json({ message: "group_name ane member_ids (min 1) jaruri chhe" });
            }

            // 👑 logged-in user id — tamara auth middleware pramane adjust karo
            const createdBy = (req as any).user?.suid;

            const newGroup = await GroupService.createGroup({
                group_name,
                description,
                member_ids,
                created_by: createdBy,
            });

            return res.status(201).json({ success: true, data: newGroup });
        } catch (error) {
            console.error("createGroup error:", error);
            return res.status(500).json({ message: "Error creating group" });
        }
    }

    async getAllGroups(_req: Request, res: Response): Promise<Response> {
        try {
            const groups = await GroupService.getAllGroups();
            return res.status(200).json({ success: true, data: groups });
        } catch (error) {
            console.error("getAllGroups error:", error);
            return res.status(500).json({ message: "Error fetching groups" });
        }
    }

    // 🆕 Logged-in user je je groups no member chhe te badhi — Navbar "My Groups" mate
    async getGroupsByMember(req: Request, res: Response): Promise<Response> {
        try {
            const suid = Number(req.params.suid);
            if (Number.isNaN(suid)) {
                return res.status(400).json({ success: false, message: "Invalid suid" });
            }

            const groups = await GroupService.getGroupsByMember(suid);
            return res.status(200).json({ success: true, data: groups });
        } catch (error) {
            console.error("getGroupsByMember error:", error);
            return res.status(500).json({ message: "Error fetching member groups" });
        }
    }

    // 🆕 Single group fetch — edit page ma prefill karva mate
    async getGroupById(req: Request, res: Response): Promise<Response> {
        try {
            const groupId = Number(req.params.id);
            if (Number.isNaN(groupId)) {
                return res.status(400).json({ success: false, message: "Invalid group id" });
            }

            const group = await GroupService.getGroupById(groupId);
            if (!group) {
                return res.status(404).json({ success: false, message: "Group not found" });
            }

            return res.status(200).json({ success: true, data: group });
        } catch (error) {
            console.error("getGroupById error:", error);
            return res.status(500).json({ message: "Error fetching group" });
        }
    }

    // 🆕 Update group
    async updateGroup(req: Request, res: Response): Promise<Response> {
        try {
            const groupId = Number(req.params.id);
            if (Number.isNaN(groupId)) {
                return res.status(400).json({ success: false, message: "Invalid group id" });
            }

            const { group_name, description, member_ids } = req.body;

            const updated = await GroupService.updateGroup(groupId, {
                group_name,
                description,
                member_ids,
            });

            if (!updated) {
                return res.status(404).json({ success: false, message: "Group not found" });
            }

            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error("updateGroup error:", error);
            return res.status(500).json({ message: "Error updating group" });
        }
    }

    // 🆕 Delete group (List page ma 3-dot > Delete mate joishe)
    async deleteGroup(req: Request, res: Response): Promise<Response> {
        try {
            const groupId = Number(req.params.id);
            if (Number.isNaN(groupId)) {
                return res.status(400).json({ success: false, message: "Invalid group id" });
            }

            const deleted = await GroupService.deleteGroup(groupId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: "Group not found" });
            }

            return res.status(200).json({ success: true, message: "Group deleted" });
        } catch (error) {
            console.error("deleteGroup error:", error);
            return res.status(500).json({ message: "Error deleting group" });
        }
    }
}