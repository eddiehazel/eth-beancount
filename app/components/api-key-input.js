import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * ApiKeyInput component for entering Etherscan API key
 * Saves to localStorage for persistence
 */
export default class ApiKeyInputComponent extends Component {
  @service storage;

  @tracked localApiKey = '';

  constructor() {
    super(...arguments);
    this.localApiKey = this.storage.apiKey;
  }

  @action
  handleApiKeyChange(event) {
    this.localApiKey = event.target.value;
    this.storage.saveApiKey(this.localApiKey);

    if (this.args.onApiKeyChange) {
      this.args.onApiKeyChange(this.localApiKey);
    }
  }
}
