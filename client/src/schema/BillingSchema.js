import * as yup from "yup";

const nameRegex = /^[aA-zZ\s]+$/;

const emailRegex =
  /[a-zA-Z0-9_]+(\.)?[a-zA-Z0-9_]+[@]{1}[a-zA-Z]+\.[a-zA-Z]{2,6}/;

const zipRegex = /[\d]{6}/;

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

  addressLine1: yup.string().required("Please enter your address"),

  addressLine2: yup.string().required("Please enter your address"),

  town: yup.string().required("Please enter your city"),

  zip: yup
    .string("Invalid ZIP")
    .min(6, "ZIP must b 6 characters")
    .matches(zipRegex, "Invalid ZIP")
    .required("Please enter your ZIP code"),

  state: yup.string().required("Please select a state"),
});
