import React from "react";
import PropTypes from "prop-types";

import DashboardBox from "./DashboardBox";
import DeedItem from "./DeedItem";

const DeedsTicker = React.memo(({ deeds }) => {
  return (
    <DashboardBox title={"Deeds Ticker"}>
      {deeds.map(deed => (
        <DeedItem
          key={deed._id}
          from={deed.from}
          to={deed.to}
          amount={deed.amount}
          timestamp={deed.timestamp}
        />
      ))}
    </DashboardBox>
  );
});

DeedsTicker.propTypes = {
  deeds: PropTypes.arrayOf(PropTypes.object)
};

export default DeedsTicker;
