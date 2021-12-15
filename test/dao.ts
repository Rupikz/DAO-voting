import { expect } from "chai";
import { ethers } from "hardhat";

describe("DAO", function () {
  const decimals = 18;

  this.beforeEach(async function () {
    const Contract = await ethers.getContractFactory("DAO");
    const contract = await Contract.deploy("Nikolai", "NIC", decimals);
    await contract.deployed();
    const [sender, recipient, account] = await ethers.getSigners();
    const zeroSender = await ethers.getSigner(ethers.constants.AddressZero);
    this.sender = sender;
    this.recipient = recipient;
    this.account = account;
    this.zeroSender = zeroSender;
    this.contract = contract;

    await this.contract.mint(this.sender.address, 1000);
  });

  it("Deposit", async function () {
    expect(await this.contract.balanceOf(this.sender.address)).to.equal(1000);
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(0);
    await this.contract.deposit(100);
    expect(await this.contract.balanceOf(this.sender.address)).to.equal(900);
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(
      100
    );
    await expect(this.contract.deposit(1000)).to.be.revertedWith(
      "DAO: transfer amount exceeds balance"
    );
  });

  it("Withdraw", async function () {
    await expect(this.contract.withdraw(1000)).to.be.revertedWith(
      "DAO: transfer amount exceeds vote balance"
    );
    await this.contract.deposit(1000);
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(
      1000
    );
    await this.contract.withdraw(100);
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(
      900
    );

    // TODO: Добавить тест на активные голосования
  });

  it("Create Proposal", async function () {
    // await expect(this.contract.withdraw(1000)).to.be.revertedWith(
    //   "DAO: transfer amount exceeds vote balance"
    // );
    await expect(
      this.contract.createProposal(ethers.constants.AddressZero, "Test", 10)
    ).to.be.revertedWith("DAO: transfer from the zero address");

    // string memory _description,
    // address _recipient,
    // bytes32 _byteCode,
    // uint8 _minimumQuorum

    await this.contract.createProposal("Test");
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(
      1000
    );
    await this.contract.withdraw(100);
    expect(await this.contract.voteBalanceOf(this.sender.address)).to.equal(
      900
    );

    // TODO: Добавить тест на активные голосования
  });
});
