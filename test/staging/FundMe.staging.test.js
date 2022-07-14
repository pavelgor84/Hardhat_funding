const { assert } = require("chai")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

developmentChain.includes(network.name) ? describe.skip
    :
    describe("FundMe", () => {
        let fundMe
        let deployer
        const amount = ethers.utils.parseEther("0.01")

        beforeEach("Deploy", async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("Allows people to fund and withdraw", async () => {
            const transactFund = await fundMe.fund({ value: amount })
            await transactFund.wait(1)
            const transactWith = await fundMe.withdraw()
            await transactWith.wait(1)
            const endingBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingBalance.toString(), "0")
        })



    })