import { useState } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";

function useProductAdditionalInfo() {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const StyledTabs = styled((props) => (
    <Tabs
      {...props}
      TabIndicatorProps={{
        children: <span className="MuiTabs-indicatorSpan" />,
      }}
    />
  ))({
    "& .MuiTabs-indicator": {
      display: "flex",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    "& .MuiTabs-indicatorSpan": {
      maxWidth: 40,
      width: "100%",
    },
  });

  const StyledTab = styled((props) => <Tab {...props} />)(({ theme }) => ({
    textTransform: "none",
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    backgroundColor: "#fff",
    color: "#000",
    "&.Mui-selected": {
      color: "#fff",
      backgroundColor: "#000",
    },
  }));

  return { value, StyledTabs, StyledTab, handleChange };
}

export default useProductAdditionalInfo;
