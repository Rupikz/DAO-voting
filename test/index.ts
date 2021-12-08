import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", function () {
  const decimals = 18;

  beforeEach(async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Nikolai", "NIC", decimals);
    await token.deployed();
    const [sender, recipient, account, accountOther] =
      await ethers.getSigners();
    this.sender = sender;
    this.recipient = recipient;
    this.account = account.address;
    this.accountOther = accountOther.address;
    this.token = token;
  });

  it("Мета данные контракта", async function () {
    expect(await this.token.name()).to.equal("Nikolai");
    expect(await this.token.symbol()).to.equal("NIC");
    expect(await this.token.decimals()).to.equal(decimals);
    expect(await this.token.totalSupply()).to.equal(0);
  });

  it("Создание и удаление токенов", async function () {
    expect(await this.token.balanceOf(this.account)).to.equal(0);
    expect(await this.token.balanceOf(this.accountOther)).to.equal(0);
    expect(await this.token.totalSupply()).to.equal(0);

    await this.token.mint(this.account, 20);
    await this.token.mint(this.accountOther, 10);

    expect(await this.token.balanceOf(this.account)).to.equal(20);
    expect(await this.token.balanceOf(this.accountOther)).to.equal(10);
    expect(await this.token.totalSupply()).to.equal(30);

    await this.token.burn(this.account, 5);
    await this.token.burn(this.accountOther, 5);

    expect(await this.token.balanceOf(this.account)).to.equal(15);
    expect(await this.token.balanceOf(this.accountOther)).to.equal(5);
    expect(await this.token.totalSupply()).to.equal(20);
  });

  it("Апрув токенов", async function () {
    await this.token.connect(this.sender).approve(this.recipient.address, 20);
    expect(
      await this.token.allowance(this.sender.address, this.recipient.address)
    ).to.equal(20);

    await this.token.connect(this.sender).approve(this.recipient.address, 5);
    expect(
      await this.token.allowance(this.sender.address, this.recipient.address)
    ).to.equal(5);

    await this.token
      .connect(this.sender)
      .increaseAllowance(this.recipient.address, 5);
    expect(
      await this.token.allowance(this.sender.address, this.recipient.address)
    ).to.equal(10);

    await this.token
      .connect(this.sender)
      .decreaseAllowance(this.recipient.address, 3);
    expect(
      await this.token.allowance(this.sender.address, this.recipient.address)
    ).to.equal(7);
  });

  it("Перевод токенов", async function () {
    await this.token.mint(this.sender.address, 20);
    await this.token.approve(this.sender.address, 20);
    await this.token.connect(this.sender).transfer(this.recipient.address, 6);

    expect(await this.token.balanceOf(this.sender.address)).to.equal(14);
    expect(await this.token.balanceOf(this.recipient.address)).to.equal(6);

    await this.token.connect(this.recipient).transfer(this.sender.address, 1);

    expect(await this.token.balanceOf(this.sender.address)).to.equal(15);
    expect(await this.token.balanceOf(this.recipient.address)).to.equal(5);

    await this.token.transferFrom(
      this.sender.address,
      this.recipient.address,
      3
    );
    expect(await this.token.balanceOf(this.sender.address)).to.equal(12);
    expect(await this.token.balanceOf(this.recipient.address)).to.equal(8);
  });
});
