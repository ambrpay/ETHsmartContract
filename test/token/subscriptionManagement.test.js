const assertRevert = require('../helpers/assertRevert');

const ambr = artifacts.require('ambr');

contract('subscriptionManagement', function([subscriber, recipient, anotherAccount]) {

    beforeEach(async function() {
        this.contract = await ambr.new();
        await this.contract.send(11111, { from: subscriber });
        await this.contract.addSubscription(recipient, 1, '0x0', 300, 1000, { from: subscriber });

    });

    describe('getSubscrition', function() {

        it('subscription has all correct attributes', async function() {

            const o = await this.contract.getSubscrition(0, { from: subscriber });
            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0x0000000000000000000000000000000000000000');
            assert.equal(o[2], '0xfc50098f9491e09d96877c034f6a3f3ee4aff3ae');
            assert.equal(o[3].toNumber(), 1);
            assert.equal(o[5].toNumber(), 300);
            assert.equal(o[6].toNumber(), 1000);
            assert.equal(o[7].toNumber(), 0);
            assert.equal(o[8], true);
            assert.equal(o[9], true);
        });

        it('anyone calling', async function() {

            const o = await this.contract.getSubscrition(0, { from: anotherAccount });
            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0x0000000000000000000000000000000000000000');
            assert.equal(o[2], '0xfc50098f9491e09d96877c034f6a3f3ee4aff3ae');
            assert.equal(o[3].toNumber(), 1);
            assert.equal(o[5].toNumber(), 300);
            assert.equal(o[6].toNumber(), 1000);
            assert.equal(o[7].toNumber(), 0);
            assert.equal(o[8], true);
            assert.equal(o[9], true);
        });

    });

    describe('getSubscriptionLength', function() {

        it('has 1 subscription', async function() {
            const o = await this.contract.getSubscriptionLength({ from: subscriber });
            assert.equal(o.toNumber(), 1);
        });

        it('anyone calling', async function() {
            const o = await this.contract.getSubscriptionLength({ from: anotherAccount });
            assert.equal(o.toNumber(), 1);
        });

        describe('adding a second Subscription', function() {
            it('has 2 subscriptions', async function() {
                await this.contract.addSubscription(recipient, 2, '0x0', 400, 100, { from: subscriber });
                const o = await this.contract.getSubscriptionLength({ from: subscriber });
                assert.equal(o.toNumber(), 2);
            });
        });

    });

    describe('addSubscription', function() {

        it('has correct event', async function() {
            const { logs } = await this.contract.addSubscription(recipient, 2, '0x0', 400, 100, { from: subscriber });
            const event = logs.find(s => s.event === 'subscriptionAdded');
            assert.equal(!!event, true);
            const args = event.args;
            assert.equal(args.id.toNumber(), 1);
            assert.equal(args.customer, '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(args.tokenContract, '0x0000000000000000000000000000000000000000');
            assert.equal(args.payoutAddress, '0xfc50098f9491e09d96877c034f6a3f3ee4aff3ae');
            assert.equal(args.ambrSubscriptionPlanId.toNumber(), 2);
            assert.equal(args.subscriptionTimeFrame.toNumber(), 400);
            assert.equal(args.maxAmount.toNumber(), 100);
            assert.equal(args.withdrawnAmount.toNumber(), 0);
            assert.equal(args.approved, true);

        });

    });



    describe('withdrawETHForSubscription', function() {

        it('throws no error', async function() {

            await this.contract.withdrawETHForSubscription(0, 123, { from: recipient });
            const o = await this.contract.getSubscrition(0, { from: subscriber });
            assert.equal(o[7].toNumber(), 123);
        });

    });

    describe('withdraw 2x', function() {

        it('has the correct withdrawnAmount in this cycle', async function() {

            await this.contract.withdrawETHForSubscription(0, 123, { from: recipient });
            await this.contract.withdrawETHForSubscription(0, 123, { from: recipient });
            const o = await this.contract.getSubscrition(0, { from: subscriber });
            assert.equal(o[7].toNumber(), 246);
            assert(true);
        });

    });

    describe('deactivate Subscription', function() {

        it('is deactivated', async function() {

            const { logs } = await this.contract.deactivateSubscription(0, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });
            const event = logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o[8], false);
        });

        describe('deactivate deactivated', function() {

            it('reverts', async function() {
                await this.contract.deactivateSubscription(0, { from: subscriber });
                await assertRevert(this.contract.deactivateSubscription(0, { from: subscriber }));
            });
        });

        describe('someone else deactivates', function() {
            it('reverts', async function() {
                await assertRevert(this.contract.deactivateSubscription(0, { from: anotherAccount }));
            });
        });

    });

    describe('activate Subscription', function() {

        beforeEach(async function() {
            await this.contract.deactivateSubscription(0, { from: subscriber });
        });

        it('is activated', async function() {

            const p = await this.contract.activateSubscription(0, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });

            const event = p.logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);
            assert.equal(o[8], true);
        });

        describe('activate activated', function() {

            it('reverts', async function() {
                await this.contract.activateSubscription(0, { from: subscriber });
                await assertRevert(this.contract.activateSubscription(0, { from: subscriber }));
            });
        });

        describe('someone else activates', function() {

            it('reverts', async function() {
                await assertRevert(this.contract.deactivateSubscription(0, { from: anotherAccount }));
            });
        });

    });

    describe('updateSubscription', function() {

        it('subscription has all correct updated Attributes', async function() {
            const { logs } = await this.contract.updateSubscription(0, '0x8d6f4be11122cf0f59fcac3b13939f03a964b385', 3, 50, { from: subscriber });
            const o = await this.contract.getSubscrition(0, { from: subscriber });

            const event = logs.find(s => s.event === 'subscriptionUpdated');
            assert.equal(!!event, true);
            assert.equal(event.args.id.toNumber(), 0);

            assert.equal(o[0], '0x47d61767f6893b435ab48da7aca93a22a912b3ff');
            assert.equal(o[1], '0x0000000000000000000000000000000000000000');
            assert.equal(o[2], '0x8d6f4be11122cf0f59fcac3b13939f03a964b385');
            assert.equal(o[3].toNumber(), 1);
            assert.equal(o[5].toNumber(), 3);
            assert.equal(o[6].toNumber(), 50);
            assert.equal(o[7].toNumber(), 0);
            assert.equal(o[8], true);
            assert.equal(o[9], true);
        });

        it('anyone calling', async function() {

            it('reverts', async function() {

                await assertRevert(this.contract.updateSubscription(0, '0x8d6f4be11122cf0f59fcac3b13939f03a964b385', 3, 50, { from: anotherAccount }));
            });
        });

    });

});