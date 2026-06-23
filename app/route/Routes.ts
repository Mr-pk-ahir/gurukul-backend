// 📂 ફાઈલ પાથ: app/route/Routes.ts
import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { RoleController } from "../controller/role-controller"; 
import { authenticateToken, requirePermission } from "../middleware/auth-middleware";
import { AdmissionController } from "../controller/admission-controller";

const router = Router();
const userController = new UserController();
const roleController = new RoleController(); 
const admissionController = new AdmissionController();

router.post("/users/register", userController.registerUser.bind(userController));
router.post("/users/login", userController.loginUser.bind(userController));

router.get("/users", authenticateToken, requirePermission("Users", "view"), userController.allUser.bind(userController));

router.post("/roles/create", authenticateToken, requirePermission("Roles & Permissions", "create"), roleController.createRole.bind(roleController));

router.get("/roles", authenticateToken, roleController.getAllRoles.bind(roleController));

router.post("/admissions/create", admissionController.createRequest); // નવી રિક્વેસ્ટ મોકલવા
router.get("/admissions/pending", admissionController.getPendingRequests); // પેન્ડિંગ રિક્વેસ્ટ લિસ્ટ મેળવવા
router.get("/admissions/approved", admissionController.getApprovedRequests); // એપ્રુવ્ડ રિક્વેસ્ટ લિસ્ટ મેળવવા
router.post("/admissions/action/:id", admissionController.handleAction); // એપ્રુવ કે રિજેક્ટ (ડિલીટ) એક્શન માટે

export default router;