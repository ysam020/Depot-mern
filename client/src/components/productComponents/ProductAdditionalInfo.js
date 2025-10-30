import React from "react";
import Box from "@mui/material/Box";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { Container } from "react-bootstrap";
import useProductAdditionalInfo from "../../customHooks/productAdditionalInfo";

function ProductAdditionalInfo(props) {
  const { value, StyledTabs, StyledTab, handleChange } =
    useProductAdditionalInfo();

  return (
    <Container className="additional-info">
      <Box
        sx={{
          width: "100%",
          typography: "body1",
          border: "1px solid #e1e1e1",
        }}
      >
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "#e1e1e1",
            }}
          >
            <StyledTabs
              value={value}
              onChange={handleChange}
              aria-label="styled tabs example"
            >
              <StyledTab label="Description" value="1" />
              <StyledTab label="Additional Information" value="2" />
            </StyledTabs>
          </Box>
          <Box sx={{ padding: "30px 0" }}>
            <TabPanel value="1">
              <h3>Description</h3>
              {props.data?.description}
            </TabPanel>
            <TabPanel value="2">
              <h3>Additional Information</h3>
              <span className="product-info-heading">
                Weight: {props.data?.weight}
              </span>
              <br />
              <span className="product-info-heading">
                Dimensions: {props.data?.dimensions}
              </span>
              <br />
              <span className="product-info-heading">
                Color: {props.data?.color}
              </span>
              <br />
              <span className="product-info-heading">
                Material: {props.data?.material}
              </span>
              <br />
            </TabPanel>
          </Box>
        </TabContext>
      </Box>
    </Container>
  );
}

export default ProductAdditionalInfo;
