import React from "react";
import PropTypes from "prop-types";
import { Box, Stack, Meter, Text } from "grommet";

const NetworkCircleMeter = ({ value = 0, color, label }) => {
  return (
    <Box align="center" pad="large">
      <Stack anchor="center">
        <Meter
          type="circle"
          values={[
            {
              value,
              color
            }
          ]}
          max={value}
          size="small"
          thickness="medium"
        />
        <Box align="center">
          <Box direction="row" align="center" pad={{ bottom: "xsmall" }}>
            <Text size="xxlarge" weight="bold">
              {value.toFixed(2)}
            </Text>
            <Text>kWh</Text>
          </Box>
          <Text size={"xsmall"}>{label}</Text>
        </Box>
      </Stack>
    </Box>
  );
};

NetworkCircleMeter.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  color: PropTypes.string
};

export default NetworkCircleMeter;
