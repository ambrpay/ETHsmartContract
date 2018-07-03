pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";
import "./SafeMath.sol";

contract SubscriptionManagement {
    using SafeMath for uint256;
    event subscriptionAdded(
        uint256 id, 
        address indexed customer,
        address indexed tokenContract,
        address indexed payoutAddress,
        uint256 ambrSubscriptionPlanId,
        uint256 cycleStart,
        uint256 subscriptionTimeFrame,
        uint256 maxAmount,
        uint256 withdrawnAmount,
        bool approved);

    Subscription[] subscriptions;

    struct Subscription {
        address customer; //customer that allowed for withdrawl
        address tokenContract; //Address of the erc20 tokencontract to withdraw from.
        address payoutAddress; //Address of the Business that can withdraw
        uint256 ambrSubscriptionPlanId; //SubscriptionPlan id on ambr
        uint256 cycleStart; //start of the subscription cycle
        uint256 subscriptionTimeFrame; //Length of the subscription (1 Month ususally)
        uint256 maxAmount; //Max amount that can be withdrawn in one timeframe
        uint256 withdrawnAmount; //Amount that has been withdrawn so far this timeframe
        bool approved; // true if the subscription is active
        bool exists; //to see if the subscription exists. (needed for tech workaround)
    }

     //adding a subscription
    function addSubscription (address _payoutAddress,
                            uint256 _ambrSubscriptionPlanId,
                            address _tokenContract,
                            uint256 _subscriptionTimeFrame,
                            uint256 _maxAmount) public returns(bool)
    {

        Subscription memory s;

        s.customer = msg.sender;
        s.tokenContract = _tokenContract;
        s.payoutAddress = _payoutAddress;
        s.ambrSubscriptionPlanId  = _ambrSubscriptionPlanId;
        s.cycleStart = block.timestamp;
        s.subscriptionTimeFrame = _subscriptionTimeFrame;
        s.maxAmount = _maxAmount;
        s.withdrawnAmount = 0;
        s.approved = true;
        s.exists = true;
        subscriptions.push(s);

        emit subscriptionAdded(
                subscriptions.length-1,
                s.customer,
                s.tokenContract,
                s.payoutAddress,
                s.ambrSubscriptionPlanId,
                s.cycleStart,
                s.subscriptionTimeFrame,
                s.maxAmount,
                s.withdrawnAmount,
                s.approved
            );
        return true;
    }


    function getSubscriptionLength() view public returns(uint256) {
        return subscriptions.length;
    }

    function getSubscrition(uint256 i) view public returns(address, address, address,uint256,uint256,uint256,uint256,uint256,bool,bool) {
        Subscription storage s = subscriptions[i];
        return (
            s.customer,
            s.tokenContract,
            s.payoutAddress,
            s.ambrSubscriptionPlanId,
            s.cycleStart,
            s.subscriptionTimeFrame,
            s.maxAmount,
            s.withdrawnAmount,
            s.approved,
            s.exists
        );
    }

    function updateSubscriptionOnWithdrawl(uint256 i,uint256 amount) internal {
        Subscription storage s = subscriptions[i];
        require(s.approved);
        require(s.payoutAddress == msg.sender);

        if(s.cycleStart+s.subscriptionTimeFrame<block.timestamp) {
            subscriptions[i].cycleStart = block.timestamp;
            subscriptions[i].withdrawnAmount = 0;
        }

        require(s.maxAmount>=amount+s.withdrawnAmount);
        subscriptions[i].withdrawnAmount.add(amount);

    }

    function deactivateSubscription(uint256 i) public {
        Subscription storage s = subscriptions[i];
        require(s.approved);
        require(s.customer == msg.sender);
        s.approved = false;
    }

    function activateSubscription(uint256 i) public {
        Subscription storage s = subscriptions[i];
        require(!s.approved);
        require(s.customer == msg.sender);
        s.approved = true;
    }

}
