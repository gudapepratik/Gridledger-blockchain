# GRIDLEDGER

**Decentralized Peer-to-Peer Energy Trading Platform**  
*Complete Implementation Specification*  
`Blockchain • Smart Contracts • MERN Stack • Ethereum`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Why Blockchain](#3-why-blockchain)
4. [Solution Architecture](#4-solution-architecture)
5. [Module Breakdown & Implementation](#5-module-breakdown--implementation)
   - [Module 1: Project Scaffold & Environment](#module-1-project-scaffold--environment-setup)
   - [Module 2: Smart Contracts (Solidity)](#module-2-smart-contracts-solidity)
   - [Module 3: Backend Oracle Service (Node.js)](#module-3-backend-oracle-service-nodejs)
   - [Module 4: Frontend Application (React)](#module-4-frontend-application-react)
   - [Module 5: Marketplace Engine](#module-5-marketplace-engine)
   - [Module 6: Real-Time Dashboard & Analytics](#module-6-real-time-dashboard--analytics)
   - [Module 7: Testing & QA](#module-7-testing--quality-assurance)
   - [Module 8: Deployment & DevOps](#module-8-deployment--devops)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Smart Contract Reference](#8-smart-contract-reference)
9. [Security Considerations](#9-security-considerations)
10. [Overall Acceptance Criteria](#10-overall-acceptance-criteria)

---

## 1. Executive Summary

GridLedger is a simulation-based, blockchain-powered peer-to-peer energy trading platform that models neighborhood-level electricity markets. It enables prosumers (households with solar panels) to sell surplus energy directly to nearby consumers — without a utility company acting as intermediary.

The system tokenizes electricity: **1 kWh = 1 EnergyToken (ERT)**. All trades, payments, and consumption records are settled on-chain through Ethereum smart contracts, providing immutability and transparency. A Node.js oracle service simulates smart meter behavior (since hardware integration is out of scope), minting tokens on generation and burning them on consumption.

> **Scope:** GridLedger is a fully functional simulation. It does not connect to real hardware, power grids, or regulatory systems. All meter data is simulated by a backend oracle. The blockchain logic, marketplace, wallet integration, and settlement mechanics are real and production-quality.

| Dimension | Specification |
|---|---|
| Platform Type | Web Application (SPA) + Blockchain Backend |
| Blockchain Network | Ethereum (Hardhat local / Sepolia testnet) |
| Smart Contract Language | Solidity ^0.8.20 |
| Frontend | React 18 + Ethers.js v6 + TailwindCSS |
| Backend | Node.js 20 + Express 4 + Socket.IO |
| Database | MongoDB 7 (Mongoose ODM) |
| Wallet | MetaMask (EIP-1193 provider) |
| Token Standard | ERC-20 (EnergyToken / ERT) |
| Settlement | Atomic swap via Marketplace smart contract |

---

## 2. Problem Statement

Modern electricity distribution follows a centralized hub-and-spoke model: power flows from large generation plants through transmission grids and distribution companies (DISCOMs) to end consumers. While functional for fossil-fuel generation, this model creates critical inefficiencies in a world where millions of households now generate their own renewable electricity.

### 2.1 Core Failures of the Centralized Model

**No Direct Energy Marketplace**  
Residential solar producers cannot sell surplus electricity directly to neighbors. They are legally and technically forced to sell back to the grid at a feed-in tariff — typically 30–60% below retail price — while neighbors pay full retail rates for the same energy that originated meters away.

**Inefficient Net Metering**  
Net metering operates on monthly billing cycles. A household that generates 200 kWh surplus in a peak week may bank credits redeemed weeks later against a different consumption pattern. There is no real-time market signal, no dynamic pricing, and no incentive to match supply and demand locally.

**Physical Energy Waste**  
Surplus renewable energy generated locally often cannot be absorbed due to grid constraints and lack of localized demand management. Excess solar generation can be curtailed — effectively wasted — while neighboring streets consume from the grid.

**Billing Opacity**  
Consumer electricity bills are computed by a single authority using proprietary metering and billing systems. Consumers cannot independently verify readings, detect errors, or audit consumption. Disputes are resolved by the same entity that generated the bill.

**Single Point of Trust Failure**  
All production, consumption, and payment records are held by one central authority. This creates systemic corruption risk, eliminates neutrality when stakeholder interests conflict, and provides no recourse for consumers in disputes.

### 2.2 Market Opportunity

The global peer-to-peer energy trading market is projected to reach USD 9.4 billion by 2027. Powerledger (Australia), LO3 Energy (USA), and WePower (Europe) have demonstrated commercial viability. GridLedger models this architecture in a controlled simulation environment, making the technology accessible for validation and further development.

---

## 3. Why Blockchain

Energy trading is fundamentally a multi-party trust problem. Producers, consumers, grid operators, regulators, and metering providers all have conflicting interests. A centralized database controlled by any single party cannot guarantee neutrality. Blockchain introduces a shared, tamper-proof settlement layer that all parties can independently verify.

### 3.1 Tokenization — The Core Mechanism

Electricity is converted into ERC-20 digital tokens: **1 kWh generated = 1 ERT minted**. This creates a digital twin of physical energy that can be owned, transferred, traded, and burned. When energy is consumed, the corresponding tokens are burned, maintaining physical-digital consistency.

### 3.2 Blockchain Properties Applied

| Blockchain Feature | Energy Trading Application | GridLedger Implementation |
|---|---|---|
| Immutability | Meter records cannot be altered retroactively | All mint/burn/trade events logged on-chain |
| Decentralization | No single authority controls settlement | Ethereum smart contracts execute autonomously |
| Smart Contracts | Automate billing and payment without intermediary | Marketplace contract handles escrow + atomic swap |
| Tokenization | Electricity becomes a tradable digital asset | ERC-20 EnergyToken (ERT), 1 token = 1 kWh |
| Transparency | All participants audit all transactions | Public blockchain, all events queryable |
| Atomic Settlement | Payment and energy transfer happen simultaneously | Single transaction: tokens transfer + ETH payment |

### 3.3 Oracle Pattern

The critical challenge in blockchain energy systems is bridging physical meter data (off-chain) with on-chain logic. This is solved by the **Oracle Pattern**: a trusted backend service reads meter data and signs transactions to mint or burn tokens on the blockchain. GridLedger implements a simulated oracle — the same architectural pattern used in production by Powerledger — replacing real hardware with a deterministic simulation engine.

---

## 4. Solution Architecture

### 4.1 System Components

| Component | Technology | Responsibility |
|---|---|---|
| Frontend SPA | React 18 + Ethers.js + TailwindCSS | User interface: wallet, marketplace, dashboard |
| Backend Oracle | Node.js + Express + Socket.IO | Simulates smart meters, signs oracle transactions, REST API, WebSocket events |
| Database | MongoDB + Mongoose | Stores meter logs, trade history, user analytics, simulation state |
| EnergyToken Contract | Solidity ERC-20 | Mints/burns energy tokens, tracks balances |
| Marketplace Contract | Solidity | Creates sell orders, escrow, atomic swap settlement |
| Blockchain Network | Hardhat (local) / Sepolia (testnet) | Trust and settlement layer |
| Wallet | MetaMask | User identity, transaction signing, ETH balance |

### 4.2 Data Flow

1. Oracle Service simulates solar generation based on a configurable time-of-day curve.
2. Oracle calls `EnergyToken.mint()` on the blockchain, crediting ERT to the producer's wallet.
3. MongoDB logs the meter reading event with timestamp, kWh amount, and transaction hash.
4. Producer creates a sell order via the React frontend, signing a `Marketplace.createOrder()` transaction with MetaMask.
5. Marketplace contract locks the producer's ERT tokens in escrow.
6. Consumer browses listings and purchases by calling `Marketplace.fulfillOrder()` with ETH payment.
7. Smart contract atomically transfers ERT to buyer and ETH to seller in a single transaction.
8. Oracle monitors consumption events and burns ERT from the consumer's balance.
9. All events emit blockchain logs, which the backend indexes into MongoDB for the analytics dashboard.

### 4.3 Wallet & Identity Model

Each user is identified by their Ethereum wallet address. MetaMask is the sole authentication mechanism — there are no usernames or passwords. The backend maps wallet addresses to MongoDB user documents for analytics and display names. All sensitive operations (minting, trading, burning) require MetaMask signatures, ensuring the oracle cannot act on behalf of users.

---

## 5. Module Breakdown & Implementation

The project is divided into 8 self-contained modules. Each module has defined inputs, outputs, acceptance criteria, and testing requirements. **Modules should be implemented in order** as each depends on the previous.

---

### Module 1: Project Scaffold & Environment Setup

> **Module Goal:** Establish the full monorepo structure, development environment, tooling, and CI pipeline so all subsequent modules have a clean foundation to build on.

#### 1.1 Repository Structure

| Path | Contents |
|---|---|
| `gridledger/` | Monorepo root |
| `gridledger/contracts/` | Solidity smart contracts + Hardhat config |
| `gridledger/backend/` | Node.js oracle + Express API server |
| `gridledger/frontend/` | React application (Vite) |
| `gridledger/scripts/` | Deployment, seeding, and utility scripts |
| `gridledger/docs/` | Architecture diagrams, API docs |
| `gridledger/.github/workflows/` | CI/CD GitHub Actions |

#### 1.2 Prerequisites & Versions

- Node.js >= 20.0.0 (use nvm for version management)
- npm >= 10.0.0
- MongoDB >= 7.0 (local or MongoDB Atlas)
- MetaMask browser extension (Chrome/Firefox)
- Git >= 2.40

#### 1.3 Root Package Setup

Initialize root with **npm workspaces** to manage the monorepo. The root `package.json` should define workspaces for contracts, backend, and frontend.

- **contracts workspace:** Hardhat, Solidity tooling, OpenZeppelin contracts
- **backend workspace:** Express, Mongoose, Socket.IO, ethers.js, dotenv, jest
- **frontend workspace:** Vite, React, ethers.js, TailwindCSS, react-query, recharts

#### 1.4 Environment Configuration

Each workspace requires its own `.env` file. A `.env.example` must be committed for each workspace.

| Variable | Workspace | Purpose |
|---|---|---|
| `PRIVATE_KEY` | contracts | Oracle signing key (Hardhat account #0) |
| `NETWORK_URL` | contracts | RPC URL (http://localhost:8545 or Sepolia) |
| `MONGODB_URI` | backend | MongoDB connection string |
| `ORACLE_PRIVATE_KEY` | backend | Key for signing mint/burn transactions |
| `CONTRACT_ADDRESS_TOKEN` | backend | Deployed EnergyToken address |
| `CONTRACT_ADDRESS_MARKET` | backend | Deployed Marketplace address |
| `SIMULATION_INTERVAL_MS` | backend | How often oracle simulates meter (default: 30000) |
| `VITE_RPC_URL` | frontend | Ethereum RPC for ethers.js provider |
| `VITE_TOKEN_ADDRESS` | frontend | EnergyToken contract address |
| `VITE_MARKET_ADDRESS` | frontend | Marketplace contract address |

#### 1.5 Development Scripts

| Script | Action |
|---|---|
| `npm run chain` | Start local Hardhat node |
| `npm run deploy` | Deploy contracts to local chain |
| `npm run seed` | Seed demo accounts with tokens |
| `npm run oracle` | Start oracle simulation service |
| `npm run api` | Start backend API server |
| `npm run dev` | Start frontend Vite dev server |
| `npm run start:all` | Start everything concurrently |
| `npm run test` | Run all test suites |

#### 1.6 Acceptance Criteria

1. Running `npm run start:all` starts all services without error.
2. MetaMask can connect to `localhost:8545` and display test ETH balance.
3. MongoDB connection is established and health-check endpoint returns 200.
4. All `.env.example` files are present and documented.
5. Linting (ESLint) and formatting (Prettier) pass with zero errors.

---

### Module 2: Smart Contracts (Solidity)

> **Module Goal:** Implement and test two production-quality smart contracts: `EnergyToken` (ERC-20) and `Marketplace` (escrow + atomic settlement). Contracts must be fully tested with 100% branch coverage.

#### 2.1 EnergyToken Contract

EnergyToken is an ERC-20 token with restricted minting and burning privileges.

**Key Design Decisions:**
- Inherits from OpenZeppelin `ERC20`, `Ownable`, and `AccessControl`
- `MINTER_ROLE`: Granted only to the oracle address — only the oracle can mint tokens on verified energy generation
- `BURNER_ROLE`: Granted only to the oracle address — only the oracle can burn tokens on energy consumption
- 18 decimal places (standard ERC-20), where 1 ERT = 1 kWh
- `mint(address to, uint256 amount, bytes32 meterReadingId)`: Mints ERT to producer; emits `EnergyMinted` event with meter reading ID for audit trail
- `burn(address from, uint256 amount, bytes32 meterReadingId)`: Burns ERT from consumer; emits `EnergyConsumed` event
- No transfer restrictions — ERT can be freely transferred (required for marketplace)

**Events:**

| Event | Parameters | When Emitted |
|---|---|---|
| `EnergyMinted` | `address indexed to, uint256 amount, bytes32 meterReadingId` | Oracle mints tokens for generation |
| `EnergyConsumed` | `address indexed from, uint256 amount, bytes32 meterReadingId` | Oracle burns tokens for consumption |
| `Transfer` | `address from, address to, uint256 value` | Standard ERC-20 transfer |

#### 2.2 Marketplace Contract

The Marketplace contract handles the full lifecycle of an energy trade: listing, escrow, fulfillment, and cancellation.

**Order Struct:**  
Each sell order is stored on-chain as a struct containing: `orderId` (uint256), `seller` (address), `tokenAmount` (uint256), `pricePerToken` (uint256 in wei), `filledAmount` (uint256), `status` (enum: Active/Filled/Cancelled), `createdAt` (uint256 timestamp).

**Core Functions:**

| Function | Parameters | Behavior |
|---|---|---|
| `createOrder` | `uint256 tokenAmount, uint256 pricePerToken` | Transfers ERT from seller to escrow; creates Order record; emits `OrderCreated` |
| `fulfillOrder` | `uint256 orderId, uint256 tokenAmount` | Payable. Validates ETH sent matches price; atomically transfers ERT to buyer and ETH to seller; updates order status; emits `OrderFulfilled` |
| `cancelOrder` | `uint256 orderId` | Returns escrowed ERT to seller; marks order Cancelled; emits `OrderCancelled`. Only callable by seller. |
| `getOrder` | `uint256 orderId` | View function returning full Order struct |
| `getActiveOrders` | (none) | Returns array of all active order IDs |

**Security Requirements:**
- `ReentrancyGuard` on all state-changing functions (OpenZeppelin)
- Check-Effects-Interactions pattern strictly enforced
- `fulfillOrder` validates: order is Active, `tokenAmount <= remaining`, `msg.value == tokenAmount * pricePerToken` exactly
- Only seller can cancel their own order
- Contract holds ERT in escrow — no ETH stored permanently (immediately forwarded to seller)

#### 2.3 Contract Testing (Hardhat + Chai)

All tests in `contracts/test/` using Hardhat's testing framework. Coverage must reach **100% branch coverage**.

**EnergyToken Test Cases:**
- Should deploy with correct name, symbol, and decimals
- Should allow `MINTER_ROLE` to mint tokens
- Should revert if non-minter calls mint
- Should allow `BURNER_ROLE` to burn tokens
- Should revert if burning more than balance
- Should emit `EnergyMinted` with correct parameters
- Should emit `EnergyConsumed` with correct parameters
- Should handle role grant and revoke correctly

**Marketplace Test Cases:**
- Should create order and lock tokens in escrow
- Should revert `createOrder` if seller has insufficient ERT balance
- Should revert `createOrder` if seller has not approved marketplace allowance
- Should fulfill order with exact ETH payment
- Should revert `fulfillOrder` with incorrect ETH amount
- Should revert `fulfillOrder` on already-filled order
- Should allow partial fulfillment and update `filledAmount`
- Should transfer ETH to seller atomically on fulfillment
- Should allow seller to cancel active order
- Should revert cancel if caller is not seller
- Should return escrowed tokens on cancel
- Should revert on reentrancy attack

#### 2.4 Acceptance Criteria

1. `npx hardhat test` runs all tests with 100% pass rate.
2. `npx hardhat coverage` shows >= 95% line coverage and 100% branch coverage on critical paths.
3. `npx hardhat compile` produces zero warnings.
4. Contract ABIs are exported to `backend/src/abis/` and `frontend/src/abis/` automatically post-compile.
5. Deployment script logs all contract addresses to `contracts/deployments/{network}.json`.

---

### Module 3: Backend Oracle Service (Node.js)

> **Module Goal:** Build the simulation engine that mimics smart meter behavior, the oracle that bridges simulation to blockchain, and the REST + WebSocket API that serves the frontend.

#### 3.1 Oracle Architecture

The backend has three distinct responsibilities implemented as separate service modules:

- **Simulation Engine:** Generates deterministic meter reading data (solar production curves, consumption patterns)
- **Oracle Service:** Reads simulation output and executes signed blockchain transactions (mint/burn)
- **API Server:** Exposes REST endpoints and WebSocket events for the frontend

#### 3.2 Simulation Engine

The simulation engine runs on a configurable interval (default: 30 seconds) and models energy generation and consumption for all registered prosumer addresses.

**Solar Generation Model:**

Solar generation follows a bell-curve distribution peaking at solar noon:

```
kWh = peakKw * Math.max(0, Math.sin((hour - 6) * Math.PI / 12))
```

Where `hour` is the current hour of day (24h) and `peakKw` is configurable per prosumer (default: 5kW). This produces zero generation before 6am and after 6pm, peaking at noon.

**Consumption Model:**

Consumption follows a two-peak residential pattern (morning 7–9am, evening 6–9pm) with a configurable base load. Consumption is simulated with 10% random variance to model realistic usage.

**Meter Reading Document:**

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB document ID |
| `readingId` | String (bytes32 hex) | Unique ID committed to blockchain |
| `walletAddress` | String | Prosumer's Ethereum address |
| `timestamp` | Date | When reading was taken |
| `type` | Enum: generation/consumption | Reading type |
| `kwhAmount` | Number | Energy amount in kWh |
| `tokenAmount` | BigInt string | ERT amount (kwhAmount × 10^18) |
| `txHash` | String | Blockchain transaction hash (set after mint/burn) |
| `status` | Enum: pending/confirmed/failed | Oracle execution status |

#### 3.3 REST API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Server health + blockchain connectivity status | None |
| `GET` | `/api/users/:address` | User profile, stats, and token balance | None |
| `GET` | `/api/users/:address/history` | Paginated meter reading history | None |
| `GET` | `/api/marketplace/orders` | All active sell orders with seller info | None |
| `GET` | `/api/marketplace/orders/:id` | Single order details | None |
| `GET` | `/api/analytics/network` | Aggregate network stats (total traded, active users) | None |
| `GET` | `/api/analytics/price-history` | Historical ERT price per kWh over time | None |
| `POST` | `/api/oracle/simulate` | Manually trigger simulation cycle (dev only) | Dev key |
| `GET` | `/api/transactions/:txHash` | Look up on-chain transaction details | None |

#### 3.4 WebSocket Events (Server → Client)

| Event | Payload | Trigger |
|---|---|---|
| `meter:reading` | `{ walletAddress, kwhAmount, type, txHash }` | New meter reading confirmed on-chain |
| `order:created` | `{ orderId, seller, tokenAmount, pricePerToken }` | New sell order appears on marketplace |
| `order:fulfilled` | `{ orderId, buyer, tokenAmount, ethPaid }` | Order purchased |
| `order:cancelled` | `{ orderId }` | Order removed from marketplace |
| `network:stats` | `{ totalTraded, activeOrders, avgPrice }` | Emitted every 60 seconds |

#### 3.5 Backend Testing

- Unit tests: Simulation engine (generation curve values, consumption variance bounds)
- Unit tests: Oracle service (correct mint/burn amounts, error handling on reverted txns)
- Integration tests: REST endpoints using supertest (status codes, response schemas)
- Integration tests: MongoDB queries (correct data returned, pagination works)
- Mock ethers.js providers for blockchain tests to avoid requiring a live node

#### 3.6 Acceptance Criteria

1. Oracle successfully mints tokens every simulation interval when generation > 0.
2. Token amounts on blockchain match simulation kWh values (within 1 wei tolerance).
3. All REST endpoints return correct HTTP status codes and JSON schemas.
4. WebSocket events are received by connected frontend clients within 2 seconds of on-chain confirmation.
5. Backend gracefully handles blockchain node unavailability (queues transactions, retries).
6. All backend tests pass with >= 80% code coverage.

---

### Module 4: Frontend Application (React)

> **Module Goal:** Build a polished, responsive React single-page application that connects to MetaMask, displays real-time data, and enables users to interact with the marketplace.

#### 4.1 Application Structure

| Directory | Contents |
|---|---|
| `src/components/` | Reusable UI components (WalletCard, OrderCard, Chart, etc.) |
| `src/pages/` | Route-level page components (Dashboard, Marketplace, History, Profile) |
| `src/hooks/` | Custom React hooks (useWallet, useMarketplace, useBalance, useOracle) |
| `src/context/` | React context providers (WalletContext, ContractContext) |
| `src/abis/` | Contract ABI JSON files (auto-generated from contracts workspace) |
| `src/utils/` | Ethers.js helpers, formatters, constants |
| `src/api/` | Axios API client functions for backend REST endpoints |

#### 4.2 Pages

**Dashboard (`/`)**
- Wallet connection banner (if not connected) / wallet summary card (if connected)
- Real-time ERT token balance with live update via Socket.IO
- Current ETH balance
- Today's generation vs. consumption summary cards
- Energy production chart (last 24 hours, area chart using recharts)
- Recent transaction feed (last 10 on-chain events)
- Network stats ticker (total energy traded, active listings, average price)

**Marketplace (`/marketplace`)**
- Live grid of active sell orders (refreshed via Socket.IO)
- Each order card shows: seller address (truncated), available ERT, price per kWh (in ETH and USD equivalent), total cost for full purchase
- Quantity input: buyer can purchase a partial amount from any order
- Buy button triggers MetaMask popup with pre-calculated ETH value
- Create Listing panel: ERT amount, price per token, estimated revenue
- My Listings section: orders the connected user has created, with Cancel button

**History (`/history`)**
- Paginated table of all meter readings (generation and consumption) for connected wallet
- Columns: timestamp, type (badge), kWh, tokens, blockchain tx link
- Paginated table of all trade history (buy and sell) for connected wallet
- CSV export button for both tables

**Profile (`/profile`)**
- Display name (stored in MongoDB, set by user)
- Wallet address with ENS resolution if available
- Cumulative stats: total generated, total consumed, total sold, total purchased
- Simulated prosumer settings: peak kW capacity, location label

#### 4.3 Wallet Integration

The `useWallet` hook handles the complete MetaMask lifecycle:
- Detect if MetaMask is installed; prompt installation if not
- Request account access via `eth_requestAccounts`
- Listen for `accountsChanged` and `chainChanged` events
- Validate correct network (reject if not connected to expected chain ID)
- Expose: `account`, `provider`, `signer`, `chainId`, `isConnected`, `connect()`, `disconnect()`

#### 4.4 Contract Interaction

The `useMarketplace` hook wraps all Marketplace contract interactions:
- `createOrder(tokenAmount, pricePerToken)`: estimates gas, calls contract, tracks pending tx
- `fulfillOrder(orderId, tokenAmount)`: calculates ETH value, sends with `msg.value`
- `cancelOrder(orderId)`: calls contract cancel, updates local state optimistically
- All functions handle pending, success, and error states with user feedback

#### 4.5 UI/UX Requirements

- Responsive design: works on desktop (1280px+) and tablet (768px+)
- TailwindCSS for styling — no external component libraries except recharts
- Loading skeletons for all async data
- Toast notifications for transaction success/failure
- Ethereum addresses always truncated: `0x1234...5678`
- ETH amounts displayed in ETH (not Wei); ERT amounts displayed as kWh
- Transaction links open Etherscan (or local explorer URL) in new tab

#### 4.6 Frontend Testing

- Unit tests (Vitest + React Testing Library) for all custom hooks
- Component tests for critical UI components (WalletCard, OrderCard, BuyModal)
- Mock ethers.js and MetaMask in tests using `vi.mock()`
- E2E tests (Playwright) covering: wallet connect, create order, buy order flows

#### 4.7 Acceptance Criteria

1. MetaMask connect/disconnect works correctly across all pages.
2. ERT balance updates within 5 seconds of an on-chain mint event.
3. Marketplace listings update in real-time without page refresh.
4. All form validation works: cannot submit with 0 amount, cannot buy more than available.
5. Application works correctly on Chrome and Firefox with MetaMask.
6. Lighthouse performance score >= 80 on Dashboard page.

---

### Module 5: Marketplace Engine

> **Module Goal:** Implement the complete order matching and trading workflow, including the smart contract escrow, backend order indexing, and frontend buying/selling interface as an integrated system.

#### 5.1 Order Lifecycle

```
Draft (frontend form)
  → Pending (MetaMask submitted)
  → Active (on-chain confirmed, indexed in MongoDB)
  → Partially Filled | Filled | Cancelled
```

#### 5.2 Backend Order Indexer

The backend listens for `OrderCreated`, `OrderFulfilled`, and `OrderCancelled` events from the Marketplace contract using ethers.js event filters. On each event:

1. Parse event arguments from blockchain log
2. Upsert Order document in MongoDB
3. Emit corresponding Socket.IO event to all connected frontend clients
4. Update aggregate analytics (total volume, average price)

#### 5.3 Price Discovery

GridLedger uses a simple open order book model — no automated market maker. Sellers set their price, buyers choose which orders to fill. The backend API exposes:

- `/api/analytics/price-history`: Time-series of average fulfilled order price per ERT
- `/api/marketplace/orders?sort=price&order=asc`: Price-sorted order listing
- Frontend displays a simple price chart on the marketplace page

#### 5.4 Partial Fill Support

A buyer can purchase any quantity up to the remaining order amount. The Marketplace contract tracks `filledAmount` per order. The frontend shows a quantity slider bounded by `[1, remainingAmount]`. The backend displays remaining availability in real-time.

#### 5.5 Acceptance Criteria

1. Full trade cycle works end-to-end: seller creates order, buyer purchases, ETH and ERT transfer correctly.
2. Partial fill correctly updates order remaining amount on-chain and in MongoDB.
3. Cancelled order returns all escrowed ERT to seller.
4. Price history chart updates after each fulfilled order.
5. Concurrent order fulfillment attempts handled gracefully (only one succeeds).

---

### Module 6: Real-Time Dashboard & Analytics

> **Module Goal:** Build the analytics and monitoring layer that gives users and the network visibility into energy flows, trading activity, and system health.

#### 6.1 User Analytics

| Metric | Source | Update Frequency |
|---|---|---|
| ERT Balance | Blockchain (live) | Real-time (Socket.IO) |
| ETH Balance | Blockchain (live) | On wallet activity |
| Today's Generation (kWh) | MongoDB meter_readings | Every simulation cycle |
| Today's Consumption (kWh) | MongoDB meter_readings | Every simulation cycle |
| Net Position (kWh) | Computed: generation − consumption | Every simulation cycle |
| Total Revenue Earned (ETH) | MongoDB trades | On trade fulfillment |
| Total Energy Purchased (kWh) | MongoDB trades | On trade fulfillment |

#### 6.2 Network Analytics

- Total ERT minted (all-time): from blockchain `EnergyMinted` events
- Total ERT burned (all-time): from blockchain `EnergyConsumed` events
- Total trades executed: from MongoDB trades collection
- Total ETH settled: aggregate of all fulfilled order values
- Active prosumers (last 24h): unique wallet addresses with meter readings
- Average price per kWh (last 7 days): rolling average of fulfilled orders

#### 6.3 Charts (Recharts)

- **Energy Production Area Chart:** 24h generation curve for connected user
- **Energy Consumption Area Chart:** 24h consumption curve for connected user
- **Price History Line Chart:** ERT/ETH price over time (marketplace page)
- **Network Volume Bar Chart:** Daily ERT traded over last 30 days (admin view)

#### 6.4 Acceptance Criteria

1. All dashboard metrics update without page refresh.
2. Charts render correctly with no data, partial data, and full data.
3. Network stats are consistent between frontend display and MongoDB aggregation queries.
4. Analytics API endpoints respond in under 500ms with proper MongoDB indexes.

---

### Module 7: Testing & Quality Assurance

> **Module Goal:** Establish comprehensive test coverage across all layers — smart contracts, backend, and frontend — ensuring the system is production-ready and free of critical defects.

#### 7.1 Coverage Targets

| Layer | Tool | Line Coverage Target | Branch Coverage Target |
|---|---|---|---|
| Smart Contracts | Hardhat Coverage + solidity-coverage | 95% | 100% |
| Backend | Jest + Istanbul | 80% | 75% |
| Frontend Hooks | Vitest + RTL | 85% | 80% |
| E2E Flows | Playwright | Core user journeys covered | N/A |

#### 7.2 E2E Test Scenarios (Playwright)

1. Connect MetaMask wallet to application
2. View dashboard with real token balance
3. Create a sell order for 10 ERT at 0.001 ETH/token
4. As buyer, purchase 5 ERT from the listing
5. Verify seller ETH balance increased, buyer ERT balance increased
6. Cancel remaining order, verify ERT returned to seller
7. View transaction history page and verify all events appear
8. Disconnect wallet and verify UI returns to disconnected state

#### 7.3 Security Testing

- Reentrancy attack simulation on `Marketplace.fulfillOrder`
- Integer overflow/underflow tests on token amounts
- Access control: verify non-oracle cannot mint or burn
- Front-running simulation: two buyers attempt same order simultaneously
- Oracle key compromise simulation: revoke `MINTER_ROLE` and verify no further minting

#### 7.4 Performance Testing

- API endpoint response time: all endpoints < 500ms under 50 concurrent connections
- Frontend initial load: < 3 seconds on 4G connection (Lighthouse)
- Socket.IO event delivery: < 2 seconds from on-chain confirmation to frontend update
- MongoDB query performance: all queries use appropriate indexes, < 100ms

#### 7.5 Acceptance Criteria

1. All smart contract tests pass with zero failures.
2. All backend tests pass, >= 80% line coverage.
3. All 8 E2E Playwright scenarios pass on Chrome and Firefox.
4. No critical or high-severity security issues in the contracts.
5. CI pipeline runs all tests on every pull request automatically.

---

### Module 8: Deployment & DevOps

> **Module Goal:** Configure deployment to Sepolia testnet (contracts), a cloud host (backend), and a static host (frontend), with CI/CD automation and environment documentation.

#### 8.1 Smart Contract Deployment

- Target network: Ethereum Sepolia testnet (chain ID: 11155111)
- Deploy via Hardhat Ignition or deployment scripts using Infura/Alchemy RPC
- Verify contracts on Etherscan with `npx hardhat verify`
- Store deployed addresses in `contracts/deployments/sepolia.json` (committed to repo)
- Grant `MINTER_ROLE` and `BURNER_ROLE` to backend oracle wallet post-deployment

#### 8.2 Backend Deployment

- Target: Railway, Render, or Fly.io (Node.js-compatible PaaS)
- Environment variables configured via platform secrets (never committed)
- MongoDB Atlas for production database
- Healthcheck endpoint: `GET /api/health` returns 200 with blockchain connectivity status
- Auto-restart on crash (platform-managed)

#### 8.3 Frontend Deployment

- Target: Vercel or Netlify (static SPA)
- Build: `npm run build` in `frontend/` produces `dist/`
- `VITE_` environment variables configured in platform settings
- Custom domain optional — default platform URL is sufficient

#### 8.4 CI/CD Pipeline (GitHub Actions)

Three workflows:

| Workflow | Trigger | Actions |
|---|---|---|
| `ci.yml` | Every PR | Lint, compile contracts, run all tests, build frontend |
| `deploy-contracts.yml` | Manual | Deploy to Sepolia, update deployment file, commit |
| `deploy-app.yml` | Push to `main` | Deploy backend and frontend to production hosts |

#### 8.5 Acceptance Criteria

1. Contracts deployed and verified on Sepolia Etherscan.
2. Backend API accessible at public HTTPS URL, health endpoint returns 200.
3. Frontend accessible at public URL, MetaMask connects to Sepolia correctly.
4. CI pipeline runs on every PR and blocks merge on test failure.
5. Full system works end-to-end on Sepolia testnet.

---

## 6. Database Schema

### 6.1 Collections Overview

| Collection | Purpose |
|---|---|
| `users` | Prosumer profiles mapped to wallet addresses |
| `meter_readings` | All simulated meter data (generation and consumption) |
| `trades` | Fulfilled marketplace orders (denormalized for query performance) |
| `orders` | Indexed copy of on-chain order book (synced by event listener) |
| `network_stats` | Periodic aggregate snapshots for analytics |

### 6.2 Users Collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `walletAddress` | String (indexed, unique) | Ethereum wallet address (lowercase) |
| `displayName` | String | Optional user-set display name |
| `peakKwCapacity` | Number | Simulated solar panel capacity (kW) |
| `createdAt` | Date | First connection timestamp |
| `lastSeen` | Date | Last activity timestamp |

### 6.3 Meter Readings Collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `readingId` | String (indexed, unique) | Unique ID for blockchain reference (bytes32) |
| `walletAddress` | String (indexed) | Associated prosumer wallet |
| `timestamp` | Date (indexed) | When reading was taken |
| `type` | String: generation \| consumption | Reading category |
| `kwhAmount` | Number | Energy in kWh |
| `tokenAmount` | String | Wei-denominated token amount (BigInt as string) |
| `txHash` | String | Blockchain tx hash after oracle execution |
| `status` | String: pending \| confirmed \| failed | Oracle execution status |

### 6.4 MongoDB Indexes

- `meter_readings`: compound index on `(walletAddress, timestamp)` for user history queries
- `meter_readings`: compound index on `(status, timestamp)` for oracle pending queue
- `trades`: compound index on `(sellerAddress, timestamp)` and `(buyerAddress, timestamp)`
- `orders`: index on `(status, createdAt)` for active order listing
- `orders`: unique index on `orderId` for deduplication

---

## 7. API Reference

### 7.1 Response Format

All API responses follow a standard envelope format:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human readable description"
  }
}
```

### 7.2 Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `ERR_NOT_FOUND` | 404 | Resource not found |
| `ERR_INVALID_ADDRESS` | 400 | Ethereum address format invalid |
| `ERR_BLOCKCHAIN_UNAVAILABLE` | 503 | Cannot reach Ethereum node |
| `ERR_INSUFFICIENT_BALANCE` | 400 | Wallet has insufficient ERT |
| `ERR_ORDER_NOT_ACTIVE` | 409 | Order is filled or cancelled |
| `ERR_INTERNAL` | 500 | Unexpected server error |

### 7.3 Pagination

All list endpoints support query params: `?page=1&limit=20&sort=timestamp&order=desc`

Response `meta` includes: `{ total, page, limit, pages }`

---

## 8. Smart Contract Reference

### 8.1 Contract Addresses

After deployment, addresses are stored in `contracts/deployments/{network}.json`. The backend and frontend load these at startup.

### 8.2 ABI Export

The Hardhat compile step automatically copies ABI files to `backend/src/abis/` and `frontend/src/abis/` via a post-compile script. This ensures all workspaces use the same ABI version and prevents manual sync errors.

### 8.3 Gas Estimates

| Function | Estimated Gas | Notes |
|---|---|---|
| `EnergyToken.mint()` | ~65,000 | ERC-20 mint + event |
| `EnergyToken.burn()` | ~45,000 | ERC-20 burn + event |
| `Marketplace.createOrder()` | ~120,000 | Transfer to escrow + storage write |
| `Marketplace.fulfillOrder()` | ~90,000 | Token transfer + ETH forward + storage update |
| `Marketplace.cancelOrder()` | ~55,000 | Token return + storage update |

---

## 9. Security Considerations

### 9.1 Smart Contract Security

- All contracts audited against the [SWC Registry](https://swcregistry.io/) (Smart Contract Weakness Classification)
- `ReentrancyGuard` applied to all Marketplace state-changing functions
- Check-Effects-Interactions pattern strictly enforced: validate → update state → external calls
- No floating pragma: fixed to `solidity ^0.8.20`
- Integer overflow impossible: Solidity 0.8+ has built-in overflow protection
- Oracle private key stored only in backend environment variables, never committed

### 9.2 Backend Security

- Oracle key never exposed via API — signing happens server-side only
- Rate limiting on all API endpoints (100 req/min per IP)
- Input validation on all parameters (Joi schema validation)
- Ethereum address validation before any database query
- MongoDB injection prevention: Mongoose ODM with strict schemas
- CORS configured to allow only the frontend domain in production

### 9.3 Oracle Trust Model

The oracle is a trusted component. In production, this trust could be eliminated by using a decentralized oracle network (Chainlink). For GridLedger's simulation scope, the oracle's `MINTER_ROLE` can be revoked by the contract owner (a multi-sig in production), providing a circuit breaker if the oracle is compromised.

### 9.4 Known Limitations (Simulation Scope)

- **No real hardware:** all meter data is simulated — suitable for demonstration, not production billing
- **Single oracle:** no decentralization of the oracle itself (production would use Chainlink or a multi-sig oracle)
- **No regulatory compliance:** this is a technical prototype, not a licensed energy trading platform
- **Testnet only:** Sepolia testnet ETH has no real value — suitable for validation only

---

## 10. Overall Acceptance Criteria

### 10.1 Functional Requirements

1. A user can connect MetaMask and see their ERT balance and ETH balance on the dashboard.
2. The oracle automatically mints ERT to registered prosumer wallets on a configurable interval.
3. A user can create a sell order specifying ERT amount and ETH price per token.
4. Another user can purchase ERT from the marketplace with ETH.
5. The purchased ERT and ETH transfer atomically (both succeed or both fail).
6. A seller can cancel their active listing and receive ERT back.
7. The oracle burns ERT when consumption is simulated.
8. All transactions appear in the user's History page with correct data.
9. The dashboard analytics update in real-time without page refresh.

### 10.2 Non-Functional Requirements

1. All smart contract tests pass with 100% branch coverage on critical paths.
2. Backend API responds in under 500ms for all endpoints.
3. Frontend initial load is under 3 seconds.
4. The application works on Chrome and Firefox with MetaMask.
5. The entire system can be started locally with a single command: `npm run start:all`.
6. A new developer can set up the project from README in under 30 minutes.

### 10.3 Documentation Requirements

1. `README.md` in each workspace with setup instructions.
2. Architecture diagram committed to `docs/`.
3. All smart contract functions have NatSpec documentation.
4. All REST API endpoints documented (this document serves as the reference).
5. `.env.example` files for each workspace with all required variables listed and described.

---

*GridLedger Implementation Specification — End of Document*
