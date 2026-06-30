// 📂 ફાઈલ પાથ: app/route/Routes.ts
import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller"; 
import { DepartmentController } from "../controller/department-controller";
import DashboardController from "../controller/dashboard-controller";
import { SectionController } from "../controller/section-controller"; // 👑 નવો ઇમ્પોર્ટ
import { OverviewController } from "../controller/overview-controller"; 
import amrutAachamanController, { uploadImage } from '../controller/amrut-aachaman-controller';

const router = Router();
const userController = new UserController();
const roleController = new RoleController(); 
const departmentController = new DepartmentController();
const overviewController = new OverviewController();
const dashboardController = new DashboardController();
const sectionController = new SectionController(); // 👑 નવો ઇન્સ્ટન્સ

router.get("/overview", overviewController.getOverview.bind(overviewController));
router.post("/overview/update", overviewController.updateOverview.bind(overviewController));
router.post('/amrut-aachaman', uploadImage.single('image'), amrutAachamanController.create);
router.get('/amrut-aachaman', amrutAachamanController.getAll);


router.post("/users/register", userController.registerUser.bind(userController));
router.post("/users/login", userController.loginUser.bind(userController));

router.get("/dashboard", dashboardController.getDashboard.bind(dashboardController));

router.get("/departments", departmentController.getAllDepartments.bind(departmentController));
router.post("/departments/create", departmentController.createDepartment.bind(departmentController));

// 👑 Section Routes (તમારા પ્રોજેક્ટની ડિઝાઇન પેટર્ન મુજબ સેટ કરેલા રાઉટ્સ)
router.post("/sections/create", sectionController.createSection.bind(sectionController));
router.get("/sections", sectionController.getSections.bind(sectionController));
router.get("/sections/:id", sectionController.getSectionById.bind(sectionController));

router.get("/users", userController.allUser.bind(userController));

router.post("/roles/create", roleController.createRole.bind(roleController));
router.get("/roles", roleController.getAllRoles.bind(roleController));

export default router;