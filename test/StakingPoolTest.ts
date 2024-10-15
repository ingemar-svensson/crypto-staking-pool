import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockAsset, MockToken } from "../typechain-types";
import { expect } from "chai";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { StakingPool } from "../typechain-types/contracts/StakingPool";
import { time } from "@nomicfoundation/hardhat-network-helpers";

chai.should();
chai.use(sinonChai);

describe("StakingPool", function () {
  let token: MockToken;
  let asset: MockAsset;
  let stakingPool: StakingPool;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  const oneDay = 3600 * 24;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    token = (await MockTokenFactory.deploy()) as MockToken;
    await token.waitForDeployment();

    const MockAssetFactory = await ethers.getContractFactory("MockAsset");
    asset = (await MockAssetFactory.deploy()) as MockAsset;
    await asset.waitForDeployment();

    const StakingPoolFactory = await ethers.getContractFactory("StakingPool");
    stakingPool = (await StakingPoolFactory.deploy(token.getAddress(), asset.getAddress())) as StakingPool;
    await asset.waitForDeployment();
    await token.transfer(addr1, 1000);
    await token.transfer(addr2, 1000);
  });

  it("Should add assets", async function () {
    expect(await stakingPool.addAssets(100)).to.emit(stakingPool, "AssetsAdded")
    expect(await stakingPool.totalAssets()).to.equal(100);
  });

  it("Should stake and withdraw", async function () {
    await expect(stakingPool.connect(addr1).stake(100)).to.emit(stakingPool, "Staked");
    expect((await stakingPool.getStake(addr1)).balance).to.equal(100);
    expect((await token.balanceOf(addr1))).to.equal(900);
    expect((await stakingPool.getStake(addr1)).transactions.length).to.equal(1);
    expect(await stakingPool.totalStaked()).to.equal(100);
    await expect(stakingPool.connect(addr1).withdraw(50)).to.emit(stakingPool, "Withdrawn");
    expect((await stakingPool.getStake(addr1)).balance).to.equal(50);
    expect((await token.balanceOf(addr1))).to.equal(950);
    expect((await stakingPool.getStake(addr1)).transactions.length).to.equal(2);
    expect(await stakingPool.totalStaked()).to.equal(50);
    expect((await stakingPool.getTransactions(addr1.address))[0][0]).to.equal(100);
    expect((await stakingPool.getTransactions(addr1.address))[0][2]).to.equal(0);
    expect((await stakingPool.getTransactions(addr1.address))[1][0]).to.equal(50);
    expect((await stakingPool.getTransactions(addr1.address))[1][2]).to.equal(1);
  });

  it("Should log transactions", async function () {
    await expect(stakingPool.connect(addr1).stake(100)).to.emit(stakingPool, "Staked");
    expect((await stakingPool.getTransactions(addr1.address))[0][0]).to.equal(100);
    expect((await stakingPool.getTransactions(addr1.address))[0][0]).to.equal(100);
  });

  it("Should count time", async function () {
    expect(stakingPool.timeCreated).to.not.equal(null);
    await time.increase(oneDay * 10);
    const stake = await stakingPool.stakes(owner);
  });

  it("Should create yield curve", async function () {
    expect(await stakingPool.stake(100)).to.emit(stakingPool, "Staked");
    expect(await stakingPool.addAssets(100)).to.emit(stakingPool, "AssetsAdded");
    expect(await stakingPool.totalAssets()).to.equal(100);
    expect(await stakingPool.addAssets(200)).to.emit(stakingPool, "AssetsAdded");
    expect(await stakingPool.totalAssets()).to.equal(300);
    expect((await stakingPool.getYields())[0][0]).to.equal(0);
    expect((await stakingPool.getYields())[1][0]).to.equal(27397260);
    expect((await stakingPool.getYields())[2][0]).to.equal(82191780);
    expect((await stakingPool.getYields())[1][1]).to.equal(273972);
    expect((await stakingPool.getYields())[2][1]).to.equal(821917);
  });

  it("Should calculate staking yield", async function () {
    await stakingPool.addAssets(1000);
    await stakingPool.stake(100);
    expect(await stakingPool.calculateStakeYield(owner.address)).to.equal(273972600);
    await time.increase(oneDay);
    await stakingPool.stake(100);
    expect(await stakingPool.calculateStakeYield(owner.address)).to.equal(547945200);
    await time.increase(oneDay);
    expect(await stakingPool.calculateStakeYield(owner.address)).to.equal(684931500);
    await time.increase(oneDay * 10);
    expect(await stakingPool.calculateStakeYield(owner.address)).to.equal(2054794500);
    //console.log(Number(await stakingPool.calculateStakeYield(owner.address)) / Number(10**8));
  });

  it("Should check owner verification", async function () {
    await expect(stakingPool.connect(addr1).addAssets(1)).to.be.revertedWith("Caller is not the owner");
    await expect(stakingPool.connect(addr1).removeAssets(1)).to.be.revertedWith("Caller is not the owner");
  });

  it("Should generate pool stats", async function () {
    await stakingPool.addAssets(1000);
    await stakingPool.connect(addr1).stake(100);
    await time.increase(oneDay * 10);
    const poolStats = await stakingPool.connect(addr1).getPoolData(addr1);
    expect(poolStats[0]).to.equal(1000);
    expect(poolStats[1]).to.equal(100);
    expect(poolStats[2]).to.equal(2739726);
    expect(poolStats[3]).to.equal(0);
    expect(poolStats[4]).to.equal(3013698600n);
    expect(poolStats[5]).to.equal(100);
  });


  it("Should find some view data", async function () {
    await stakingPool.addCarbonCredits(1000);
    for(let i = 0; i < 10; i++) {
      await stakingPool.connect(addr1).stake(i + 1);
    }
    expect((await stakingPool.getTransactions(addr1)).length).to.equal(10);

    await stakingPool.stake(100);
    await stakingPool.connect(addr2).stake(100);

  });

  afterEach(function () {
    sinon.restore();
  });

});
