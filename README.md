# eth-beancount

A web-based tool that converts Ethereum blockchain transactions into [Beancount](https://beancount.github.io/) format for plaintext accounting.

## Live Preview

**Try it now:** [https://eddiehazel.github.io/eth-beancount/](https://eddiehazel.github.io/eth-beancount/)

The tool is automatically deployed to GitHub Pages on every push to the main branch.

## Features

- Convert Ethereum transactions to Beancount ledger format
- Support for multiple wallet addresses
- Handles both ETH transfers and ERC20 token transfers
- Tracks gas fees as expenses
- Properly handles failed transactions
- Downloads output as `.beancount` file
- Fully client-side - no server required

## Usage

1. Visit the [live preview](https://eddiehazel.github.io/eth-beancount/)
2. Enter your Etherscan API key (get one free at [etherscan.io](https://etherscan.io/apis))
3. Add one or more Ethereum wallet addresses
4. Click "Generate Beancount" to fetch transactions and generate output
5. Download the generated `.beancount` file

## Local Development

Simply open `index.html` in a web browser - no build process required.

## Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages. Any push to the `main` branch triggers a new deployment.

To enable GitHub Pages for your fork:
1. Go to Settings > Pages
2. Under "Build and deployment", select "GitHub Actions"

## License

MIT
