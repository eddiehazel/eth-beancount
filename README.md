# ETH Beancount

Convert Ethereum blockchain transactions to Beancount format for plaintext double-entry accounting.

## Features

- Fetch ETH and ERC20 token transactions from the Ethereum blockchain
- Support for multiple wallet addresses with optional nicknames
- Generate Beancount-compatible ledger output
- Track gas fees as expenses
- Handle failed transactions
- Download output as `.beancount` files
- Client-side only - your data never leaves your browser
- Dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State**: React hooks with localStorage persistence
- **Testing**: Vitest + React Testing Library
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. Enter your Ethereum addresses (one per line)
2. Optionally add nicknames: `0x123...abc:MyWallet`
3. Optionally provide an Etherscan API key (uses default if empty)
4. Click "Fetch Transactions"
5. Download or copy the generated Beancount output

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   └── StatusMessage.tsx
│   ├── AddressInput.tsx    # Address input component
│   ├── ApiKeyInput.tsx     # API key input component
│   ├── BeancountOutput.tsx # Output display with copy/download
│   ├── FailedRequests.tsx  # Failed request retry UI
│   ├── Progress.tsx        # Fetch progress indicator
│   └── Statistics.tsx      # Transaction statistics
├── hooks/                  # React hooks
│   ├── useLocalStorage.ts  # localStorage sync hook
│   └── useTransactionFetcher.ts # Transaction fetching logic
├── lib/                    # Core library functions
│   ├── address.ts          # Address parsing utilities
│   ├── beancount.ts        # Beancount output generation
│   ├── etherscan.ts        # Etherscan API client
│   ├── sanitize.ts         # URL/symbol sanitization
│   └── storage.ts          # localStorage utilities
├── types/                  # TypeScript types
│   └── index.ts            # All type definitions
└── test/                   # Test setup
    └── setup.ts            # Vitest setup file
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

The project includes 144+ tests covering:

- Library functions (sanitization, address parsing, beancount generation)
- API client functions
- React components
- Storage utilities

## API

The application uses the [Etherscan API v2](https://docs.etherscan.io/) to fetch:

- Normal ETH transactions (`txlist`)
- ERC20 token transfers (`tokentx`)

A default API key is provided, but for heavy usage, get a free key from [etherscan.io](https://etherscan.io/apis).

## Security

- All processing happens client-side
- No data is sent to external servers (except Etherscan API)
- API keys are stored only in localStorage
- URL sanitization prevents malicious links in token names
- Input validation for all Ethereum addresses

## License

MIT
