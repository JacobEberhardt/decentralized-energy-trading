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
          maxValue={props.householdMeterReading}
          label={"Meter reading"}
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
          label={"Community Balance"}
          color={props.networkEnergyBalance >= 0 ? "#55fcc2" : "#f9a7a7"}
        />
        <NetworkCircleMeter
          value={Number(props.meterChange)}
          label={"Meter Change"}
          color={props.meterChange >= 0 ? "#55fcc2" : "#f9a7a7"}
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
