pragma solidity ^0.4.24;



contract Destroyable {
 
  bool destroyed = false;
 

  modifier isNotDestroyed() {
    require(!destroyed);
     _;
  }

}
