import React from "react";
import PropTypes from "prop-types";

import DashboardBox from "./DashboardBox";
import TransferItem from "./TransferItem";

const TransfersTicker = React.memo(({ transfers }) => {
  return (
    <DashboardBox title={"Transfer Ticker"}>
      {transfers.map(transfer => (
        <TransferItem
          key={transfer._id}
          from={transfer.from}
          to={transfer.to}
          amount={Number(transfer.amount)}
          timestamp={transfer.timestamp}
        />
      ))}
    </DashboardBox>
  );
});

TransfersTicker.propTypes = {
  transfers: PropTypes.arrayOf(PropTypes.object)
};

export default TransfersTicker;
