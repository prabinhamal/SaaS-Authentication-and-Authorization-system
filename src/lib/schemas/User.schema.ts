import { z } from "zod";
import {
  AuthProvider,
} from "../../constants/user.constants";

// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

const RegisterUserSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "userName must be at leas 3 characters.")
    .max(50, "UserName cannot exveed 50 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "UserName can only contain letters, number and underscores",
    ),
  //   email: z.string().trim().toLowerCase().regex(emailRegex, {
  //     message: "Invalid eamil address"
  //   }),
  email: z
    .email("Invalid email address")
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(8).regex(passwordRegex, {
    message:
      "Password must contain uppercase, lowercase, number and special characters.",
  }),
  authProvider: z.enum(AuthProvider).default(AuthProvider.LOCAL),
}).strict();

export type RegisterUserInput = z.infer<
  typeof RegisterUserSchema
>;
