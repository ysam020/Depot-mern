import * as yup from "yup";

const nameRegex = /^[aA-zZ\s]+$/;
const emailRegex =
  /[a-zA-Z0-9_]+(\.)?[a-zA-Z0-9_]+[@]{1}[a-zA-Z]+\.[a-zA-Z]{2,6}/;

export const validationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(1, "Name must be atleast 1 character")
    .max(25, "Maximun 25 Characters are allowed")
    .required("Please enter your name")
    .matches(nameRegex, "Name shouldn't include any special character"),

  email: yup
    .string()
    .email("Invalid email")
    .required("Please enter your email")
    .matches(emailRegex, "Invalid email"),

  password: yup.string("Enter a password").required("Password is required"),

  confirmPassword: yup
    .string("Enter a password")
    .required("Password is required"),
  //   .matches(password, "Passwords do not match"),
});
