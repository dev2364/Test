import * as dotenv from "dotenv";

import "@nomicfoundation/hardhat-toolbox";


dotenv.config();



export default {
  
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    tenderly: {
        username: "velodrome-finance",
        project: "v2",
        privateVerification: false
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    typechain: {
        outDir: "artifacts/types",
        target: "ethers-v5"
    }
};