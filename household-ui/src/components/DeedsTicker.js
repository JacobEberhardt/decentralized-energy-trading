import React, { useState, useEffect } from "react";

import DashboardBox from "./DashboardBox";
import DeedItem from "./DeedItem";

import { fetchFromEndpoint } from "../helpers/fetch";

const DeedsTicker = () => {
  const [deeds, setDeeds] = useState([]);

  useEffect(() => {
    const fetchDeeds = async () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      const deeds = await fetchFromEndpoint(`/deeds?from=${date.getTime()}`);
      setDeeds(deeds);
    };
    fetchDeeds();
    const interval = setInterval(() => {
      fetchDeeds();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardBox title={"Deeds Ticker"}>
      {deeds.map(deed => (
        <DeedItem
          key={deed._id}
          from={deed.from}
          to={deed.to}
          transferredEnergy={deed.renewableEnergyTransferred}
          timestamp={deed.timestamp}
        />
      ))}
    </DashboardBox>
  );
};

export default DeedsTicker;
