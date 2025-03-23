// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenBridge.sol";
import "../src/TestToken.sol";

contract DeployTokenBridge is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        bool deployTestToken = vm.envBool("DEPLOY_TEST_TOKEN");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the bridge
        TokenBridge bridge = new TokenBridge();
        console.log("TokenBridge deployed to:", address(bridge));
        
        // Optionally deploy test token if we're on a testnet
        if (deployTestToken) {
            TestToken token = new TestToken();
            console.log("TestToken deployed to:", address(token));
            
            // Add test token to supported tokens list
            bridge.addSupportedToken(address(token));
            console.log("TestToken added to supported tokens");
        }
        
        vm.stopBroadcast();
    }
}
