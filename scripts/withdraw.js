const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const tx = await fundMe.withdraw()
    await tx.wait(1)
    console.log("Withdrawed")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })