import React from "react";
import PropTypes from "prop-types";
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
  return (
    <DashboardBox title={"Sensor Data"}>
      <Box>
        <XYPlot height={400} width={700}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineSeries
            data={formatProduceData(sensorData)}
            color={"green"}
            strokeStyle="solid"
          />
          <LineSeries
            data={formatConsumeData(sensorData)}
            color={"red"}
            strokeStyle="solid"
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
