pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract ETHPayable {
    using SafeMath for uint256;
    event payedInETH(address indexed from,
                  uint256 amount);

    event withdrawnETH(address indexed customer,
                    uint256 amount);

    mapping (address => uint256) ethbalances;

    function () payable public {
        ethbalances[msg.sender] = ethbalances[msg.sender].add(msg.value);
        emit payedInETH(msg.sender, ethbalances[msg.sender]);
    }

    function getTotalETHBalance() view public returns (uint256) {
        return address(this).balance;
    }

    function withdrawETHFunds(uint256 amount) public {
        require(ethbalances[msg.sender]>=amount);
        ethbalances[msg.sender] = ethbalances[msg.sender].sub(amount);
        msg.sender.transfer(amount);
        emit withdrawnETH(msg.sender,amount);
    }

    function withdrawETHFundsTo(uint256 amount, address destination) public {
        require(ethbalances[msg.sender]>=amount);
        ethbalances[msg.sender] = ethbalances[msg.sender].sub(amount);
        destination.transfer(amount);
        emit withdrawnETH(msg.sender,amount);
    }


    function getETHBalance(address customer) view public returns (uint256) {
        return ethbalances[customer];
    }

   
}
