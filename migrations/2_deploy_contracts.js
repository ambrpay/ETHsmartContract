var ambr = artifacts.require("./ambr.sol");

module.exports = function(deployer) {
    //deployer.deploy(ambr);
    var wallet;

    deployer.then(function() {
        return ambr.new();
    }).then(function(instance) {
        wallet = instance;
        console.log('ambr contract:', wallet.address);
    });
};