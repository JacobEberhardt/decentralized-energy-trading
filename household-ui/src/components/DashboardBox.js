import React from "react";
import { Box, Text } from "grommet";

const DashboardBox = ({ title, children }) => {
  return (
    <Box margin={{ vertical: "medium" }} basis={"large"}>
      <Box pad={"small"} elevation={"small"} round>
        <Text
          weight={"bold"}
          alignSelf={"center"}
          margin={{ vertical: "small" }}
        >
          {title}
        </Text>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardBox;
