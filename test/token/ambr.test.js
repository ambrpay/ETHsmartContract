const assertRevert = require('../helpers/assertRevert');

const ambr = artifacts.require('ambr');

contract('ambr', function([subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        const amount = 100;
        this.contract = await ambr.new();
        const { logs } = await this.contract.send(11111, { from: subscriber });
        console.log(logs[0].args, subscriber);
        await this.contract.addSubscription(recipient, 1, '0x0', 300, 1000, { from: subscriber });
        const o = await this.contract.getSubscrition(0, { from: subscriber });
        const p = await this.contract.getETHBalance(subscriber, { from: subscriber });
        console.log(o, p);
    });



    describe('withdrawETHForSubscription', function() {

        it('throws no error', async function() {

            const { logs } = await this.contract.withdrawETHForSubscription(0, 123, { from: recipient });
            console.log(logs[0].args);
            // assert.equal(logs.length, 1);
            // assert.equal(logs[0].event, 'Approval');
            // assert.equal(logs[0].args.owner, owner);
            // assert.equal(logs[0].args.spender, spender);
            // assert(logs[0].args.value.eq(amount));
            assert(true);
        });

    });

});