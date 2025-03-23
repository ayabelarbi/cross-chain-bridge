// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract VerifyContracts is Script {
    function run() external {
        string memory bridgeAddress = "0xf72A91A5F434b354fd660f31C88598fdf5f410Ee";
        string memory tokenAddress = "0x4059580E0a27b3DB46Fb7962a626AC6b11b567D1";
        
        string[] memory inputs = new string[](9);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = bridgeAddress;
        inputs[3] = "src/TokenBridge.sol:TokenBridge";
        inputs[4] = "--chain";
        inputs[5] = "base-sepolia";
        inputs[6] = "--watch";
        inputs[7] = "--constructor-args";
        inputs[8] = "";

        vm.ffi(inputs);
    }
}
