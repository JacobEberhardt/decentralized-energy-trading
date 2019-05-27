import React from "react";
import PropTypes from "prop-types";
import { Box } from "grommet";
import {
  XYPlot,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  DiscreteColorLegend
} from "react-vis";

import DashboardBox from "./DashboardBox";

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

const SensorStats = React.memo(({ sensorData }) => {
  const range = sensorData
    .map(({ consume, produce }) => [consume, produce])
    .flat();
  return (
    <DashboardBox title={"Sensor Data"}>
      <Box>
        <DiscreteColorLegend
          colors={["green", "red"]}
          items={["produced energy", "consumed energy"]}
          orientation="horizontal"
        />
        <XYPlot
          height={350}
          width={700}
          yDomain={[0, Math.max(...range) * 1.3]}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineSeries
            data={formatProduceData(sensorData)}
            color={"green"}
            strokeStyle="solid"
            strokeWidth={3}
            opacity={0.5}
          />
          <LineSeries
            data={formatConsumeData(sensorData)}
            color={"red"}
            strokeStyle="solid"
            strokeWidth={3}
            opacity={0.5}
          />
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
});

SensorStats.propTypes = {
  sensorData: PropTypes.arrayOf(PropTypes.object)
};

export default SensorStats;
