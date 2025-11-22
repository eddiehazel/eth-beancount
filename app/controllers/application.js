import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Main application controller
 * Coordinates between services and components
 */
export default class ApplicationController extends Controller {
  @service storage;
  @service etherscan;
  @service beancount;

  @tracked output = '';
  @tracked fetchedAddresses = [];
  @tracked showStats = false;

  get isLoading() {
    return this.etherscan.isLoading;
  }

  get statusMessage() {
    return this.etherscan.currentStatus;
  }

  get statusType() {
    return this.etherscan.statusType;
  }

  get stats() {
    return this.etherscan.stats;
  }

  get failedAddresses() {
    return this.etherscan.failedAddresses;
  }

  get hasData() {
    return this.etherscan.hasData;
  }

  /**
   * Fetch transactions for all entered addresses
   */
  @action
  async fetchTransactions() {
    const addressesText = this.storage.addresses;
    const apiKey = this.storage.apiKey;

    if (!addressesText) {
      this.etherscan.setStatus('Please enter at least one Ethereum address', 'error');
      return;
    }

    // Parse and validate addresses
    const addresses = this.etherscan.parseAddresses(addressesText);
    const invalidAddresses = addresses.filter((addr) => !this.etherscan.isValidAddress(addr));

    if (invalidAddresses.length > 0) {
      this.etherscan.setStatus(
        `Invalid Ethereum address format: ${invalidAddresses.join(', ')}`,
        'error'
      );
      return;
    }

    // Clear existing data
    this.etherscan.clearData();
    this.output = '';
    this.showStats = false;
    this.etherscan.isLoading = true;

    try {
      // Re-parse to populate nicknames after clearing
      const validAddresses = this.etherscan.parseAddresses(addressesText);

      // Fetch all addresses
      const { successCount, errorCount } = await this.etherscan.fetchAddresses(
        validAddresses,
        apiKey
      );

      // Get successfully fetched addresses
      this.fetchedAddresses = validAddresses.filter((addr) =>
        this.etherscan.addressTransactionMap.has(addr)
      );

      if (this.fetchedAddresses.length > 0) {
        // Generate output
        this.output = this.beancount.generateOutput(this.fetchedAddresses);
        this.showStats = true;

        const statusMessage = `Successfully fetched ${successCount} address(es)${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
        this.etherscan.setStatus(statusMessage, errorCount > 0 ? 'info' : 'success');

        // Auto-clear success messages
        if (errorCount === 0) {
          setTimeout(() => {
            this.etherscan.clearStatus();
          }, 5000);
        }
      } else {
        this.etherscan.setStatus('Failed to fetch any transactions', 'error');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      this.etherscan.setStatus(`Error: ${error.message}`, 'error');
    } finally {
      this.etherscan.isLoading = false;
    }
  }

  /**
   * Retry a failed address
   */
  @action
  async retryAddress(address) {
    const apiKey = this.storage.apiKey;

    const success = await this.etherscan.retryAddress(address, apiKey);

    if (success) {
      // Regenerate output
      const addressesText = this.storage.addresses;
      const allAddresses = this.etherscan.parseAddresses(addressesText);
      this.fetchedAddresses = allAddresses.filter((addr) =>
        this.etherscan.addressTransactionMap.has(addr)
      );

      if (this.fetchedAddresses.length > 0) {
        this.output = this.beancount.generateOutput(this.fetchedAddresses);
        this.showStats = true;
      }
    }
  }

  /**
   * Clear all output and reset state
   */
  @action
  clearOutput() {
    this.output = '';
    this.showStats = false;
    this.fetchedAddresses = [];
    this.etherscan.clearData();
    this.etherscan.setStatus('Output cleared', 'info');

    setTimeout(() => {
      this.etherscan.clearStatus();
    }, 3000);
  }

  /**
   * Clear all saved data from localStorage
   */
  @action
  logout() {
    if (confirm('This will clear all saved addresses and API key. Continue?')) {
      this.storage.clearAll();
      this.clearOutput();
      this.etherscan.setStatus('Saved data cleared', 'success');

      setTimeout(() => {
        this.etherscan.clearStatus();
      }, 3000);
    }
  }

  /**
   * Handle copy success notification
   */
  @action
  onCopySuccess() {
    this.etherscan.setStatus('Copied to clipboard!', 'success');

    setTimeout(() => {
      this.etherscan.clearStatus();
    }, 3000);
  }

  /**
   * Handle download success notification
   */
  @action
  onDownloadSuccess() {
    this.etherscan.setStatus('File downloaded!', 'success');

    setTimeout(() => {
      this.etherscan.clearStatus();
    }, 3000);
  }
}
