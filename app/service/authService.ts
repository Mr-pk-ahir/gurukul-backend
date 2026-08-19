import { UserService } from "./user-service";
import bcrypt from "bcrypt";

const userService = new UserService();

export const loginUser = async (username: string, password: string) => {
  // 1. યુઝર શોધો
  const user = await userService.findUserByUsername(username);

  if (!user) {
    return { success: false, message: "યુઝર મળ્યો નથી!" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { success: false, message: "ખોટો પાસવર્ડ!" };
  }

  if (user.status !== "APPROVED") {
    return { success: false, message: "તમારું એકાઉન્ટ હજુ Approved નથી." };
  }

  // 🎯 FIX: ફ્રન્ટએન્ડના AuthUser ના Type મુજબ બધો જ ડેટા મોકલો
  return {
    success: true,
    message: "Login Successful!",
    user: {
      id: user.suid,               // Frontend માં id ની જરૂર પડે છે
      suid: user.suid,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      roleCode: user.roleCode,     // 🎯 Role Code એડ કર્યો
      roleName: user.roleName,     // 🎯 Role Name એડ કર્યો
      permissions: user.permissions, // 🎯 મુખ્ય વસ્તુ: Permissions મોકલી!
      departmentId: user.departmentId,
      sectionId: user.sectionId
    }
  };
};