pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";
import "./ETHPayable.sol";
import "./TokenPayable.sol";
import "./SubscriptionManagement.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract Ambr is Ownable,ETHPayable,TokenPayable,SubscriptionManagement {
    using SafeMath for uint256;

    event payedOut(uint256 i,
                   address indexed from,
                   address indexed to,
                   address indexed tokenContract,
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
        require(msg.sender.send(_amount));
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
        require(ethbalances[s.customer]>=_amount);
        require(s.tokenContract == address(0));
        updateSubscriptionOnWithdrawl(i,_amount);

        Transferable token = Transferable(s.tokenContract);
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
