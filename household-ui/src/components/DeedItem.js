import React from "react";
import PropTypes from "prop-types";
import { Box, Text } from "grommet";
import { FastForward } from "grommet-icons";

const DeedItem = props => {
  return (
    <Box
      direction={"row"}
      align={"center"}
      justify={"evenly"}
      margin={{ vertical: "small" }}
      style={{ minHeight: "40px" }}
    >
      <Box width={"small"}>
        <Text truncate size={"small"}>
          {props.from}
        </Text>
      </Box>
      <Box direction={"column"} align={"center"}>
        <FastForward />
        <Text>{props.transferredEnergy} kWh</Text>
      </Box>
      <Box width={"small"}>
        <Text size={"small"} truncate>
          {props.to}
        </Text>
      </Box>
      <Text size={"small"}>{new Date(props.timestamp).toLocaleString()}</Text>
    </Box>
  );
};

DeedItem.propTypes = {
  timestamp: PropTypes.number,
  from: PropTypes.string,
  to: PropTypes.string,
  transferredEnergy: PropTypes.number
};

export default DeedItem;
