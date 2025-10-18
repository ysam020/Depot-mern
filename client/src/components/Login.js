import React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LoginForm from "../forms/LoginForm";
import RegisterForm from "../forms/RegisterForm";
import useLoginTabs from "../customHooks/loginTabs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function Login(props) {
  const { value, TabPanel, a11yProps, handleChange } = useLoginTabs();

  return (
    <div>
      <Modal
        open={props.openModal}
        onClose={props.handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* <Box sx={{ width: "100%" }}> */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="login-tabs">
              <Tab label="Login" {...a11yProps(0)} />
              <Tab label="Register" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel
            value={value}
            index={0}
            sx={{ width: "100%", padding: "0 !important" }}
          >
            <LoginForm handleCloseModal={props.handleCloseModal} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <RegisterForm handleCloseModal={props.handleCloseModal} />
          </TabPanel>
        </Box>
      </Modal>
    </div>
  );
}
