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

const SensorStats = () => {
  const [producedEnergy, setProducedEnergy] = useState([]);
  const [consumedEnergy, setConsumedEnergy] = useState([]);

  useEffect(() => {
    const fetchSensordData = async () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const data = await fetchFromEndpoint(
        `/sensor-stats?from=${date.getTime()}`
      );
      setProducedEnergy(formatProduceData(data));
      setConsumedEnergy(formatConsumeData(data));
    };
    fetchSensordData();
    const interval = setInterval(() => {
      fetchSensordData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardBox title={"Sensor Data"}>
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
            tickFormat={d => new Date(d).toLocaleTimeString()}
            tickTotal={5}
          />
          <YAxis title={"kWh"} />
        </XYPlot>
      </Box>
    </DashboardBox>
  );
};

export default SensorStats;
