const assertRevert = require('../helpers/assertRevert');

const ambr = artifacts.require('ambr');
const ambrToken = artifacts.require('AmbrToken');

contract('Token Payable', function([subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await ambr.new();
        this.ambrToken = await ambrToken.new();
        await this.ambrToken.mint(subscriber, 10000, { from: subscriber });
        await this.ambrToken.approve(this.contract.address, 1000, { from: subscriber });
        await this.contract.addSubscription(subscriber, 1, this.ambrToken.address, 300, 1000, { from: subscriber });
    });


    describe('getTokenBalance', function() {

        it('has exactly 1000 balance', async function() {
            const o = await this.contract.getTokenBalance(this.ambrToken.address, { from: subscriber });
            assert.equal(o.toNumber(), 1000);
        });

        it('other account has 0 balance', async function() {
            const o = await this.contract.getTokenBalance(this.ambrToken.address, { from: anotherAccount });
            assert.equal(o.toNumber(), 0);
        });

    });



});