import React, { useState, useEffect } from "react";
import { Box } from "grommet";

import DashboardBox from "./DashboardBox";
import NetworkMeter from "./NetworkMeter";

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
      <Box
        direction={"row"}
        justify={"evenly"}
        align={"center"}
        height={"100%"}
      >
        <NetworkMeter
          total={networkStats.totalProducedRenewableEnergy}
          householdShare={householdStats.producedRenewableEnergy}
          totalLabel={"produced"}
          colors={["#00C781", "#55fcc2"]}
        />
        <NetworkMeter
          total={networkStats.totalEnergy}
          householdShare={householdStats.renewableEnergy}
          totalLabel={"balance"}
          colors={["#2dadfc", "#81fced"]}
        />
        <NetworkMeter
          total={networkStats.totalConsumedRenewableEnergy}
          householdShare={householdStats.consumedRenewableEnergy}
          totalLabel={"consumed"}
          colors={["#f94848", "#f9a7a7"]}
        />
      </Box>
    </DashboardBox>
  );
};

export default NetworkStats;
