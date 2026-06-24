import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller"; 
import { AdmissionController } from "../controller/admission-controller";
import { DepartmentController } from "../controller/department-controller";

const router = Router();
const userController = new UserController();
const roleController = new RoleController(); 
const admissionController = new AdmissionController();
const departmentController = new DepartmentController();

// 🔑 લોગિન અને યુઝર્સ રૂટ્સ
router.post("/users/login", userController.loginUser.bind(userController));
router.get("/users", userController.allUser.bind(userController));

// 🎯 રોલ્સ રૂટ્સ
router.post("/roles/create", roleController.createRole.bind(roleController));
router.get("/roles", roleController.getAllRoles.bind(roleController));

// 🏢 ડિપાર્ટમેન્ટ રૂટ્સ (બંને મેથડ્સ અહીં બાઇન્ડ કરી દીધી)
router.post("/departments/create", departmentController.createDepartment.bind(departmentController)); // ➕ નવું બનાવવા
router.get("/departments", departmentController.getAllDepartments.bind(departmentController));       // 🔍 બધો ડેટા મેળવવા

// 📝 એડમિશન રિક્વેસ્ટ રૂટ્સ
router.post("/admissions/create", admissionController.createRequest);
router.get("/admissions/pending", admissionController.getPendingRequests);
router.get("/admissions/approved", admissionController.getApprovedRequests);
router.post("/admissions/action/:id", admissionController.handleAction);

export default router;