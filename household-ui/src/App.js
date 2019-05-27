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
  const [householdStats, setHouseholdStats] = useState({});
  const [networkStats, setNetworkStats] = useState({});
  const [sensorData, setSensorData] = useState([]);
  const [deeds, setDeeds] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return fetchFromEndpoint(`/sensor-stats?from=${date.getTime()}`);
    };

    const fetchDeeds = async () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      return fetchFromEndpoint(`/deeds?from=${date.getTime()}`);
    };

    const fetchData = async () => {
      const fetchedData = await Promise.all([
        fetchFromEndpoint(`/household-stats`),
        fetchFromEndpoint(`/network-stats`),
        fetchSensorData(),
        fetchDeeds()
      ]);
      setHouseholdStats(fetchedData[0]);
      setNetworkStats(fetchedData[1]);
      setSensorData(fetchedData[2]);
      setDeeds(fetchedData[3]);
    };

    fetchData();
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grommet theme={grommet}>
      <TopNav address={householdStats.address} />
      <Box
        pad={"medium"}
        direction={"row"}
        wrap
        justify={"around"}
        background={{ color: "light-2" }}
      >
        <SensorStats sensorData={sensorData} />
        <NetworkStats
          producedEnergyByHousehold={householdStats.producedRenewableEnergy}
          consumedEnergyByHousehold={householdStats.consumedRenewableEnergy}
          balanceOfHousehold={householdStats.renewableEnergy}
          producedEnergyByNetwork={networkStats.totalProducedRenewableEnergy}
          consumedEnergyByNetwork={networkStats.totalConsumedRenewableEnergy}
          balanceOfNetwork={networkStats.totalEnergy}
        />
        <DeedsTicker deeds={deeds} />
        <Savings deeds={deeds} />
      </Box>
    </Grommet>
  );
}

export default App;
