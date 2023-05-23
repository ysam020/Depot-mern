import React from "react";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { validationSchema } from "../schema/LoginSchema";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/users/users";

const LoginForm = (props) => {
  // const login = useLogin();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {
      dispatch(login(values)).then(() => {
        props.handleCloseModal();
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
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

      <Button fullWidth type="submit" className="submit-form-btn">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
