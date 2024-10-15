// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.17;

import "./ERC20/IERC20.sol";

contract MockAsset is IERC20 {

    mapping(address => uint256) public balances;

    constructor() {
      balances[msg.sender] = 200_000_000 * 10**18;
    }

    function totalSupply() external view override returns (uint256) {}

    function balanceOf(
        address account
    ) external view override returns (uint256) {
      return balances[account];
    }

    function transfer(
        address to,
        uint256 value
    ) external override returns (bool) {
      balances[to] += value;
      balances[msg.sender] -= value;
      return true;
    }

    function allowance(
        address owner,
        address spender
    ) external view override returns (uint256) {}

    function approve(
        address spender,
        uint256 value
    ) external override returns (bool) {}

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
      balances[from] -= value;
      balances[to] += value;
      return true;
    }
}