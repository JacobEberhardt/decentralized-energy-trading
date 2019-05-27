import React from "react";
import PropTypes from "prop-types";
import { Box, Stack, Meter, Text } from "grommet";

const NetworkBarMeter = ({ maxValue, value, color, label }) => {
  return (
    <Box align="center" pad="medium">
      <Stack anchor="center">
        <Meter
          type="bar"
          values={[
            {
              value,
              color
            }
          ]}
          max={maxValue}
          size="medium"
          thickness="65px"
          background={"light-3"}
        />
        <Box align="center">
          <Text size={"xsmall"}>{label}</Text>
          <Box direction="row" align="center">
            <Text size="xxlarge" weight="bold">
              {value}
            </Text>
            <Text>kWh</Text>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

NetworkBarMeter.propTypes = {
  maxValue: PropTypes.number,
  value: PropTypes.number,
  color: PropTypes.string,
  label: PropTypes.string
};

export default NetworkBarMeter;
