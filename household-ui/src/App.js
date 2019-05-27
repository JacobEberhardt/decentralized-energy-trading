import React, { useState, useEffect } from "react";
import { Grommet, Box } from "grommet";
import { grommet } from "grommet/themes";

import TopNav from "./components/TopNav";
import SensorStats from "./components/SensorStats";
import NetworkStats from "./components/NetworkStats";
import DeedsTicker from "./components/DeedsTicker";
import Savings from "./components/Savings";

import { fetchFromEndpoint } from "./helpers/fetch";

function App() {
  const [householdStats, setHouseholdStats] = useState({
    address: "",
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
    const fetchData = async () => {
      const [fetchedHouseholdStats, fetchedNetworkStats] = await Promise.all([
        fetchFromEndpoint(`/household-stats`),
        fetchFromEndpoint(`/network-stats`)
      ]);
      setHouseholdStats(fetchedHouseholdStats);
      setNetworkStats(fetchedNetworkStats);
    };
    fetchData();
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grommet theme={grommet}>
      <TopNav />
      <Box
        pad={"medium"}
        direction={"row"}
        wrap
        justify={"around"}
        background={{ color: "light-2" }}
      >
        <SensorStats />
        <NetworkStats
          producedEnergyByHousehold={householdStats.producedRenewableEnergy}
          consumedEnergyByHousehold={householdStats.consumedRenewableEnergy}
          balanceOfHousehold={householdStats.renewableEnergy}
          producedEnergyByNetwork={networkStats.totalProducedRenewableEnergy}
          consumedEnergyByNetwork={networkStats.totalConsumedRenewableEnergy}
          balanceOfNetwork={networkStats.totalEnergy}
        />
        <DeedsTicker />
        <Savings />
      </Box>
    </Grommet>
  );
}

export default App;
