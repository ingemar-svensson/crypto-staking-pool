import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require('dotenv').config()

const StakingPoolModule = buildModule("StakingPoolModule", (m) => {

  const cxtAddress = process.env.CXT_ADDRESS;
  const carbonCreditAddress = process.env.CARBON_CREDIT_ADDRESS;
  const stakingPool = m.contract("StakingPool", [cxtAddress!, carbonCreditAddress!]);
  return { stakingPool };

});

export default StakingPoolModule;