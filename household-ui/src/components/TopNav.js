import React from "react";
import PropTypes from "prop-types";
import { Box, Text } from "grommet";

const TopNav = React.memo(({ address }) => {
  return (
    <Box
      fill
      direction={"row"}
      pad={"small"}
      background={"brand"}
      justify={"between"}
    >
      <Text>Decentralized Energy Trading</Text>
      <Text>{address}</Text>
    </Box>
  );
});

TopNav.propTypes = {
  address: PropTypes.string
};

export default TopNav;
