import { useFormik } from "formik";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import states from "../assets/data/States";
import MenuItem from "@mui/material/MenuItem";
import * as Yup from "yup";

// Updated validation schema with phone
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  addressLine1: Yup.string().required("Address Line 1 is required"),
  addressLine2: Yup.string(),
  town: Yup.string().required("Town is required"),
  zip: Yup.string()
    .matches(/^[0-9]{6}$/, "ZIP must be 6 digits")
    .required("ZIP is required"),
  state: Yup.string().required("State is required"),
});

function BillingForm(props) {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      town: "",
      zip: "",
      state: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (address) => {
      console.log("Form submitted with data:", address);
      props.setPersonalDetails(address);
      props.setBillingFormSubmitted(true);
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
        label="Full Name"
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
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        size="small"
        margin="dense"
        variant="filled"
        fullWidth
        id="phone"
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="10 digit mobile number"
        value={formik.values.phone}
        onChange={formik.handleChange}
        error={formik.touched.phone && Boolean(formik.errors.phone)}
        helperText={formik.touched.phone && formik.errors.phone}
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
        label="Address Line 2 (Optional)"
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
        label="Town/City"
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
        label="PIN Code"
        placeholder="6 digit PIN code"
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
      >
        <MenuItem value="" disabled>
          Select a State
        </MenuItem>
        {states.map((option, id) => (
          <MenuItem key={id} value={option.key}>
            {option.key}
          </MenuItem>
        ))}
      </TextField>

      <Button
        fullWidth
        type="submit"
        className="submit-form-btn"
        variant="contained"
        style={{ marginTop: "20px" }}
      >
        Continue to Payment
      </Button>
    </form>
  );
}

export default BillingForm;
