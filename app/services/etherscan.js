import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedMap } from 'tracked-built-ins';
import config from 'eth-beancount/config/environment';

const REQUEST_DELAY_BETWEEN_ADDRESSES = 500;
const REQUEST_DELAY_BETWEEN_ENDPOINTS = 300;

/**
 * Etherscan API service for fetching Ethereum transactions
 * Uses V2 API with chainid parameter for mainnet
 */
export default class EtherscanService extends Service {
  @tracked isLoading = false;
  @tracked currentStatus = '';
  @tracked statusType = 'info';

  // Use TrackedMap for reactive updates
  addressTransactionMap = new TrackedMap();
  failedAddresses = new TrackedMap();
  addressNicknames = new TrackedMap();

  // Aggregate transaction data
  @tracked allTransactions = [];
  @tracked tokenTransactions = [];

  get apiUrl() {
    return config.APP.etherscanApiUrl;
  }

  get chainId() {
    return config.APP.etherscanChainId;
  }

  get defaultApiKey() {
    return config.APP.defaultApiKey;
  }

  /**
   * Get account ID from address (last 6 hex characters)
   * @param {string} address - Ethereum address
   * @returns {string} Account ID
   */
  getAccountId(address) {
    return address.slice(-6).toUpperCase();
  }

  /**
   * Get Etherscan URL for an address
   * @param {string} address - Ethereum address
   * @returns {string} Etherscan URL
   */
  getEtherscanUrl(address) {
    return `https://etherscan.io/address/${address}`;
  }

  /**
   * Parse addresses from text input
   * @param {string} text - Raw text with addresses
   * @returns {string[]} Array of valid addresses
   */
  parseAddresses(text) {
    const seen = new Set();
    const addresses = [];

    // Clear existing nicknames
    this.addressNicknames.clear();

    text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const parts = line.split(':');
        let address, nickname;

        if (parts.length >= 2 && parts[0].startsWith('0x')) {
          address = parts[0];
          nickname = parts.slice(1).join(':');
        } else {
          address = line;
          nickname = null;
        }

        // Remove duplicates
        if (!seen.has(address.toLowerCase())) {
          seen.add(address.toLowerCase());
          addresses.push(address);

          if (nickname) {
            this.addressNicknames.set(address.toLowerCase(), nickname);
          }
        }
      });

    return addresses;
  }

  /**
   * Get account name with nickname if available
   * @param {string} address - Ethereum address
   * @returns {string} Account name
   */
  getAccountName(address) {
    const suffix = this.getAccountId(address);
    const nickname = this.addressNicknames.get(address.toLowerCase());

    if (nickname) {
      const safeNickname = nickname.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (safeNickname.length > 0 && safeNickname.match(/^[A-Z]/)) {
        return `${safeNickname}:${suffix}`;
      }
    }
    return suffix;
  }

  /**
   * Validate Ethereum address format
   * @param {string} address - Address to validate
   * @returns {boolean} Whether address is valid
   */
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Set status message
   * @param {string} message - Status message
   * @param {string} type - Status type (info, success, error)
   */
  setStatus(message, type = 'info') {
    this.currentStatus = message;
    this.statusType = type;
  }

  /**
   * Clear status message
   */
  clearStatus() {
    this.currentStatus = '';
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch transactions for a single address
   * @param {string} address - Ethereum address
   * @param {string} apiKey - Etherscan API key
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async fetchSingleAddress(address, apiKey) {
    try {
      // Initialize data structure
      if (!this.addressTransactionMap.has(address)) {
        this.addressTransactionMap.set(address, {
          transactions: [],
          tokenTransactions: [],
        });
      }

      // Fetch normal transactions
      const txUrl = `${this.apiUrl}?chainid=${this.chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
      const txResponse = await fetch(txUrl);

      if (!txResponse.ok) {
        throw new Error(`HTTP error: ${txResponse.status}`);
      }

      const txData = await txResponse.json();

      if (txData.status === '0' && txData.message === 'NOTOK') {
        throw new Error(txData.result || 'API error');
      }

      const txs = txData.result || [];
      this.addressTransactionMap.get(address).transactions = txs;
      this.allTransactions = [...this.allTransactions, ...txs];

      // Wait before second request
      await this.sleep(REQUEST_DELAY_BETWEEN_ENDPOINTS);

      // Fetch ERC20 token transactions
      const tokenUrl = `${this.apiUrl}?chainid=${this.chainId}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
      const tokenResponse = await fetch(tokenUrl);

      if (!tokenResponse.ok) {
        throw new Error(`HTTP error: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();

      if (tokenData.status === '1') {
        const tokens = tokenData.result || [];
        this.addressTransactionMap.get(address).tokenTransactions = tokens;
        this.tokenTransactions = [...this.tokenTransactions, ...tokens];
      }

      return { success: true };
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      this.addressTransactionMap.delete(address);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch transactions for multiple addresses
   * @param {string[]} addresses - Array of addresses
   * @param {string} apiKey - Etherscan API key
   * @returns {Promise<{successCount: number, errorCount: number}>}
   */
  async fetchAddresses(addresses, apiKey) {
    let totalSuccess = 0;
    let totalErrors = 0;
    let processedCount = 0;

    const effectiveApiKey = apiKey || this.defaultApiKey;

    this.setStatus(`Fetching transactions for ${addresses.length} address(es)...`, 'info');

    for (const address of addresses) {
      processedCount++;
      this.setStatus(
        `Fetching ${processedCount}/${addresses.length}: ${address.slice(0, 10)}...`,
        'info'
      );

      const result = await this.fetchSingleAddress(address, effectiveApiKey);

      if (result.success) {
        totalSuccess++;
        this.failedAddresses.delete(address);
      } else {
        totalErrors++;
        this.failedAddresses.set(address, result.error);
      }

      // Stagger requests
      if (processedCount < addresses.length) {
        await this.sleep(REQUEST_DELAY_BETWEEN_ADDRESSES);
      }
    }

    return { successCount: totalSuccess, errorCount: totalErrors };
  }

  /**
   * Retry a failed address
   * @param {string} address - Address to retry
   * @param {string} apiKey - Etherscan API key
   * @returns {Promise<boolean>} Whether retry was successful
   */
  async retryAddress(address, apiKey) {
    this.setStatus(`Retrying ${address.slice(0, 10)}...`, 'info');

    const result = await this.fetchSingleAddress(address, apiKey);

    if (result.success) {
      this.failedAddresses.delete(address);
      this.setStatus(`Successfully fetched ${address.slice(0, 10)}...`, 'success');
      return true;
    } else {
      this.failedAddresses.set(address, result.error);
      this.setStatus(`Retry failed for ${address.slice(0, 10)}...: ${result.error}`, 'error');
      return false;
    }
  }

  /**
   * Clear all fetched data
   */
  clearData() {
    this.allTransactions = [];
    this.tokenTransactions = [];
    this.addressTransactionMap.clear();
    this.failedAddresses.clear();
    this.addressNicknames.clear();
    this.clearStatus();
  }

  /**
   * Get transaction statistics
   * @returns {{total: number, eth: number, tokens: number, failed: number}}
   */
  get stats() {
    const failed = this.allTransactions.filter((tx) => tx.isError === '1').length;
    return {
      total: this.allTransactions.length + this.tokenTransactions.length,
      eth: this.allTransactions.length,
      tokens: this.tokenTransactions.length,
      failed,
    };
  }

  /**
   * Check if any data has been loaded
   */
  get hasData() {
    return this.addressTransactionMap.size > 0;
  }
}
