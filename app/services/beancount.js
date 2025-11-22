import Service from '@ember/service';
import { inject as service } from '@ember/service';

/**
 * Beancount service for generating accounting output
 * Handles all Beancount format generation logic
 */
export default class BeancountService extends Service {
  @service etherscan;

  /**
   * Sanitize currency symbol for Beancount compatibility
   * @param {string} symbol - Token symbol
   * @returns {string} Sanitized symbol
   */
  sanitizeSymbol(symbol) {
    if (!symbol) return 'UNKNOWN';

    if (symbol.match(/^[A-Z][A-Z0-9]*$/)) {
      return symbol;
    }

    let sanitized = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized.length === 0 || !sanitized.match(/^[A-Z]/)) {
      sanitized = 'TOKEN' + sanitized;
    }

    return sanitized;
  }

  /**
   * Sanitize account name for Beancount compatibility
   * @param {string} name - Account name
   * @returns {string} Sanitized name
   */
  sanitizeAccountName(name) {
    if (!name) return 'UNKNOWN';
    let sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitized.length === 0 || !sanitized.match(/^[A-Z]/)) {
      sanitized = 'X' + sanitized;
    }
    return sanitized;
  }

  /**
   * Sanitize URLs from text to prevent injection
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeUrls(text) {
    if (!text) return text;
    return text
      .replace(/https?:\/\/[^\s"'<>]+/gi, '[ url removed ]')
      .replace(/ftp:\/\/[^\s"'<>]+/gi, '[ url removed ]')
      .replace(/www\.[^\s"'<>]+/gi, '[ url removed ]')
      .replace(
        /[a-z0-9][-a-z0-9]*\s*\.\s*(?:com|net|org|io|co|xyz|info|biz|me|app|dev|eth|crypto|finance|money|cash|gift|claim|reward|airdrop|token|nft|defi|swap|exchange|trade|wallet|mint)\b/gi,
        '[ url removed ]'
      );
  }

  /**
   * Format ETH value from wei
   * @param {string} value - Value in wei
   * @returns {string} Formatted ETH value
   */
  formatEthValue(value) {
    return (parseInt(value) / 1e18).toFixed(18).replace(/\.?0+$/, '');
  }

  /**
   * Format token value based on decimals
   * @param {string} value - Raw token value
   * @param {string} decimals - Token decimals
   * @returns {string} Formatted token value
   */
  formatTokenValue(value, decimals) {
    const dec = parseInt(decimals);
    return (parseInt(value) / Math.pow(10, dec)).toFixed(dec).replace(/\.?0+$/, '');
  }

  /**
   * Generate complete Beancount output
   * @param {string[]} addresses - User addresses that were fetched
   * @returns {string} Complete Beancount formatted output
   */
  generateOutput(addresses) {
    const output = [];
    const {
      allTransactions,
      tokenTransactions,
      addressTransactionMap,
      addressNicknames,
    } = this.etherscan;

    // Header
    output.push(';; Ethereum transactions for multiple addresses');
    output.push(';; Generated on ' + new Date().toISOString());
    output.push(';;');
    output.push(';; Addresses included:');
    addresses.forEach((addr) => {
      const nickname = addressNicknames.get(addr.toLowerCase());
      output.push(`;; - ${addr}${nickname ? ' (' + nickname + ')' : ''}`);
      output.push(`;;   Etherscan: ${this.etherscan.getEtherscanUrl(addr)}`);
    });
    output.push('');

    // Collect unique data
    const uniqueAddresses = new Set();
    const uniqueTokens = new Map();

    allTransactions.forEach((tx) => {
      uniqueAddresses.add(tx.from.toLowerCase());
      uniqueAddresses.add(tx.to.toLowerCase());
    });

    tokenTransactions.forEach((tx) => {
      uniqueAddresses.add(tx.from.toLowerCase());
      uniqueAddresses.add(tx.to.toLowerCase());
      uniqueTokens.set(tx.tokenSymbol, {
        contract: tx.contractAddress,
        name: tx.tokenName,
        decimals: tx.tokenDecimal,
      });
    });

    // Commodity declarations
    output.push(';; ============== COMMODITY DECLARATIONS ==============');
    output.push('');
    output.push('1970-01-01 commodity ETH');
    output.push('  name: "Ethereum"');
    output.push('');

    uniqueTokens.forEach((info, symbol) => {
      const safeSymbol = this.sanitizeSymbol(symbol);
      const safeName = info.name ? this.sanitizeUrls(info.name.replace(/"/g, '\\"')) : null;
      const safeOriginalSymbol = this.sanitizeUrls(symbol);
      output.push(`1970-01-01 commodity ${safeSymbol}`);
      if (safeName) {
        output.push(`  name: "${safeName}"`);
      }
      if (symbol !== safeSymbol) {
        output.push(`  original-symbol: "${safeOriginalSymbol}"`);
      }
      output.push(`  contract: "${info.contract}"`);
      output.push('');
    });

    // Account definitions
    output.push(';; ============== ACCOUNT DEFINITIONS ==============');
    output.push(';; Edit the account names below to match your chart of accounts');
    output.push('');

    // User wallet accounts
    addresses.forEach((addr) => {
      const accountName = this.etherscan.getAccountName(addr);
      const nickname = addressNicknames.get(addr.toLowerCase());
      output.push(`1970-01-01 open Assets:Crypto:Ethereum:${accountName} ETH`);
      output.push(
        `  description: "Ethereum wallet ${addr}${nickname ? ' (' + nickname + ')' : ''}"`
      );
      output.push(`  etherscan: "${this.etherscan.getEtherscanUrl(addr)}"`);
      output.push('');
    });

    // Token accounts for user addresses
    uniqueTokens.forEach((info, symbol) => {
      const safeSymbol = this.sanitizeSymbol(symbol);
      const safeTokenName = this.sanitizeAccountName(symbol);
      addresses.forEach((addr) => {
        const accountName = this.etherscan.getAccountName(addr);
        const nickname = addressNicknames.get(addr.toLowerCase());
        const addressData = addressTransactionMap.get(addr);
        const hasToken =
          addressData &&
          addressData.tokenTransactions.some(
            (tx) =>
              tx.tokenSymbol === symbol &&
              (tx.from.toLowerCase() === addr.toLowerCase() ||
                tx.to.toLowerCase() === addr.toLowerCase())
          );

        if (hasToken) {
          output.push(
            `1970-01-01 open Assets:Crypto:Tokens:${safeTokenName}:${accountName} ${safeSymbol}`
          );
          output.push(
            `  description: "Token account for ${this.sanitizeUrls(symbol)} in wallet ${addr}${nickname ? ' (' + nickname + ')' : ''}"`
          );
          output.push(`  etherscan: "${this.etherscan.getEtherscanUrl(addr)}"`);
          output.push('');
        }
      });
    });

    // External accounts
    uniqueAddresses.forEach((addr) => {
      if (!addresses.some((userAddr) => userAddr.toLowerCase() === addr)) {
        const accountId = this.etherscan.getAccountId(addr);
        output.push(`1970-01-01 open Assets:Crypto:External:${accountId}`);
        output.push(`  description: "External address ${addr}"`);
        output.push(`  etherscan: "${this.etherscan.getEtherscanUrl(addr)}"`);
        output.push('');
      }
    });

    // Common expense accounts
    output.push('1970-01-01 open Expenses:Crypto:NetworkFees ETH');
    output.push('1970-01-01 open Expenses:Crypto:GasFees ETH');
    output.push('');

    output.push(';; ============== TRANSACTIONS ==============');
    output.push('');

    // Process ETH transactions
    const allTxSorted = [...allTransactions].sort(
      (a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );
    const allTokensSorted = [...tokenTransactions].sort(
      (a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );

    allTxSorted.forEach((tx) => {
      const date = new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0];
      const value = this.formatEthValue(tx.value);
      const gasUsed = this.formatEthValue(String(parseInt(tx.gasUsed) * parseInt(tx.gasPrice)));

      const isFromUser = addresses.some((addr) => addr.toLowerCase() === tx.from.toLowerCase());
      const isToUser = addresses.some((addr) => addr.toLowerCase() === tx.to.toLowerCase());

      if ((tx.value !== '0' || isFromUser) && (isFromUser || isToUser)) {
        output.push(`${date} * "${tx.isError === '1' ? 'FAILED: ' : ''}Ethereum Transaction"`);
        output.push(`  txhash: "${tx.hash}"`);
        output.push(`  block: "${tx.blockNumber}"`);

        if (tx.isError === '1') {
          output.push('  ; Transaction failed - no value transferred');
          if (isFromUser) {
            const fromAccountName = this.etherscan.getAccountName(tx.from);
            output.push(`  Assets:Crypto:Ethereum:${fromAccountName} -${gasUsed} ETH`);
            output.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`);
          }
        } else {
          if (isFromUser && isToUser) {
            const fromAccountName = this.etherscan.getAccountName(tx.from);
            const toAccountName = this.etherscan.getAccountName(tx.to);
            output.push(`  Assets:Crypto:Ethereum:${fromAccountName} -${value} ETH`);
            output.push(`  Assets:Crypto:Ethereum:${fromAccountName} -${gasUsed} ETH`);
            output.push(`  Assets:Crypto:Ethereum:${toAccountName} ${value} ETH`);
            output.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`);
          } else if (isFromUser) {
            const fromAccountName = this.etherscan.getAccountName(tx.from);
            output.push(`  Assets:Crypto:Ethereum:${fromAccountName} -${value} ETH`);
            output.push(`  Assets:Crypto:Ethereum:${fromAccountName} -${gasUsed} ETH`);
            output.push(
              `  Assets:Crypto:External:${this.etherscan.getAccountId(tx.to)} ${value} ETH`
            );
            output.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`);
          } else if (isToUser) {
            const toAccountName = this.etherscan.getAccountName(tx.to);
            output.push(
              `  Assets:Crypto:External:${this.etherscan.getAccountId(tx.from)} -${value} ETH`
            );
            output.push(`  Assets:Crypto:Ethereum:${toAccountName} ${value} ETH`);
          }
        }
        output.push('');
      }
    });

    // Process token transactions
    allTokensSorted.forEach((tx) => {
      const date = new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0];
      const value = this.formatTokenValue(tx.value, tx.tokenDecimal);
      const symbol = tx.tokenSymbol;
      const safeSymbol = this.sanitizeSymbol(symbol);
      const safeAccountName = this.sanitizeAccountName(symbol);

      const isFromUser = addresses.some((addr) => addr.toLowerCase() === tx.from.toLowerCase());
      const isToUser = addresses.some((addr) => addr.toLowerCase() === tx.to.toLowerCase());

      if (isFromUser || isToUser) {
        output.push(`${date} * "${this.sanitizeUrls(symbol)} Transfer"`);
        output.push(`  txhash: "${tx.hash}"`);
        output.push(`  token-contract: "${tx.contractAddress}"`);

        if (isFromUser && isToUser) {
          const fromAccountName = this.etherscan.getAccountName(tx.from);
          const toAccountName = this.etherscan.getAccountName(tx.to);
          output.push(
            `  Assets:Crypto:Tokens:${safeAccountName}:${fromAccountName} -${value} ${safeSymbol}`
          );
          output.push(
            `  Assets:Crypto:Tokens:${safeAccountName}:${toAccountName} ${value} ${safeSymbol}`
          );
        } else if (isFromUser) {
          const fromAccountName = this.etherscan.getAccountName(tx.from);
          output.push(
            `  Assets:Crypto:Tokens:${safeAccountName}:${fromAccountName} -${value} ${safeSymbol}`
          );
          output.push(
            `  Assets:Crypto:External:${this.etherscan.getAccountId(tx.to)} ${value} ${safeSymbol}`
          );
        } else if (isToUser) {
          const toAccountName = this.etherscan.getAccountName(tx.to);
          output.push(
            `  Assets:Crypto:External:${this.etherscan.getAccountId(tx.from)} -${value} ${safeSymbol}`
          );
          output.push(
            `  Assets:Crypto:Tokens:${safeAccountName}:${toAccountName} ${value} ${safeSymbol}`
          );
        }

        output.push('');
      }
    });

    return output.join('\n');
  }
}
