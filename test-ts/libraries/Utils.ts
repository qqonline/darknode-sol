
import { UtilsTestContract } from "../bindings/utils_test";

import * as testUtils from "../helper/testUtils";
import { BN } from "bn.js";

contract("Utils", function (accounts: string[]) {

    let utilsTest: UtilsTestContract;

    before(async function () {
        utilsTest = await artifacts.require("UtilsTest.sol").new();
    });

    it("can convert number to string", async function () {
        hexToAscii(await utilsTest.uintToBytes(0)).toString().should.equal("0");
        hexToAscii(await utilsTest.uintToBytes(32)).toString().should.equal("32");
        hexToAscii(await utilsTest.uintToBytes(57)).toString().should.equal("57");
        hexToAscii(await utilsTest.uintToBytes(10000)).toString().should.equal("10000");

        // -1 underflows to 2**256 - 1
        hexToAscii(await utilsTest.uintToBytes(-1))
            .should.equal((new BN(2)).pow(new BN(256)).sub(new BN(1)).toString());
    });

    // Doesn't replace verifying the function logic - but the function will
    // likely only be used for values up to 10'000 anyway.
    it.skip("[LONG] can convert numbers from 0 to 10'000 to string", async function () {
        for (let i = 0; i <= 10000; i++) {
            process.stdout.write(`\rConverting #${i}`);
            hexToAscii(await utilsTest.uintToBytes(i)).toString().should.equal(`${i}`);
        }
        console.log("");
    });

    it("can recover address from signature", async function () {
        const account = accounts[9];
        const id = testUtils.randomID();
        let signature = await web3.eth.sign(id, account);
        // Recover address
        (await utilsTest.addr(id, signature)).should.equal(account);
    });
});

const hexToAscii = (hex: string) => {
    return Buffer.from(hex.slice(2), "hex").toString();
};