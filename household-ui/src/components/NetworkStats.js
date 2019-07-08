import React from "react";
import PropTypes from "prop-types";
import { Box } from "grommet";

import DashboardBox from "./DashboardBox";
import NetworkCircleMeter from "./NetworkCircleMeter";
import NetworkBarMeter from "./NetworkBarMeter";

const NetworkStats = props => {
  return (
    <DashboardBox title={"Network Overview"}>
      <Box>
        <NetworkBarMeter
          value={props.householdMeterReading}
          maxValue={props.householdMeterReading * 1.5}
          label={"Your submitted meter reading"}
          color={props.householdMeterReading >= 0 ? "#55fcc2" : "#f9a7a7"}
        />
      </Box>
      <Box
        direction={"row"}
        justify={"evenly"}
        align={"center"}
        height={"100%"}
      >
        <NetworkCircleMeter
          value={props.networkEnergyBalance}
          label={"network energy balance"}
          color={"#00C781"}
        />
        <NetworkCircleMeter
          value={props.householdEnergyBalance}
          label={"your energy balance"}
          color={"#55fcc2"}
        />
      </Box>
    </DashboardBox>
  );
};

NetworkStats.propTypes = {
  householdMeterReading: PropTypes.number,
  householdEnergyBalance: PropTypes.number,
  networkEnergyBalance: PropTypes.number
};

export default NetworkStats;
