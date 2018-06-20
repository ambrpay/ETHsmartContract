var safeMathMock = artifacts.require("SafeMathMock.sol");

module.exports = function(deployer) {
    deployer.deploy(safeMathMock);
};