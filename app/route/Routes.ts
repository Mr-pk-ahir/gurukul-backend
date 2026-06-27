// 📂 ફાઈલ પાથ: app/route/Routes.ts
import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller"; 
import { AdmissionController } from "../controller/admission-controller";
import { DepartmentController } from "../controller/department-controller"
import DashboardController from "../controller/dashboard-controller";

const router = Router();
const userController = new UserController();
const roleController = new RoleController(); 
const admissionController = new AdmissionController();
const departmentController = new DepartmentController();
const dashboardController = new DashboardController();


router.post("/users/register", userController.registerUser.bind(userController));
router.post("/users/login", userController.loginUser.bind(userController));

router.get("/dashboard",dashboardController.getDashboard.bind(dashboardController));

router.get("/departments", departmentController.getAllDepartments.bind(departmentController));
router.post("/departments/create", departmentController.createDepartment.bind(departmentController));

router.get("/users", userController.allUser.bind(userController));

router.post("/roles/create", roleController.createRole.bind(roleController));
router.get("/roles", roleController.getAllRoles.bind(roleController));

router.post("/admissions/create", admissionController.createRequest);
router.get("/admissions/pending", admissionController.getPendingRequests);
router.get("/admissions/approved", admissionController.getApprovedRequests);
router.post("/admissions/action/:id", admissionController.handleAction);

export default router;