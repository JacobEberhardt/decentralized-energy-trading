import React, { useState, useEffect } from "react";
import { Box } from "grommet";
import {
  XYPlot,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis
} from "react-vis";

import DashboardBox from "./DashboardBox";

import { fetchFromEndpoint } from "../helpers/fetch";

const formatProduceData = rawData => {
  return rawData.map(({ produce, timestamp }) => {
    return {
      y: produce,
      x: timestamp
    };
  });
};

const formatConsumeData = rawData => {
  return rawData.map(({ consume, timestamp }) => {
    return {
      y: consume,
      x: timestamp
    };
  });
};

const HouseholdStats = () => {
  const [producedEnergy, setProducedEnergy] = useState([]);
  const [consumedEnergy, setConsumedEnergy] = useState([]);

  useEffect(() => {
    const fetchHouseholdData = async () => {
      const data = await fetchFromEndpoint("/household-stats");
      setProducedEnergy(formatProduceData(data));
      setConsumedEnergy(formatConsumeData(data));
    };
    fetchHouseholdData();
    // TODO: Do polling
    // const interval = setInterval(() => {
    //   fetchHouseholdData();
    // }, 1000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <DashboardBox title={"Household Stats"}>
      <Box>
        <XYPlot height={400} width={700}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineSeries
            data={producedEnergy}
            color={"green"}
            strokeStyle="solid"
          />
          <LineSeries data={consumedEnergy} color={"red"} strokeStyle="solid" />
          <XAxis
            title={"time"}
            attr="x"
            attrAxis="y"
            orientation="bottom"
            tickFormat={d => new Date(d).toLocaleDateString()}
          />
          <YAxis title={"kWh"} />
        </XYPlot>
      </Box>
    </DashboardBox>
  );
};

export default HouseholdStats;
