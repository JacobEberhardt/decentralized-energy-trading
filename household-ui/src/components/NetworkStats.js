import React, { useState, useEffect } from "react";
import { Box, Text } from "grommet";
import { XYPlot, HorizontalBarSeries, XAxis, YAxis } from "react-vis";

import DashboardBox from "./DashboardBox";

import { fetchFromEndpoint } from "../helpers/fetch";

const NetworkStats = () => {
  const [householdStats, setHouseholdStats] = useState({
    producedRenewableEnergy: 0,
    consumedRenewableEnergy: 0,
    renewableEnergy: 0
  });
  const [networkStats, setNetworkStats] = useState({
    
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

  console.log({ householdStats, networkStats });

  return (
    <DashboardBox title={"Household Overview"}>
      <Box align={"center"}>
        <Text
          size={"xxlarge"}
          weight={"bold"}
          color={householdStats.renewableEnergy < 0 && "red"}
        >
          {householdStats.renewableEnergy} kWh
        </Text>
        <Text size={"small"}>Energy Balance</Text>
      </Box>
      <Box>
        <XYPlot
          margin={{ left: 70 }}
          height={150}
          width={700}
          xDomain={[
            0,
            Math.max(
              householdStats.producedRenewableEnergy,
              householdStats.consumedRenewableEnergy
            ) * 1.3
          ]}
          yDomain={[0, 1]}
        >
          <HorizontalBarSeries
            data={[
              {
                x: householdStats.producedRenewableEnergy,
                y: 0
              },
              {
                x: householdStats.consumedRenewableEnergy,
                y: 1
              }
            ]}
            style={{}}
          />
          <XAxis title={"kWh"} orientation="bottom" tickTotal={5} />
          <YAxis
            tickTotal={2}
            tickFormat={d => (d === 0 ? "Produced" : "Consumed")}
          />
        </XYPlot>
      </Box>
    </DashboardBox>
  );
};

export default NetworkStats;
