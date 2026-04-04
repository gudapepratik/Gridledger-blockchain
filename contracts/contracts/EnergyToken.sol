// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EnergyToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    event EnergyMinted(address indexed to, uint256 amount, bytes32 meterReadingId);
    event EnergyConsumed(address indexed from, uint256 amount, bytes32 meterReadingId);

    constructor(address defaultAdmin) ERC20("EnergyToken", "ERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function mint(address to, uint256 amount, bytes32 meterReadingId) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit EnergyMinted(to, amount, meterReadingId);
    }

    function burn(address from, uint256 amount, bytes32 meterReadingId) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
        emit EnergyConsumed(from, amount, meterReadingId);
    }
}
