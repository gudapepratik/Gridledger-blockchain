// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    IERC20 public energyToken;

    enum OrderStatus { Active, Filled, Cancelled }

    struct Order {
        uint256 orderId;
        address seller;
        uint256 tokenAmount;
        uint256 pricePerToken;
        uint256 filledAmount;
        OrderStatus status;
        uint256 createdAt;
    }

    uint256 public nextOrderId;
    mapping(uint256 => Order) public orders;
    uint256[] public activeOrderIds;

    event OrderCreated(uint256 indexed orderId, address indexed seller, uint256 tokenAmount, uint256 pricePerToken);
    event OrderFulfilled(uint256 indexed orderId, address indexed buyer, uint256 amountFilled, uint256 ethPaid);
    event OrderCancelled(uint256 indexed orderId);

    constructor(address _energyTokenAddress) {
        energyToken = IERC20(_energyTokenAddress);
    }

    function createOrder(uint256 tokenAmount, uint256 pricePerToken) external nonReentrant {
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(pricePerToken > 0, "Price must be greater than 0");

        require(energyToken.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");

        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            seller: msg.sender,
            tokenAmount: tokenAmount,
            pricePerToken: pricePerToken,
            filledAmount: 0,
            status: OrderStatus.Active,
            createdAt: block.timestamp
        });

        activeOrderIds.push(orderId);

        emit OrderCreated(orderId, msg.sender, tokenAmount, pricePerToken);
    }

    function fulfillOrder(uint256 orderId, uint256 amountToFill) external payable nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Active, "Order is not active");
        require(amountToFill > 0, "Amount must be greater than 0");
        require(amountToFill <= (order.tokenAmount - order.filledAmount), "Exceeds available amount");

        uint256 requiredEth = (amountToFill * order.pricePerToken) / 1e18;
        require(msg.value == requiredEth, "Incorrect ETH payment");

        order.filledAmount += amountToFill;
        
        if (order.filledAmount == order.tokenAmount) {
            order.status = OrderStatus.Filled;
            _removeFromActive(orderId);
        }

        require(energyToken.transfer(msg.sender, amountToFill), "Token transfer failed");
        
        (bool success, ) = payable(order.seller).call{value: msg.value}("");
        require(success, "ETH transfer failed");

        emit OrderFulfilled(orderId, msg.sender, amountToFill, msg.value);
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.seller == msg.sender, "Only seller can cancel");
        require(order.status == OrderStatus.Active, "Order is not active");

        uint256 remainingTokens = order.tokenAmount - order.filledAmount;
        order.status = OrderStatus.Cancelled;
        _removeFromActive(orderId);

        require(energyToken.transfer(msg.sender, remainingTokens), "Token return failed");

        emit OrderCancelled(orderId);
    }

    function _removeFromActive(uint256 orderId) internal {
        for (uint i = 0; i < activeOrderIds.length; i++) {
            if (activeOrderIds[i] == orderId) {
                activeOrderIds[i] = activeOrderIds[activeOrderIds.length - 1];
                activeOrderIds.pop();
                break;
            }
        }
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getActiveOrders() external view returns (uint256[] memory) {
        return activeOrderIds;
    }
}
