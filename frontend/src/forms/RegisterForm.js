import React from "react";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import { useFormik } from "formik";
import { validationSchema } from "../schema/RegisterSchema";
import useRegister from "../customHooks/register";

const RegisterForm = (props) => {
  const register = useRegister();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {
      register(values, props.handleCloseModal);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="name"
        name="name"
        label="Name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="email"
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        type="password"
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="password"
        name="password"
        label="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <TextField
        type="password"
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={
          formik.touched.confirmPassword &&
          Boolean(formik.errors.confirmPassword)
        }
        helperText={
          formik.touched.confirmPassword && formik.errors.confirmPassword
        }
      />

      <Button fullWidth type="submit" className="submit-form-btn">
        Register
      </Button>
    </form>
  );
};

export default RegisterForm;
