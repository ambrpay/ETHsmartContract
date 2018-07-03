pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";
import "./ETHPayable.sol";
import "./TokenPayable.sol";
import "./SubscriptionManagement.sol";
import "./SafeMath.sol";

contract Ambr is Ownable,ETHPayable,TokenPayable,SubscriptionManagement {
    using SafeMath for uint256;

    event payedOut(uint256 i,
                   address from,
                   address to,
                   address tokenContract,
                   uint256 ambrSubscriptionPlanId,
                   uint256 amount);
    
    constructor() public {
        owner = msg.sender;
    }

    function withdrawETHForSubscription(uint256 i,uint256 _amount) public returns (bool) {
        Subscription storage s =  subscriptions[i];
        require(ethbalances[s.customer]>=_amount);
        require(s.tokenContract == address(0));
        updateSubscriptionOnWithdrawl(i,_amount);
        
        ethbalances[s.customer] = ethbalances[s.customer].sub(_amount);
        ethbalances[msg.sender] = ethbalances[msg.sender].add(_amount);
        emit payedOut(
            i,
            s.customer,
            msg.sender,
            s.tokenContract,
            s.ambrSubscriptionPlanId,
            _amount
            );
           return true;
    }

    function withdrawTokenForSubscription(uint256 i,uint256 _amount) public returns (bool) {
        Subscription storage s =  subscriptions[i];
        updateSubscriptionOnWithdrawl(i,_amount);

        ERC20 token = ERC20(s.tokenContract);
        require(token.transferFrom(s.customer,s.payoutAddress,_amount));
        emit payedOut(
            i,
            s.customer,
            msg.sender,
            s.tokenContract,
            s.ambrSubscriptionPlanId,
            _amount
            );
        return true;
    }

}
