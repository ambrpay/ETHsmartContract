pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./ERC20.sol";

contract TokenPayable {
    using SafeMath for uint256;

    event fallback(address indexed from, uint256 value, bytes data);

    event payedOut(uint256 i,
                   address indexed from,
                   address indexed to,
                   address indexed tokenContract,
                   uint256 ambrSubscriptionPlanId,
                   uint256 amount);

    function getTokenBalance(address _tokenContract) view public returns (uint256) {
        ERC20 token = ERC20(_tokenContract);
        return token.allowance(msg.sender, address(this));
    }

   
}
