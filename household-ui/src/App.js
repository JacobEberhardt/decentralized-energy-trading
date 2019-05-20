import React from "react";
import { Grommet, Box } from "grommet";
import { grommet } from "grommet/themes";

import TopNav from "./components/TopNav";
import HouseholdStats from "./components/HouseholdStats";
import NetworkStats from "./components/NetworkStats";
import DeedsTicker from "./components/DeedsTicker";
import Savings from "./components/Savings";

function App() {
  return (
    <Grommet theme={grommet}>
      <TopNav />
      <Box pad={"medium"} direction={"row"} wrap justify={"around"}>
        <HouseholdStats />
        <NetworkStats />
        <DeedsTicker />
        <Savings />
      </Box>
    </Grommet>
  );
}

export default App;
