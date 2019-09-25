import React from "react";
import PropTypes from "prop-types";
import {
  XYPlot,
  VerticalBarSeries,
  LabelSeries,
  DiscreteColorLegend
} from "react-vis";
import { Box, Text } from "grommet";
import { Trigger, Notes, Money } from "grommet-icons";

import DashboardBox from "./DashboardBox";

// in ct / kWh
const EEG_UMLAGE = 6.405;
// average energy costs incl. EEG Umlage
const ENERGY_COSTS = 29;

const convertToEur = cents => {
  return (cents / 100).toFixed(2);
};

const Savings = React.memo(({ address, deeds }) => {
  const totalReceivedEnergy = deeds
    .filter(deed => deed.to === address)
    .reduce((acc, deed) => (acc += deed.amount), 0);
  const costsWithUmlage = ENERGY_COSTS * totalReceivedEnergy;
  const costsWithoutUmlage = (ENERGY_COSTS - EEG_UMLAGE) * totalReceivedEnergy;
  const savings = EEG_UMLAGE * totalReceivedEnergy;
  const barChartData = [
    {
      x: 0,
      y: costsWithoutUmlage,
      label: `${convertToEur(costsWithoutUmlage)} EUR`
    },
    {
      x: 0,
      y: savings,
      label: `${convertToEur(savings)} EUR`
    }
  ];

  return (
    <DashboardBox title={"EEG Saving"}>
      <Box direction={"row"}>
        <Box pad={{ horizontal: "xlarge", top: "medium" }}>
          <XYPlot
            height={300}
            width={300}
            stackBy="y"
            xDomain={[0, 3]}
            yDomain={[0, costsWithUmlage]}
          >
            <VerticalBarSeries
              cluster="stack 1"
              data={[barChartData[0]]}
              color={"#81fced"}
            />
            <VerticalBarSeries
              cluster="stack 1"
              data={[barChartData[1]]}
              color={"#00C781"}
            />
            <LabelSeries data={barChartData} />
            <DiscreteColorLegend
              colors={["#00C781", "#81fced"]}
              items={["savings", "energy costs"]}
              orientation="horizontal"
            />
          </XYPlot>
        </Box>
        <Box justify={"evenly"}>
          <Box align={"center"}>
            <Box direction={"row"} align={"start"}>
              <Trigger size={"medium"} />
              <Text size={"xxlarge"} weight={"bold"}>
                {totalReceivedEnergy}
              </Text>
              <Text size={"medium"}>kWh</Text>
            </Box>
            <Text size={"small"}>total received energy</Text>
          </Box>
          <Box align={"center"}>
            <Box direction={"row"} align={"start"}>
              <Notes size={"medium"} />
              <Text size={"xxlarge"} weight={"bold"}>
                {convertToEur(costsWithoutUmlage)}
              </Text>
              <Text size={"medium"}>EUR</Text>
            </Box>
            <Text size={"small"}>total energy costs</Text>
          </Box>
          <Box align={"center"}>
            <Box direction={"row"} align={"start"}>
              <Money size={"medium"} />
              <Text size={"xxlarge"} weight={"bold"}>
                {convertToEur(savings)}
              </Text>
              <Text size={"medium"}>EUR</Text>
            </Box>
            <Text size={"small"}>total saved money</Text>
          </Box>
        </Box>
      </Box>
    </DashboardBox>
  );
});

Savings.propTypes = {
  address: PropTypes.string,
  deeds: PropTypes.arrayOf(PropTypes.object)
};

export default Savings;
