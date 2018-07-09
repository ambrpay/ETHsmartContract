const assertRevert = require('../helpers/assertRevert');
const assertInvalidOpCode = require('../helpers/assertInvalidOpcode');
const time = require('../helpers/increaseTime');

const ambr = artifacts.require('ambr');
const ambrToken = artifacts.require('AmbrToken');

contract('ambr', function([subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await ambr.new();
    });



    describe('withdrawTokenForSubscription', function() {

        beforeEach(async function() {
            this.ambrToken = await ambrToken.new();
            await this.ambrToken.mint(subscriber, 10000, { from: subscriber });
            await this.ambrToken.approve(this.contract.address, 1000, { from: subscriber });
            await this.contract.addSubscription(recipient, 1, this.ambrToken.address, 30, 100, { from: subscriber });
        });

        it('has exactly 900 balance', async function() {
            const { logs } = await this.contract.withdrawTokenForSubscription(0, 100, { from: recipient });
            const o = await this.contract.getTokenBalance(this.ambrToken.address, { from: subscriber });
            const other = await this.ambrToken.balanceOf(recipient, { from: recipient });
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.i.toNumber(), 0);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.tokenContract, this.ambrToken.address);
            assert.equal(event.args.ambrSubscriptionPlanId.toNumber(), 1);
            assert.equal(event.args.amount.toNumber(), 100);
            assert.equal(o.toNumber(), 900);
            assert.equal(other.toNumber(), 100);
        });

        it('withdrawing 2x has exactly 900 balance', async function() {
            const first = await this.contract.withdrawTokenForSubscription(0, 50, { from: recipient });
            const second = await this.contract.withdrawTokenForSubscription(0, 50, { from: recipient });
            const o = await this.contract.getTokenBalance(this.ambrToken.address, { from: subscriber });
            const other = await this.ambrToken.balanceOf(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.i.toNumber(), 0);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.tokenContract, this.ambrToken.address);
            assert.equal(event.args.ambrSubscriptionPlanId.toNumber(), 1);
            assert.equal(event.args.amount.toNumber(), 50);
            assert.equal(event2.args.amount.toNumber(), 50);
            assert.equal(o.toNumber(), 900);
            assert.equal(other.toNumber(), 100);
        });

        it('withdrawing again after timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawTokenForSubscription(0, 100, { from: recipient });
            await time.increaseTimeTo(sub[4].toNumber() + time.duration.days(31));
            const second = await this.contract.withdrawTokenForSubscription(0, 100, { from: recipient });
            const o = await this.contract.getTokenBalance(this.ambrToken.address, { from: subscriber });
            const other = await this.ambrToken.balanceOf(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(!!event2, true);
            assert.equal(event.args.amount.toNumber(), 100);
            assert.equal(event2.args.amount.toNumber(), 100);
            assert.equal(o.toNumber(), 800);
            assert.equal(other.toNumber(), 200);
        });

        it('withdrawing too much fails', async function() {
            await assertRevert(this.contract.withdrawTokenForSubscription(0, 200, { from: recipient }));
        });

        it('withdrawing not enough allowance  fails', async function() {
            await this.contract.addSubscription(recipient, 1, this.ambrToken.address, 300, 10000, { from: subscriber });
            await assertRevert(this.contract.withdrawTokenForSubscription(1, 10000, { from: recipient }));
        });



        it('address is not a contract reverts', async function() {
            await this.contract.addSubscription(recipient, 1, anotherAccount, 300, 1000, { from: subscriber });
            await assertRevert(this.contract.withdrawTokenForSubscription(1, 100, { from: recipient }));
        });

        it('withdrawing from not approved subscription fails', async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
            await assertRevert(this.contract.withdrawTokenForSubscription(0, 100, { from: recipient }));
        });

        it('withdrawing from wrong address fails', async function() {
            await assertRevert(this.contract.withdrawTokenForSubscription(0, 100, { from: anotherAccount }));
        });

        it('withdrawing from inexistent subscription fails', async function() {
            await assertInvalidOpCode(this.contract.withdrawTokenForSubscription(1, 100, { from: anotherAccount }));
        });


    });

    describe('withdrawETHForSubscription', function() {

        beforeEach(async function() {
            this.ambrToken = await ambrToken.new();
            await this.contract.sendTransaction({ from: subscriber, value: 1000 });
            await this.contract.addSubscription(recipient, 1, '0x0', 30, 100, { from: subscriber });
        });

        it('has exactly 900 balance', async function() {
            const { logs } = await this.contract.withdrawETHForSubscription(0, 100, { from: recipient });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.i.toNumber(), 0);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.tokenContract, '0x0000000000000000000000000000000000000000');
            assert.equal(event.args.ambrSubscriptionPlanId.toNumber(), 1);
            assert.equal(event.args.amount.toNumber(), 100);
            assert.equal(o.toNumber(), 900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing 2x has exactly 900 balance', async function() {
            const first = await this.contract.withdrawETHForSubscription(0, 50, { from: recipient });
            const second = await this.contract.withdrawETHForSubscription(0, 50, { from: recipient });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(event.args.i.toNumber(), 0);
            assert.equal(event.args.from, subscriber);
            assert.equal(event.args.to, recipient);
            assert.equal(event.args.tokenContract, '0x0000000000000000000000000000000000000000');
            assert.equal(event.args.ambrSubscriptionPlanId.toNumber(), 1);
            assert.equal(event.args.amount.toNumber(), 50);
            assert.equal(event2.args.amount.toNumber(), 50);
            assert.equal(o.toNumber(), 900);
            assert.equal(other.toNumber(), 100);
        });


        it('withdrawing again after timeperiod has passed', async function() {
            const sub = await this.contract.getSubscrition(0, { from: subscriber });
            const first = await this.contract.withdrawETHForSubscription(0, 100, { from: recipient });
            await time.increaseTimeTo(sub[4].toNumber() + time.duration.days(31));
            const second = await this.contract.withdrawETHForSubscription(0, 100, { from: recipient });
            const o = await this.contract.getETHBalance(subscriber, { from: subscriber });
            const other = await this.contract.getETHBalance(recipient, { from: recipient });
            const event = first.logs.find(s => s.event === 'payedOut');
            const event2 = second.logs.find(s => s.event === 'payedOut');
            assert.equal(!!event, true);
            assert.equal(!!event2, true);
            assert.equal(event.args.amount.toNumber(), 100);
            assert.equal(event2.args.amount.toNumber(), 100);
            assert.equal(o.toNumber(), 800);
            assert.equal(other.toNumber(), 200);
        });


        it('withdrawing too much fails', async function() {
            await assertRevert(this.contract.withdrawETHForSubscription(0, 200, { from: recipient }));
        });

        it('withdrawing not in account  fails', async function() {
            await this.contract.addSubscription(recipient, 1, this.ambrToken.address, 30, 10000, { from: subscriber });
            await assertRevert(this.contract.withdrawETHForSubscription(1, 10000, { from: recipient }));
        });



        it('address is not the 0x0 address', async function() {
            await this.contract.addSubscription(recipient, 1, anotherAccount, 30, 1000, { from: subscriber });
            await assertRevert(this.contract.withdrawETHForSubscription(1, 100, { from: recipient }));
        });

        it('withdrawing from not approved subscription fails', async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
            await assertRevert(this.contract.withdrawETHForSubscription(0, 100, { from: recipient }));
        });

        it('withdrawing from wrong address fails', async function() {
            await assertRevert(this.contract.withdrawETHForSubscription(0, 100, { from: anotherAccount }));
        });

        it('withdrawing from inexistent subscription fails', async function() {
            await assertInvalidOpCode(this.contract.withdrawETHForSubscription(1, 100, { from: anotherAccount }));
        });


    });

    describe('withdrawETHForSubscription', function() {

        beforeEach(async function() {
            await this.contract.sendTransaction({ from: subscriber, value: 1000 });
        });

        it('emergencypayout all funds', async function() {
            await this.contract.emergencyPayout({ from: subscriber });
            const o = await this.contract.getTotalETHBalance();
            assert.equal(o.toNumber(), 0);
        });

        it('withdrawing from not owner address fails', async function() {
            await assertRevert(this.contract.emergencyPayout({ from: anotherAccount }));
        });
    });



});