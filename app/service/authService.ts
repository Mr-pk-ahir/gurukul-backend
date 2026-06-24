// app/service/authService.ts
import { UserService } from "./user-service";
import bcrypt from "bcrypt";

const userService = new UserService();

export const loginUser = async (username: string, password: string) => {
  // 1. યુઝર શોધો
  const user = await userService.findUserByUsername(username);

  if (!user) {
    return { success: false, message: "યુઝર મળ્યો નથી!" };
  }

  // 2. પાસવર્ડ મેચ કરો
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { success: false, message: "ખોટો પાસવર્ડ!" };
  }

  // 3. સ્ટેટસ ચેક કરો (જો જરૂર હોય તો)
  if (user.status !== "APPROVED") {
    return { success: false, message: "તમારું એકાઉન્ટ હજુ Approved નથી." };
  }

  // 4. સક્સેસ રિસ્પોન્સ (અહીં તમે JWT ટોકન જનરેટ કરી શકો છો)
  return {
    success: true,
    message: "Login Successful!",
    user: {
      suid: user.suid,
      name: user.name,
      username: user.username,
      avatar: user.avatar
    }
    // token: "your-jwt-token-here"
  };
};