import React from "react";
import { useFormik } from "formik";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import states from "../assets/data/States";
import MenuItem from "@mui/material/MenuItem";
import { validationSchema } from "../schema/BillingSchema";
import useSelectors from "../customHooks/useSelectors";
import { useDispatch } from "react-redux";
import { addAddress, fetchAddress } from "../redux/features/address/address";

function BillingForm(props) {
  const { email } = useSelectors();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      town: "",
      zip: "",
      state: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (address) => {
      dispatch(addAddress({ email, address })).then(() => {
        props.setPersonalDetails(address);
        props.setBillingFormSubmitted(true);
        dispatch(fetchAddress(email));
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <h4>Your Details</h4>
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

      <h4>Address Details</h4>
      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="addressLine1"
        name="addressLine1"
        label="Address Line 1"
        value={formik.values.addressLine1}
        onChange={formik.handleChange}
        error={
          formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)
        }
        helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
      />

      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="addressLine2"
        name="addressLine2"
        label="Address Line 2"
        value={formik.values.addressLine2}
        onChange={formik.handleChange}
        error={
          formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)
        }
        helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
      />

      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="town"
        name="town"
        label="Town"
        value={formik.values.town}
        onChange={formik.handleChange}
        error={formik.touched.town && Boolean(formik.errors.town)}
        helperText={formik.touched.town && formik.errors.town}
      />

      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="zip"
        name="zip"
        label="ZIP"
        value={formik.values.zip}
        onChange={formik.handleChange}
        error={formik.touched.zip && Boolean(formik.errors.zip)}
        helperText={formik.touched.zip && formik.errors.zip}
      />

      <TextField
        select
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="state"
        name="state"
        label="State"
        value={formik.values.state}
        onChange={formik.handleChange}
        error={formik.touched.state && Boolean(formik.errors.state)}
        helperText={formik.touched.state && formik.errors.state}
        defaultValue="Select a State"
      >
        {states.map((option, id) => (
          <MenuItem key={id} value={option.key}>
            {option.key}
          </MenuItem>
        ))}
      </TextField>

      <Button fullWidth type="submit" className="submit-form-btn">
        Proceed To Payment
      </Button>
    </form>
  );
}

export default BillingForm;
