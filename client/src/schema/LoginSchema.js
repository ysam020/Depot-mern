import * as yup from "yup";

const emailRegex =
  /[a-zA-Z0-9_]+(\.)?[a-zA-Z0-9_]+[@]{1}[a-zA-Z]+\.[a-zA-Z]{2,6}/;

export const validationSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email")
    .required("Please enter your email")
    .matches(emailRegex, "Invalid email"),
  password: yup.string("Enter a password").required("Password is required"),
});
