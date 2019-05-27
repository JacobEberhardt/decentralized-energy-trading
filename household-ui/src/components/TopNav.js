import React, { useState, useEffect } from "react";
import { Box, Text } from "grommet";

import { fetchFromEndpoint } from "../helpers/fetch";

const TopNav = () => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function fetchAddress() {
      const { address } = await fetchFromEndpoint("/household-stats");
      setAddress(address);
    }
    fetchAddress();
  }, []);

  return (
    <Box fill direction={"row"} pad={"small"} background={"brand"} justify={"between"}>
      <Text>Decentralized Energy Trading</Text>
      <Text>{address}</Text>
    </Box>
  );
};

export default TopNav;
