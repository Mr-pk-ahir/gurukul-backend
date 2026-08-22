import { Request, Response } from "express";
import { TaskService } from "../service/task-service";

export class TaskController {

    async createTask(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, assignedTo, assignedBy, sectionId, departmentId, dueDate } = req.body;

            const task = await TaskService.createTask({
                title,
                description,
                assignedTo: Number(assignedTo),
                assignedBy: assignedBy ? Number(assignedBy) : null,
                sectionId: sectionId ? Number(sectionId) : null,
                departmentId: departmentId ? Number(departmentId) : null,
                dueDate: dueDate || null,
            });

            res.status(201).json({ success: true, message: "Task created successfully", data: task });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Failed to create task" });
        }
    }

    async updateTaskStatus(req: Request, res: Response): Promise<void> {
        try {
            const taskId = Number(req.params.id);
            const { status } = req.body;

            if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
                res.status(400).json({ success: false, message: "Invalid status value" });
                return;
            }

            const task = await TaskService.updateTaskStatus(taskId, status);
            res.status(200).json({ success: true, message: "Task updated successfully", data: task });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Failed to update task" });
        }
    }

    async getTasksByUser(req: Request, res: Response): Promise<void> {
        try {
            const suid = Number(req.params.suid);
            const tasks = await TaskService.getTasksByUser(suid);
            res.status(200).json({ success: true, data: tasks });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Failed to fetch tasks" });
        }
    }

    async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const taskId = Number(req.params.id);
            await TaskService.deleteTask(taskId);
            res.status(200).json({ success: true, message: "Task deleted successfully" });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Task not found" });
        }
    }
}