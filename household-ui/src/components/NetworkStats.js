import React from "react";
import PropTypes from "prop-types";
import { Box } from "grommet";

import DashboardBox from "./DashboardBox";
import NetworkCircleMeter from "./NetworkCircleMeter";
import NetworkBarMeter from "./NetworkBarMeter";

const NetworkStats = React.memo(
  ({
    producedEnergyByHousehold,
    consumedEnergyByHousehold,
    balanceOfHousehold,
    producedEnergyByNetwork,
    consumedEnergyByNetwork,
    balanceOfNetwork
  }) => {
    const maxBarMeterValue =
      Math.max(producedEnergyByHousehold, consumedEnergyByHousehold) * 1.5;
    return (
      <DashboardBox title={"Network Overview"}>
        <Box>
          <NetworkBarMeter
            value={producedEnergyByHousehold}
            maxValue={maxBarMeterValue}
            label={"Your total production"}
            color={"#55fcc2"}
          />
          <NetworkBarMeter
            value={consumedEnergyByHousehold}
            maxValue={maxBarMeterValue}
            label={"Your total consumption"}
            color={"#f9a7a7"}
          />
        </Box>
        <Box
          direction={"row"}
          justify={"evenly"}
          align={"center"}
          height={"100%"}
        >
          <NetworkCircleMeter
            total={producedEnergyByNetwork}
            householdShare={producedEnergyByHousehold}
            totalLabel={"network production"}
            colors={["#00C781", "#55fcc2"]}
          />
          <NetworkCircleMeter
            total={balanceOfNetwork}
            householdShare={balanceOfHousehold}
            totalLabel={"network balance"}
            colors={["#2dadfc", "#81fced"]}
          />
          <NetworkCircleMeter
            total={consumedEnergyByNetwork}
            householdShare={consumedEnergyByHousehold}
            totalLabel={"network consumption"}
            colors={["#f94848", "#f9a7a7"]}
          />
        </Box>
      </DashboardBox>
    );
  }
);

NetworkStats.propTypes = {
  producedEnergyByHousehold: PropTypes.number,
  consumedEnergyByHousehold: PropTypes.number,
  balanceOfHousehold: PropTypes.number,
  producedEnergyByNetwork: PropTypes.number,
  consumedEnergyByNetwork: PropTypes.number,
  balanceOfNetwork: PropTypes.number
};

export default NetworkStats;
