// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TokenBridge.sol";
import "../src/TestToken.sol";

contract TokenBridgeTest is Test {
    TokenBridge public bridge;
    TestToken public token;
    
    address public owner = address(this);
    address public user = makeAddr("user");
    address public distributor = makeAddr("distributor");
    
    function setUp() public {
        // Deploy test token
        token = new TestToken();
        
        // Deploy bridge contract
        bridge = new TokenBridge();
        
        vm.startPrank(owner);
        // Add test token to supported tokens
        bridge.addSupportedToken(address(token));
        vm.stopPrank();
        
        // Transfer some tokens to user for testing
        token.transfer(user, 1000 ether);
    }
    
    function testDeposit() public {
        // Set user as msg.sender
        vm.startPrank(user);
        
        // Approve bridge to spend tokens
        token.approve(address(bridge), 100 ether);
        
        // Deposit tokens
        bridge.deposit(address(token), 100 ether, user);
        
        // Stop being user
        vm.stopPrank();
        
        // Check if tokens were transferred to the bridge
        assertEq(token.balanceOf(address(bridge)), 100 ether);
    }
    
    function testDistributeByOwner() public {
        // First deposit tokens to the bridge as user
        vm.startPrank(user);
        token.approve(address(bridge), 100 ether);
        bridge.deposit(address(token), 100 ether, user);
        vm.stopPrank();
        
        // Remember the user's balance after deposit
        uint256 userBalanceAfterDeposit = token.balanceOf(user);
        
        // Now distribute tokens as owner
        bridge.distribute(
            address(token),
            user,
            100 ether,
            0 // Nonce from the deposit
        );
        
        // Check if tokens were transferred to the user
        assertEq(token.balanceOf(user), userBalanceAfterDeposit + 100 ether);
    }
    
    function testDistributeByNonOwnerFails() public {
        // Try to distribute tokens as a non-owner
        vm.startPrank(user);
        
        vm.expectRevert("Bridge: not distributor");
        bridge.distribute(
            address(token),
            user,
            100 ether,
            0
        );
        
        vm.stopPrank();
    }
    
    // Additional test cases
    function testPauseAndUnpause() public {
        // Pause the bridge
        bridge.pause();
        
        // Try to deposit while paused
        vm.startPrank(user);
        token.approve(address(bridge), 100 ether);
        
        vm.expectRevert("Bridge: paused");
        bridge.deposit(address(token), 100 ether, user);
        vm.stopPrank();
        
        // Unpause and verify deposit works
        bridge.unpause();
        
        vm.startPrank(user);
        bridge.deposit(address(token), 100 ether, user);
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(bridge)), 100 ether);
    }
    
    function testEmergencyWithdraw() public {
        // First deposit some tokens
        vm.startPrank(user);
        token.approve(address(bridge), 100 ether);
        bridge.deposit(address(token), 100 ether, user);
        vm.stopPrank();
        
        uint256 initialOwnerBalance = token.balanceOf(owner);
        
        // Emergency withdraw
        bridge.emergencyWithdraw(address(token), 100 ether);
        
        // Verify tokens were transferred to owner
        assertEq(token.balanceOf(owner), initialOwnerBalance + 100 ether);
    }
    
    function testPreventDoubleProcessing() public {
        // First deposit
        vm.startPrank(user);
        token.approve(address(bridge), 100 ether);
        bridge.deposit(address(token), 100 ether, user);
        vm.stopPrank();
        
        // First distribution should succeed
        bridge.distribute(address(token), user, 100 ether, 0);
        
        // Second distribution with same nonce should fail
        vm.expectRevert("Bridge: deposit already processed");
        bridge.distribute(address(token), user, 100 ether, 0);
    }
}
