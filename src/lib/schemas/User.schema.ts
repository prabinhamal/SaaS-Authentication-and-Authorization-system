import { z } from "zod";


// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

export const RegisterUserSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "userName must be at leas 3 characters.")
    .max(50, "UserName cannot exveed 50 characters.")
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "UserName can only contain letters, number and underscores",
    ),
  //   email: z.string().trim().toLowerCase().regex(emailRegex, {
  //     message: "Invalid eamil address"
  //   }),
  email: z
    .email("Invalid email address")
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(6).regex(passwordRegex, {
    message:"Password must contain uppercase, lowercase, number and special characters.",
  }),
  rememberMe: z.boolean().optional(),
}).strict();


export const LoginUserSchema = z.object({
  email: z.email("Invalid email address")
  .transform((email)=> email.toLowerCase().trim()),
  password: z.string(),
  remamberMe: z.boolean().optional().default(false),
}).strict()

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6).regex(passwordRegex, {
    message: "Password must contain uppercase, lowercase, number and special characters.",
  })
}).strict()

export type RegisterUserInput = z.infer<
  typeof RegisterUserSchema
>;

export type LoginUserInput = z.infer<
typeof LoginUserSchema
>

export type ResetpasswordInput = z.infer<
typeof resetPasswordSchema
>
