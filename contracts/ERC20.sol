pragma solidity ^0.4.24;


/**
 * @title Partial ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract Transferable {
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
}
