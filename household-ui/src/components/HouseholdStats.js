import React from "react";
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

const data = [
  {x: 0, y: 8},
  {x: 1, y: 5},
  {x: 2, y: 4},
];

const data2 = [
  {x: 0, y: 7},
  {x: 1, y: 8},
  {x: 2, y: 1},
];

const HouseholdStats = () => {
  return (
    <DashboardBox title={"Household Stats"}>
      <Box alignContent={"center"}>
        <XYPlot height={400} width={600}>
          <LineSeries data={data} color={"green"} />
          <LineSeries data={data2} color={"red"} />
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis title={"time"} />
          <YAxis title={"kWh"} />
        </XYPlot>
      </Box>
    </DashboardBox>
  );
};

export default HouseholdStats;
