import React, { useState, useEffect } from "react";
import { Grommet, Box } from "grommet";
import { grommet } from "grommet/themes";
import TopNav from "./components/TopNav";
import SensorStats from "./components/SensorStats";
import NetworkStats from "./components/NetworkStats";
import DeedsTicker from "./components/DeedsTicker";
import Savings from "./components/Savings";
import { fetchFromEndpoint } from "./helpers/fetch";
import { wsToKWh } from "./helpers/conversion";

function App() {
  const [householdStats, setHouseholdStats] = useState({});
  const [networkStats, setNetworkStats] = useState({});
  const [meterChange, setMeterChange] = useState({});
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
      ])
      .then(data => {
        //convert data from Ws to KWs
        data[0].value = wsToKWh(data[0].value);
        data[1].renewableEnergy = wsToKWh(data[1].renewableEnergy)
        data[1].nonRenewableEnergy = wsToKWh(data[1].nonRenewableEnergy)
        //assign latest meter change
        data[4] = wsToKWh(data[2][0].produce - data[2][0].consume)
        data[2] = data[2].map(entry => {
          entry.produce = wsToKWh(entry.produce)
          entry.consume = wsToKWh(entry.consume)
          return entry
        })
        data[3] = data[3].map(entry => {
          entry.amount = wsToKWh(entry.amount)
          return entry
        })
        return data
      })
      setHouseholdStats(fetchedData[0]);
      setNetworkStats(fetchedData[1]);
      setSensorData(fetchedData[2]);
      setDeeds(fetchedData[3]);
      setMeterChange(fetchedData[4])
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
          householdMeterReading={Number(householdStats.value)}
          meterChange={meterChange}
          networkEnergyBalance={networkStats.renewableEnergy - networkStats.nonRenewableEnergy}
        />
        <DeedsTicker deeds={deeds} />
        <Savings address={householdStats.address} deeds={deeds} />
      </Box>
    </Grommet>
  );
}

export default App;
