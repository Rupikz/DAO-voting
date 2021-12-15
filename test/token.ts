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
    const zeroSender = await ethers.getSigner(ethers.constants.AddressZero);

    this.sender = sender;
    this.recipient = recipient;
    this.account = account.address;
    this.accountOther = accountOther.address;
    this.zeroSender = zeroSender;
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

    await expect(
      this.token.mint(ethers.constants.AddressZero, 20)
    ).to.be.revertedWith("ERC20: mint to the zero address");
    await expect(
      this.token.burn(ethers.constants.AddressZero, 5)
    ).to.be.revertedWith("ERC20: burn from the zero address");
    await expect(this.token.burn(this.account, 20)).to.be.revertedWith(
      "ERC20: burn amount exceeds balance"
    );
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

    await expect(
      this.token
        .connect(this.sender)
        .decreaseAllowance(this.recipient.address, 10)
    ).to.be.revertedWith("ERC20: decreased allowance below zero");
    await expect(
      this.token
        .connect(this.sender)
        .increaseAllowance(ethers.constants.AddressZero, 10)
    ).to.be.revertedWith("ERC20: approve to the zero address");
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

    await expect(
      this.token
        .connect(this.sender)
        .transferFrom(ethers.constants.AddressZero, this.recipient.address, 10)
    ).to.be.revertedWith("ERC20: transfer from the zero address");
    await expect(
      this.token
        .connect(this.sender)
        .transferFrom(this.sender.address, ethers.constants.AddressZero, 10)
    ).to.be.revertedWith("ERC20: transfer to the zero address");
    await expect(
      this.token
        .connect(this.sender)
        .transferFrom(this.sender.address, this.recipient.address, 15)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

    await this.token.approve(this.sender.address, 10);
    await expect(
      this.token
        .connect(this.sender)
        .transferFrom(this.sender.address, this.recipient.address, 11)
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
  });
});
