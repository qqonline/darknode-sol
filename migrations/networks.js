const BN = require("bn.js");

const config = {
    MINIMUM_BOND: new BN(100000).mul(new BN(10).pow(new BN(18))),
    MINIMUM_POD_SIZE: 3, // 24 in production
    MINIMUM_EPOCH_INTERVAL: 2, // 14400 in production
    DARKNODE_PAYMENT_CYCLE_DURATION_SECONDS: 300, // 300 for testnet (5 minutes in seconds), 86400 in mainnet testing (1 day), 2628000 in production (1 month in seconds)
    mintAuthority: "", // Darknode public key
    shifterFees: 10,
}

module.exports = {
    mainnet: {
        RenToken: "0x408e41876cCCDC0F92210600ef50372656052a38",
        DarknodeSlasher: "0x0000000000000000000000000000000000000000",
        DarknodeRegistry: "0x34bd421C7948Bc16f826Fd99f9B785929b121633",
        DarknodeRegistryStore: "0x06df0657ba5e8f5339e742212669f6e7ee3c5057",
        DarknodePaymentStore: "0x731Ea4Ba77fF184d89dBeB160A0078274Acbe9D2",
        DarknodePayment: "0x5a7802E66b067cB1770ee5b1165AA201690A8B6a",
        tokens: {
            DAI: "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359",
            ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },

        BTCShifter: "",
        ZECShifter: "",
        ShifterRegistry: "",
        zZEC: "",
        zBTC: "",

        config: {
            ...config,
            mintAuthority: "TODO",
        },
    },
    testnet: {
        RenToken: "0x2cd647668494c1b15743ab283a0f980d90a87394",
        DarknodeSlasher: "0x0000000000000000000000000000000000000000",
        DarknodeRegistry: "0x1C6309618338D0EDf9a7Ea8eA18E060fD323020D",
        DarknodeRegistryStore: "0x88e4477e4fdd677aee2dc9376471d45c198669fa",
        DarknodePaymentStore: "0xA9411C3AD1fBE168fd119A3B32fB481a0b9877A9",
        DarknodePayment: "0x8E11B87547f4072CC8A094F2888201CAF4EA0B9e",
        tokens: {
            DAI: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
            ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },

        BTCShifter: "0xcAEd211A141BfbC7244F17a6dABeA7456b5E2Af5",
        ZECShifter: "0x65E967F51be974d002090BdC604C088B8b79Dbb3",
        zBTC: "0x7cf9A2de7D5e81e6d4372D9b20D27AB8267295d5",
        zZEC: "0x47b8941De0B214E0d18154B4fDa1DbE0d1484215",
        ShifterRegistry: "0x89aB0D4e64b1cb7F961228b70595a46BF0761546",

        config: {
            ...config,
            mintAuthority: "0xfEEA966136A436e44c96335455771943452728Fc",
        },
    },

    devnet: {
        RenToken: "0x2cd647668494c1b15743ab283a0f980d90a87394",
        DarknodeSlasher: "0xfe48363206E1849a2F53f5214af932354c35FD89",
        DarknodeRegistry: "0x6E1a6b85f05bfec5c24C7a26E302cB28e639651c",
        DarknodeRegistryStore: "0xC126a308dd07Adfa4a445686dcF7CbC423185593",
        DarknodePaymentStore: "0x6341DF1012E862f766Fcd72e0fCAAc5a3839CFef",
        DarknodePayment: "0x1f1b1d015Fc31d425C616cC35E39e31686DA69A8",
        tokens: {
            DAI: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
            ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },

        BTCShifter: "0x11172e0c457019Bec60f342c2171CF762D64Be18",
        ZECShifter: "0x12B0beA3b382237Fc5264C609e84fc7171de38F2",
        zBTC: "0xef44c39102Ab3479F271e2fb3F27dB56D13b7a42",
        zZEC: "0x5c67129a465Ae131CD47F97a4B57C6d0eEaFe2e6",
        ShifterRegistry: "0xA28cC8B81906D2A42beF0bF782CECe3b75f91E6b",

        config: {
            ...config,
            mintAuthority: "0x723eb4380E03dF6a6f98Cc1338b00cfBE5E45218",
        },
    },
    config,
}