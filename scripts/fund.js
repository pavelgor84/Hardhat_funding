const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const transacttion = await fundMe.fund({ value: ethers.utils.parseEther("0.01") })
    await transacttion.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1)
    })
