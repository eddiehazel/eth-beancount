import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * AddressInput component for entering Ethereum addresses
 * Supports single and multiple addresses with optional nicknames
 */
export default class AddressInputComponent extends Component {
  @service storage;

  @tracked localAddresses = '';

  constructor() {
    super(...arguments);
    // Initialize from storage
    this.localAddresses = this.storage.addresses;
  }

  @action
  handleAddressesChange(event) {
    this.localAddresses = event.target.value;
    this.storage.saveAddresses(this.localAddresses);

    if (this.args.onAddressesChange) {
      this.args.onAddressesChange(this.localAddresses);
    }
  }

  @action
  handleKeyDown(event) {
    // Ctrl+Enter triggers fetch
    if (event.key === 'Enter' && event.ctrlKey) {
      if (this.args.onSubmit) {
        this.args.onSubmit();
      }
    }
  }
}
