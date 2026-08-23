import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller";
import { DepartmentController } from "../controller/department-controller";
import DashboardController from "../controller/dashboard-controller";
import { SectionController } from "../controller/section-controller";
import { OverviewController } from "../controller/overview-controller";
import amrutAachamanController, { uploadImage } from '../controller/amrut-aachaman-controller';
import { ApplicationController } from "../controller/Application-controller";
import { runDynamicQuery } from "./queryController";
import { getDashboardStats } from "../controller/dashboardController";
import { GroupController } from "../controller/group-controller";
import { TaskController } from "../controller/task-controller";
import { UploadController } from "../controller/upload-controller";
import { uploadAvatar, uploadSection, uploadDailyDarshan } from "../config/upload"; // 🎯 FIX: uploadDailyDarshan add karyu
import quoteController from "../controller/quote-controller";
import { uploadQuote } from "../config/upload";
import { ProgressController } from "../controller/progress-controller";
import { DailyDarshanController } from "../controller/dailyDarshan-Controller";
import upload from "../config/upload"; // 🚀 overview mate Cloudinary upload

const router = Router();
const userController = new UserController();
const roleController = new RoleController();
const departmentController = new DepartmentController();
const overviewController = new OverviewController();
const dashboardController = new DashboardController();
const dailyDarshanController = new DailyDarshanController();
const sectionController = new SectionController();
const applicationController = new ApplicationController();
const taskController = new TaskController();
const progressController = new ProgressController();
const groupController = new GroupController();
const uploadController = new UploadController();

router.post("/run-query", runDynamicQuery);
router.get("/dashboard/stats", getDashboardStats);

router.post("/upload/avatar", uploadAvatar.single("avatar"), uploadController.uploadImage.bind(uploadController));
router.post("/upload/section", uploadSection.single("image"), uploadController.uploadImage.bind(uploadController));


router.post("/tasks/create", taskController.createTask.bind(taskController));
router.put("/tasks/:id/status", taskController.updateTaskStatus.bind(taskController));
router.get("/tasks/user/:suid", taskController.getTasksByUser.bind(taskController));
router.delete("/tasks/:id", taskController.deleteTask.bind(taskController));

router.post("/quotes/create", uploadQuote.single("image"), quoteController.createQuote.bind(quoteController));
router.get("/quotes/type/:type", quoteController.getQuotesByType.bind(quoteController));
router.delete("/quotes/:id", quoteController.deleteQuote.bind(quoteController));

// 🎯 FIX: upload (default = uploadOverview) na badle uploadDailyDarshan vaparyu —
// have image "gurukul/daily-darshan" folder ma save thashe, "gurukul/overview" ma nahi
router.post("/daily-darshan", uploadDailyDarshan.single("image"), dailyDarshanController.create);
router.get("/daily-darshan", dailyDarshanController.getAll);
router.put("/daily-darshan/:id", uploadDailyDarshan.single("image"), dailyDarshanController.update);
router.delete("/daily-darshan/:id", dailyDarshanController.deleteById);

router.post("/groups/create", groupController.createGroup.bind(groupController));
router.get("/groups/list", groupController.getAllGroups.bind(groupController));
router.get("/groups/member/:suid", groupController.getGroupsByMember.bind(groupController));
router.get("/groups/:id", groupController.getGroupById.bind(groupController));
router.put("/groups/:id", groupController.updateGroup.bind(groupController));
router.delete("/groups/:id", groupController.deleteGroup.bind(groupController));

router.get("/progress/departments", progressController.getAllDepartmentsProgress.bind(progressController));
router.get("/progress/department/:id", progressController.getDepartmentProgress.bind(progressController));
router.get("/progress/section/:id", progressController.getSectionProgress.bind(progressController));
router.get("/progress/user/:suid", progressController.getUserProgress.bind(progressController));


router.post("/users/register", userController.registerUser.bind(userController));
router.post("/users/login", userController.loginUser.bind(userController));
router.get("/users", userController.allUser.bind(userController));
router.delete("/users/delete/:id", userController.userDelete.bind(userController));
router.get("/users/section/:sectionId", userController.getUsersBySection.bind(userController));
router.get("/users/pending", userController.getPendingUsers.bind(userController));
router.put("/users/approve/:id", userController.approveUser.bind(userController));


router.get("/dashboard", dashboardController.getDashboard.bind(dashboardController));

router.get("/overview", overviewController.getOverview.bind(overviewController));
router.post("/overview/update", upload.single("image"), overviewController.updateOverview.bind(overviewController));
router.delete("/overview/:id", overviewController.deleteOverviewImage.bind(overviewController));

router.get("/departments", departmentController.getAllDepartments.bind(departmentController));
router.post("/departments/create", departmentController.createDepartment.bind(departmentController));
router.put("/departments/:id", departmentController.updateDepartment.bind(departmentController));
router.get("/departments/:id", departmentController.getDepartmentById.bind(departmentController));
router.get("/departments/:id/users", departmentController.getUsersByDepartment.bind(departmentController));
router.delete("/departments/delete/:id", departmentController.deleteDepartment.bind(departmentController));


router.post("/sections/create", sectionController.createSection.bind(sectionController));
router.put("/sections/update/:id", sectionController.updateSection.bind(sectionController));
router.get("/sections", sectionController.getSections.bind(sectionController));
router.get("/sections/department/:departmentId", sectionController.getSectionsByDepartment.bind(sectionController));
router.get("/sections/:id", sectionController.getSectionById.bind(sectionController));
router.delete("/sections/:id", sectionController.deleteSection.bind(sectionController));

router.post("/roles/create", roleController.createRole.bind(roleController));
router.get("/roles", roleController.getAllRoles.bind(roleController));
router.put("/roles/:roleCode", roleController.updateRole.bind(roleController));

router.post("/applications/create", applicationController.createApplication.bind(applicationController));
router.get("/applications/types", applicationController.getApplicationTypes.bind(applicationController));

router.post('/amrut-aachaman', uploadImage.single('image'), amrutAachamanController.create);
router.get('/amrut-aachaman', amrutAachamanController.getAll);

export default router;