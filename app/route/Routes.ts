import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller";
import { DepartmentController } from "../controller/department-controller";
import DashboardController from "../controller/dashboard-controller";
import { SectionController } from "../controller/section-controller";
import { OverviewController } from "../controller/overview-controller";
import amrutAachamanController, { uploadImage } from '../controller/amrut-aachaman-controller';
import { ApplicationController } from "../controller/Application-controller";
import upload from "../config/upload"; // 🚀 navu import - overview mate Cloudinary upload

const router = Router();
const userController = new UserController();
const roleController = new RoleController();
const departmentController = new DepartmentController();
const overviewController = new OverviewController();
const dashboardController = new DashboardController();
const sectionController = new SectionController();
const applicationController = new ApplicationController();

router.post("/users/register", userController.registerUser.bind(userController));
router.post("/users/login", userController.loginUser.bind(userController));
router.get("/users", userController.allUser.bind(userController));
router.delete("/users/delete/:id", userController.userDelete.bind(userController));
router.get("/users/section/:sectionId", userController.getUsersBySection.bind(userController));
router.get("/users/pending", userController.getPendingUsers.bind(userController));
router.put("/users/approve/:id", userController.approveUser.bind(userController));


router.get("/dashboard", dashboardController.getDashboard.bind(dashboardController));

router.get("/overview", overviewController.getOverview.bind(overviewController));
router.post("/overview/update", upload.single("image"), overviewController.updateOverview.bind(overviewController)); // 🚀 upload middleware add karyu
router.delete("/overview/:id", overviewController.deleteOverviewImage.bind(overviewController)); // 🚀 navu route

router.get("/departments", departmentController.getAllDepartments.bind(departmentController));
router.post("/departments/create", departmentController.createDepartment.bind(departmentController));
router.get("/departments/:id", departmentController.getDepartmentById.bind(departmentController));
router.get("/departments/:id/users", departmentController.getUsersByDepartment.bind(departmentController));
router.delete("/departments/delete/:id", departmentController.deleteDepartment.bind(departmentController));


router.post("/sections/create", sectionController.createSection.bind(sectionController));
router.put("/sections/update/:id", sectionController.updateSection.bind(sectionController)); // 🆕 add
router.get("/sections", sectionController.getSections.bind(sectionController));
router.get("/sections/department/:departmentId", sectionController.getSectionsByDepartment.bind(sectionController)); // 🆕 add
router.get("/sections/:id", sectionController.getSectionById.bind(sectionController));
router.delete("/sections/:id", sectionController.deleteSection.bind(sectionController));

router.post("/roles/create", roleController.createRole.bind(roleController));
router.get("/roles", roleController.getAllRoles.bind(roleController));

router.post("/applications/create", applicationController.createApplication.bind(applicationController));
router.get("/applications/types", applicationController.getApplicationTypes.bind(applicationController));

router.post('/amrut-aachaman', uploadImage.single('image'), amrutAachamanController.create);
router.get('/amrut-aachaman', amrutAachamanController.getAll);

export default router;