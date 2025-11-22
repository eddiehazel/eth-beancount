import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

const STORAGE_KEYS = {
  ADDRESSES: 'eth-beancount-addresses',
  API_KEY: 'eth-beancount-apikey',
};

/**
 * Storage service for managing localStorage persistence
 * Handles saving and loading of user preferences and data
 */
export default class StorageService extends Service {
  @tracked addresses = '';
  @tracked apiKey = '';

  constructor() {
    super(...arguments);
    this.load();
  }

  /**
   * Load saved data from localStorage
   */
  load() {
    if (typeof localStorage === 'undefined') return;

    const savedAddresses = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

    if (savedAddresses) {
      this.addresses = savedAddresses;
    }
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }
  }

  /**
   * Save addresses to localStorage
   * @param {string} addresses - The addresses text to save
   */
  saveAddresses(addresses) {
    if (typeof localStorage === 'undefined') return;

    this.addresses = addresses;
    if (addresses) {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, addresses);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
    }
  }

  /**
   * Save API key to localStorage
   * @param {string} apiKey - The API key to save
   */
  saveApiKey(apiKey) {
    if (typeof localStorage === 'undefined') return;

    this.apiKey = apiKey;
    if (apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.ADDRESSES);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    this.addresses = '';
    this.apiKey = '';
  }
}
