const { expect } = require("chai");

describe("Minter", function() {
    let minter, veloMock, votingEscrow, voter, rewardsDistributor, pool, managedRewardsFactory, forwarder, factoryRegistry;
    const WEEK = 604800;
    let owner, addr1, addr2, addrs;

    beforeEach(async function() {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const BalanceLogicLibrary = await ethers.getContractFactory("BalanceLogicLibrary");
        const balanceLogicLibraryInstance = await BalanceLogicLibrary.deploy();
        await balanceLogicLibraryInstance.deployed();

        const DelegationLogicLibrary = await ethers.getContractFactory("DelegationLogicLibrary");
        const delegationLogicLibraryInstance = await DelegationLogicLibrary.deploy();
        await delegationLogicLibraryInstance.deployed();

        const SafeCastLibrary = await ethers.getContractFactory("SafeCastLibrary");
        const safeCastLibrary = await SafeCastLibrary.deploy();
        await safeCastLibrary.deployed();

        // Создание фиктивных адресов
        const token1Address = ethers.Wallet.createRandom().address;
        const token2Address = ethers.Wallet.createRandom().address;
     
        console.log("Deploying VeloMock...");
const VeloMock = await ethers.getContractFactory("Velo");
veloMock = await VeloMock.deploy();
console.log("VeloMock deployed at:", veloMock.address);

console.log("Deploying PairFactory...");
const PairFactory = await ethers.getContractFactory("PairFactory");
pairFactory = await PairFactory.deploy();
console.log("PairFactory deployed at:", pairFactory.address);

console.log("Deploying ManagedRewardsFactory...");
const ManagedRewardsFactory = await ethers.getContractFactory("ManagedRewardsFactory");
managedRewardsFactory = await ManagedRewardsFactory.deploy();
console.log("PairFactory deployed at:", managedRewardsFactory.address);
      
console.log("Deploying Pool...");
const Pool = await ethers.getContractFactory("Pool");
pool = await Pool.deploy();
console.log("Pool deployed at:", pool.address);

console.log("Deploying FactoryRegistry...");
const FactoryRegistry = await ethers.getContractFactory("FactoryRegistry");
factoryRegistry = await FactoryRegistry.deploy(pool.address, pool.address, pool.address, managedRewardsFactory.address);
console.log("FactoryRegistry deployed at:", factoryRegistry.address);
 
console.log("Deploying Forwarder...");
const Forwarder = await ethers.getContractFactory("Forwarder");
forwarder = await Forwarder.deploy();
console.log("Forwarder deployed at:", forwarder.address);      
      
console.log("Deploying VotingEscrow...");
const VotingEscrow = await ethers.getContractFactory("VotingEscrow", {
    libraries: {
        "contracts/libraries/BalanceLogicLibrary.sol:BalanceLogicLibrary": balanceLogicLibraryInstance.address,
        "contracts/libraries/DelegationLogicLibrary.sol:DelegationLogicLibrary": delegationLogicLibraryInstance.address
    }
});
votingEscrow = await VotingEscrow.deploy(forwarder.address, veloMock.address, factoryRegistry.address);
console.log("VotingEscrow deployed at:", votingEscrow.address);   
 
console.log("Deploying Voter...");
const Voter = await ethers.getContractFactory("Voter");
        voter = await Voter.deploy(forwarder.address, votingEscrow.address, factoryRegistry.address, pairFactory.address);
console.log("Voter deployed at:", voter.address);              
  
console.log("Deploying RewardsDistributor...");
const RewardsDistributor = await ethers.getContractFactory("RewardsDistributor");
rewardsDistributor = await RewardsDistributor.deploy(votingEscrow.address);
console.log("RewardsDistributor deployed at:", rewardsDistributor.address);       
      
console.log("Deploying MinterContract...");
const MinterContract = await ethers.getContractFactory("Minter");
        minter = await MinterContract.deploy(voter.address, votingEscrow.address, rewardsDistributor.address);
console.log("MinterContract deployed at:", minter.address);   
await voter.initialize([token1Address, token2Address], minter.address);


const currentMinter = await veloMock.minter();
console.log("Current Minter of Velo:", currentMinter);
const currentMinterrewardsDistributor = await rewardsDistributor.minter();
console.log("Current Minter of VerewardsDistributorlo:", currentMinterrewardsDistributor);
await rewardsDistributor.setMinter(minter.address);
 
        const initialSetupSupply = ethers.utils.parseEther("1000000"); // 1,000,000 Velo
       await veloMock.mint(owner.address, initialSetupSupply);       
       await veloMock.setMinter(minter.address);
    });

    it("Should test simultaneous updatePeriod calls", async function() {
      
     // Двигаем время на 1 неделю вперед
     await ethers.provider.send("evm_increaseTime", [WEEK]);
     await ethers.provider.send("evm_mine");

     const oldTotalSupply = await veloMock.totalSupply();

     // Делаем два быстрых последовательных вызова updatePeriod
     const tx1Promise = minter.updatePeriod();
     const tx2Promise = minter.connect(addr1).updatePeriod();

     const tx1 = await tx1Promise;
     const tx2 = await tx2Promise;

     await tx1.wait();
     await tx2.wait();

     const newTotalSupply = await veloMock.totalSupply();

     // Проверяем, что общее количество не изменилось больше, чем на двойную недельную эмиссию
     const expectedIncrease = ethers.utils.parseEther("2");
     const actualIncrease = newTotalSupply.sub(oldTotalSupply);
     expect(actualIncrease).to.be.lte(expectedIncrease);

    });
});
