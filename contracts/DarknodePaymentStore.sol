pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./CompatibleERC20.sol";
import "./DarknodeRegistry.sol";

/// @notice DarknodePaymentStore is responsible for paying off darknodes for their computation.
contract DarknodePaymentStore is Claimable {
    using SafeMath for uint256;
    using CompatibleERC20Functions for CompatibleERC20;

    string public VERSION; // Passed in as a constructor parameter.

    /// @notice The special address for Ether.
    address constant public ETHEREUM = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint256 public darknodeWhitelistLength;

    // mapping of darknode -> token -> balance
    mapping(address => mapping(address => uint256)) public darknodeBalances;

    // mapping of token -> lockedAmount
    mapping(address => uint256) public lockedBalances;

    // mapping of darknode -> blacklistTimestamp
    mapping(address => uint256) public darknodeBlacklist;

    // mapping of darknode -> whitelistTimestamp
    mapping(address => uint256) public darknodeWhitelist;

    /// @notice The contract constructor.
    ///
    /// @param _VERSION A string defining the contract version.
    constructor(
        string _VERSION
    ) public {
        VERSION = _VERSION;
    }

    /// @notice Allow direct payments to be made to the DarknodePaymentStore.
    function () public payable {
    }

    /// @notice Checks to see if a darknode is blacklisted
    ///
    /// @param _darknode The address of the darknode
    /// @return true if the darknode is blacklisted
    function isBlacklisted(address _darknode) public view returns (bool) {
        return darknodeBlacklist[_darknode] != 0;
    }

    /// @notice Checks to see if a darknode is whitelisted
    ///
    /// @param _darknode The address of the darknode
    /// @return true if the darknode is whitelisted
    function isWhitelisted(address _darknode) public view returns (bool) {
        return darknodeWhitelist[_darknode] != 0;
    }

    function totalBalance(address _token) public view returns (uint256) {
        if (_token == ETHEREUM) {
            return address(this).balance;
        } else {
            return CompatibleERC20(_token).balanceOf(address(this));
        }
    }

    function availableBalance(address _token) public view returns (uint256) {
        return totalBalance(_token).sub(lockedBalances[_token]);
    }

    function blacklist(address _darknode) external onlyOwner {
        require(!isBlacklisted(_darknode), "darknode already blacklisted");
        darknodeBlacklist[_darknode] = now;

        // Unwhitelist if necessary
        if (isWhitelisted(_darknode)) {
            darknodeWhitelist[_darknode] = 0;
            // Use Safemath when subtracting to avoid underflows
            darknodeWhitelistLength = darknodeWhitelistLength.sub(1);
        }
    }

    function whitelist(address _darknode) external onlyOwner {
        require(!isBlacklisted(_darknode), "darknode is blacklisted");
        require(!isWhitelisted(_darknode), "darknode already whitelisted");

        darknodeWhitelist[_darknode] = now;
        darknodeWhitelistLength++;
    }

    function incrementDarknodeBalance(address _darknode, address _token, uint256 _amount) external onlyOwner {
        require(_amount > 0, "invalid amount");
        require(availableBalance(_token) >= _amount, "insufficient contract balance");

        darknodeBalances[_darknode][_token] = darknodeBalances[_darknode][_token].add(_amount);
        lockedBalances[_token] = lockedBalances[_token].add(_amount);
    }

    /// @notice Transfers an amount out of balance
    ///
    /// @param _darknode The address of the darknode
    /// @param _token Which token to transfer
    /// @param _amount The amount to transfer
    /// @param _recipient The address to withdraw it to
    function transfer(address _darknode, address _token, uint256 _amount, address _recipient) external onlyOwner {
        require(darknodeBalances[_darknode][_token] >= _amount, "insufficient darknode balance");
        darknodeBalances[_darknode][_token] = darknodeBalances[_darknode][_token].sub(_amount);
        lockedBalances[_token] = lockedBalances[_token].sub(_amount);

        if (_token == ETHEREUM) {
            _recipient.transfer(_amount);
        } else {
            CompatibleERC20(_token).safeTransfer(_recipient, _amount);
        }
    }

}