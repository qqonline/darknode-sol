import { BN } from "bn.js";

import {
    MINIMUM_BOND, PUBK, waitForEpoch, increaseTime,
} from "./helper/testUtils";


import { DarknodePaymentStoreArtifact, DarknodePaymentStoreContract } from "./bindings/darknode_payment_store";
import { DarknodeRegistryArtifact, DarknodeRegistryContract } from "./bindings/darknode_registry";
import { DarknodePaymentArtifact, DarknodePaymentContract } from "./bindings/darknode_payment";
import { ERC20Artifact, ERC20Contract } from "./bindings/erc20";
import { RepublicTokenArtifact, RepublicTokenContract } from "./bindings/republic_token";

import { DARKNODE_PAYMENT_CYCLE_DURATION } from "../migrations/config";

const RepublicToken = artifacts.require("RepublicToken") as RepublicTokenArtifact;
const ERC20 = artifacts.require("DAIToken") as ERC20Artifact;
const DarknodePaymentStore = artifacts.require("DarknodePaymentStore") as DarknodePaymentStoreArtifact;
const DarknodePayment = artifacts.require("DarknodePayment") as DarknodePaymentArtifact;
const DarknodeRegistry = artifacts.require("DarknodeRegistry") as DarknodeRegistryArtifact;

const hour = 60 * 60;
const day = 24 * hour;

const CYCLE_DURATION = DARKNODE_PAYMENT_CYCLE_DURATION * day;

contract("DarknodePayment", (accounts: string[]) => {

    let store: DarknodePaymentStoreContract;
    let dai: ERC20Contract;
    let dnr: DarknodeRegistryContract;
    let dnp: DarknodePaymentContract;
    let ren: RepublicTokenContract;

    const owner = accounts[0];
    const darknode1 = accounts[1];
    const darknode2 = accounts[2];
    const darknode3 = accounts[3];

    before(async () => {
        ren = await RepublicToken.deployed();
        dai = await ERC20.deployed();
        dnr = await DarknodeRegistry.deployed();
        store = await DarknodePaymentStore.deployed();
        dnp = await DarknodePayment.deployed();

        // [ACTION] Register
        // Don't register a darknode under account[0]
        for (let i = 1; i < accounts.length; i++) {
            await ren.transfer(accounts[i], MINIMUM_BOND);
            await ren.approve(dnr.address, MINIMUM_BOND, { from: accounts[i] });
            // Register the darknodes under the account address
            await dnr.register(accounts[i], PUBK(i), { from: accounts[i] });
        }

        // Wait for two epochs for darknodes to be registered
        await waitForCycle(2 * day);

        new BN(await store.darknodeWhitelistLength()).should.bignumber.equal(new BN(0));
    });

    afterEach(async () => {
        await waitForCycle();
    });

    it("cannot blacklist invalid addresses", async () => {
        const invalidAddress = "0x0"
        await store.isBlacklisted(invalidAddress).should.eventually.be.false;
        await dnp.blacklist(invalidAddress).should.be.rejectedWith(null, /not a registered darknode/);
        await store.isBlacklisted(owner).should.eventually.be.false;
        await dnp.blacklist(owner).should.be.rejectedWith(null, /not a registered darknode/);
    })

    it("should reject white/blacklist attempts from non-store contract", async () => {
        await store.isBlacklisted(darknode1).should.eventually.be.false;
        await dnp.blacklist(darknode1, { from: darknode1 }).should.be.rejectedWith(null, /not DarknodeJudge/);
        await store.isBlacklisted(darknode1).should.eventually.be.false;
        await store.isWhitelisted(darknode1).should.eventually.be.false;
        await store.whitelist(darknode1, new BN(1), { from: darknode1 }).should.be.rejectedWith(null, /not DarknodePaymentStore/);
        await store.isWhitelisted(darknode1).should.eventually.be.false;
    })

    it("can blacklist darknodes", async () => {
        await store.isBlacklisted(darknode1).should.eventually.be.false;
        await dnp.blacklist(darknode1);
        await store.isBlacklisted(darknode1).should.eventually.be.true;
    })

    it("cannot blacklist already blacklisted darknodes", async () => {
        await store.isBlacklisted(darknode1).should.eventually.be.true;
        await dnp.blacklist(darknode1).should.be.rejectedWith(null, /already blacklisted/);
        await store.isBlacklisted(darknode1).should.eventually.be.true;
    })

    it("cannot whitelist blacklisted darknodes", async () => {
        await store.isBlacklisted(darknode1).should.eventually.be.true;
        await dnp.blacklist(darknode1).should.be.rejectedWith(null, /already blacklisted/);
        await dnp.claim(darknode1).should.be.rejectedWith(null, /darknode is blacklisted/);
    })

    it("can whitelist darknodes", async () => {
        await waitForCycle();
        new BN(await store.darknodeWhitelistLength()).should.bignumber.equal(new BN(0));
        await store.isWhitelisted(darknode2).should.eventually.be.false;
        await dnp.claim(darknode2);
        await store.isWhitelisted(darknode2).should.eventually.be.true;
        await waitForCycle();
        new BN(await store.darknodeWhitelistLength()).should.bignumber.equal(new BN(1));
    })

    it("cannot whitelist already whitelisted darknodes", async () => {
        // FIXME: Unimplemented
    })

    const waitForCycle = async (seconds=CYCLE_DURATION) => {
        const numEpochs = Math.floor(seconds / (1 * day));
        await increaseTime(seconds);
        for (let i = 0; i < numEpochs; i++) {
            await waitForEpoch(dnr);
        }
        if (seconds >= CYCLE_DURATION) {
            await dnp.changeCycle();
        }
    }

});
