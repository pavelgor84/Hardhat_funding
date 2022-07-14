const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name) ? describe.skip
    :
    describe("FundMe", function () {

        let fundMe
        let deployer
        let mockV3Aggregator
        const amount = ethers.utils.parseEther("0.001")

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)


        })

        describe("Constructor", function () {

            it("should pass priceFeed correctly", async () => {
                const response = await fundMe.get_s_priceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("Funding", () => {
            it("shouldn't allow < $50", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            it("should equals amount of user funded to its contracts's state", async () => {
                await fundMe.fund({ value: amount })
                const amountFunded = await fundMe.get_s_addressToAmountFunded(deployer)
                assert.equal(amountFunded.toString(), amount.toString())
            })
            it("should be store funder in array", async () => {
                await fundMe.fund({ value: amount })
                const storedFunder = await fundMe.get_s_funders(0)
                assert.equal(storedFunder, deployer)
            })

        })

        describe("Withdraw", function () {
            beforeEach(async () => {
                await fundMe.fund({ value: amount })
            })
            it("should withdraw to the single account", async () => {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)  // 1
                const startingFunderBalance = await fundMe.provider.getBalance(deployer) // 99
                //Act
                const transaction = await fundMe.withdraw()
                const transactionReceipt = await transaction.wait(1)
                const { cumulativeGasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = cumulativeGasUsed.mul(effectiveGasPrice)

                const endFundMebalance = await fundMe.provider.getBalance(fundMe.address) // 0 
                const endFunderBalance = await fundMe.provider.getBalance(deployer) //100
                //Assert
                assert.equal(endFundMebalance, 0)
                assert.equal((startingFundMeBalance.add(startingFunderBalance)).toString(), endFunderBalance.add(gasCost).toString())
                //expect(endFunderBalance).to.be.above(startingFunderBalance)
            })
            it("Should cheaper withdraw from multiple accounts", async () => {
                //Arrange
                const account = await ethers.getSigners()
                for (let i = 1; i < 7; i++) {
                    const fundMeConnectedContract = await fundMe.connect(account[i])
                    await fundMeConnectedContract.fund({ value: amount })
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingFunderBalance = await fundMe.provider.getBalance(deployer)
                //Act
                const transaction = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transaction.wait(1)
                const { cumulativeGasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = cumulativeGasUsed.mul(effectiveGasPrice)

                const endFundMebalance = await fundMe.provider.getBalance(fundMe.address)
                const endFunderBalance = await fundMe.provider.getBalance(deployer)
                //Assert
                assert.equal(endFundMebalance, 0)
                assert.equal(startingFunderBalance.add(startingFundMeBalance).toString(), endFunderBalance.add(gasCost).toString())
                await expect(fundMe.get_s_funders(0)).to.be.reverted
                for (let i = 1; i < 7; i++) {
                    assert(await fundMe.get_s_addressToAmountFunded(account[i].address), 0)
                }
            })
            it("Should revert withdraw to not owners", async () => {
                const account = await ethers.getSigners()
                const attacker = account[1]
                const fundMeConnectAttacker = await fundMe.connect(attacker)
                await expect(fundMeConnectAttacker.withdraw()).to.be.revertedWith("FundMe__NotOwner")
            })

        })
    })