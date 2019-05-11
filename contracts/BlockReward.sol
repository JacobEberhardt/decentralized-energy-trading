// Copyright 2018 Parity Technologies (UK) Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

pragma solidity ^0.5.0;

import "./IBlockReward.sol";
import "./IUtility.sol";


contract BlockReward is IBlockReward {
  // Amount of eth that is rewarded to block producers
  uint256 public constant REWARD_AMOUNT = 10000000000000000 wei;
  // Address of utility contract
  address public constant UTILITY_CONTRACT = 0x0000000000000000000000000000000000000042;
  // Interval in blocks when netting function should be triggered
  uint8 public constant NETTING_INTERVAL = 5;

  uint256 public latestNettingBlockNumber = 0;

  modifier onlySystem {
    require(
      msg.sender == 0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE,
      "BlockReward: caller is not sytem"
    );
    _;
  }

  /**
   * @dev Produce reward for given benefectors with corresponding reward codes.
   *      Only callable by `SYSTEM_ADDRESS`.
   * @param benefectors Validator addresses
   * @param kind Reward codes
   * @return Validator addresses with respective rewards.
   */
  function reward(address[] calldata benefactors, uint16[] calldata kind)
    external
    onlySystem
    returns (address[] memory, uint256[] memory)
  {
    require(
      benefactors.length == kind.length,
      "BlockReward: length mismatch of benefactors and kind"
    );

    uint256[] memory rewards = new uint256[](benefactors.length);

    for (uint i = 0; i < rewards.length; i++) {
      rewards[i] = REWARD_AMOUNT;
    }

    if (block.number - latestNettingBlockNumber >= NETTING_INTERVAL) {
      latestNettingBlockNumber = block.number;
      IUtility utility = IUtility(UTILITY_CONTRACT);
      utility.settle();
    }

    return (benefactors, rewards);
  }
}
