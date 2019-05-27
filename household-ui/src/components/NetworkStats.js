import React, { useState, useEffect } from "react";
import { Box } from "grommet";

import DashboardBox from "./DashboardBox";
import NetworkCircleMeter from "./NetworkCircleMeter";
import NetworkBarMeter from "./NetworkBarMeter";

import { fetchFromEndpoint } from "../helpers/fetch";

const NetworkStats = () => {
  const [householdStats, setHouseholdStats] = useState({
    producedRenewableEnergy: 0,
    consumedRenewableEnergy: 0,
    renewableEnergy: 0
  });
  const [networkStats, setNetworkStats] = useState({
    totalProducedRenewableEnergy: 0,
    totalEnergy: 0,
    totalConsumedRenewableEnergy: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [fetchedHouseholdStats, fetchedNetworkStats] = await Promise.all([
        fetchFromEndpoint(`/household-stats`),
        fetchFromEndpoint(`/network-stats`)
      ]);
      setHouseholdStats(fetchedHouseholdStats);
      setNetworkStats(fetchedNetworkStats);
    };
    fetchStats();
    const interval = setInterval(() => fetchStats(), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardBox title={"Network Overview"}>
      <Box>
        <NetworkBarMeter
          value={householdStats.producedRenewableEnergy}
          maxValue={
            Math.max(
              householdStats.producedRenewableEnergy,
              householdStats.consumedRenewableEnergy
            ) * 1.5
          }
          label={"Your total production"}
          color={"#55fcc2"}
        />
        <NetworkBarMeter
          value={householdStats.consumedRenewableEnergy}
          maxValue={
            Math.max(
              householdStats.producedRenewableEnergy,
              householdStats.consumedRenewableEnergy
            ) * 1.5
          }
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
          total={networkStats.totalProducedRenewableEnergy}
          householdShare={householdStats.producedRenewableEnergy}
          totalLabel={"network production"}
          colors={["#00C781", "#55fcc2"]}
        />
        <NetworkCircleMeter
          total={networkStats.totalEnergy}
          householdShare={householdStats.renewableEnergy}
          totalLabel={"network balance"}
          colors={["#2dadfc", "#81fced"]}
        />
        <NetworkCircleMeter
          total={networkStats.totalConsumedRenewableEnergy}
          householdShare={householdStats.consumedRenewableEnergy}
          totalLabel={"network consumption"}
          colors={["#f94848", "#f9a7a7"]}
        />
      </Box>
    </DashboardBox>
  );
};

export default NetworkStats;
