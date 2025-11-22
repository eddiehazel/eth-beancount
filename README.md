# eth-beancount

A modern Ember.js web application that converts Ethereum blockchain transactions into [Beancount](https://beancount.github.io/) format for plaintext double-entry accounting.

## Live Preview

**Try it now:** [https://eddiehazel.github.io/eth-beancount/](https://eddiehazel.github.io/eth-beancount/)

The tool is automatically built and deployed to GitHub Pages on every push to the main branch.

## Features

- **Multi-wallet support** - Track transactions across multiple Ethereum addresses
- **Nickname support** - Label addresses with custom names (e.g., `0x123...:savings`)
- **ETH & Token tracking** - Handles both ETH transfers and ERC20 token transfers
- **Gas fee accounting** - Properly tracks gas fees as expenses
- **Failed transaction handling** - Records failed transactions with fee deductions
- **Security sanitization** - Removes malicious URLs from token metadata
- **Persistent storage** - Saves addresses and API key in localStorage
- **Dark mode support** - Automatic dark/light theme based on system preference
- **Fully client-side** - All processing happens in your browser, no data sent to servers

## Tech Stack

- **[Ember.js 5.x](https://emberjs.com/)** - Modern Octane edition with Glimmer components
- **[Embroider](https://github.com/embroider-build/embroider)** - Next-gen Ember build system
- **Tracked properties** - Fine-grained reactivity with `@glimmer/tracking`
- **Native ES classes** - Modern JavaScript class syntax throughout
- **CSS custom properties** - Design tokens for consistent theming

## Usage

1. Visit the [live preview](https://eddiehazel.github.io/eth-beancount/)
2. Enter your Ethereum addresses (one per line)
   - Optional: Add nicknames with format `0xAddress:nickname`
3. Optionally add your Etherscan API key for higher rate limits (get one free at [etherscan.io](https://etherscan.io/apis))
4. Click "Fetch Transactions" to retrieve blockchain data
5. Copy or download the generated `.beancount` file

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/eddiehazel/eth-beancount.git
cd eth-beancount

# Install dependencies
npm install

# Start development server
npm start
```

The development server will be available at `http://localhost:4200`.

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run all tests
npm run lint       # Run all linters
npm run lint:fix   # Auto-fix linting issues
```

### Project Structure

```
eth-beancount/
├── app/
│   ├── components/        # Glimmer components
│   ├── controllers/       # Route controllers
│   ├── services/          # Application services
│   │   ├── storage.js     # localStorage management
│   │   ├── etherscan.js   # Etherscan API client
│   │   └── beancount.js   # Output generation
│   ├── styles/           # Application CSS
│   └── templates/        # Route templates
├── config/               # Ember configuration
├── tests/               # Test suites
└── public/              # Static assets
```

## Deployment

This project uses GitHub Actions to automatically build and deploy to GitHub Pages. Any push to the `main` branch triggers a new deployment.

### PR Previews

Every pull request automatically gets a preview deployment:

1. A preview is deployed to `https://eddiehazel.github.io/eth-beancount/pr-preview/pr-{number}/`
2. A comment is posted on the PR with the preview URL
3. The preview updates automatically when you push new commits
4. The preview is cleaned up when the PR is closed or merged

### Setup for Forks

To enable GitHub Pages for your fork:

1. Go to Settings > Pages
2. Under "Build and deployment", select "Deploy from a branch"
3. Select the `gh-pages` branch and `/ (root)` folder
4. The workflows will handle the rest automatically

## API

The application uses the [Etherscan V2 API](https://docs.etherscan.io/v2/) to fetch:

- Normal transactions (`txlist`)
- ERC20 token transfers (`tokentx`)

Requests are staggered (500ms between addresses, 300ms between endpoints) to respect rate limits.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
