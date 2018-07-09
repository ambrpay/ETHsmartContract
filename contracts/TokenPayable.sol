pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./ERC20.sol";

contract TokenPayable {
    using SafeMath for uint256;

    function getTokenBalance(address _tokenContract) view public returns (uint256) {
        ERC20 token = ERC20(_tokenContract);
        return token.allowance(msg.sender, address(this));
    }

   
}
