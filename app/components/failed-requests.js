import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * FailedRequests component for displaying and retrying failed API requests
 */
export default class FailedRequestsComponent extends Component {
  get failedList() {
    // Convert TrackedMap to array for iteration
    const list = [];
    if (this.args.failedAddresses) {
      this.args.failedAddresses.forEach((error, address) => {
        list.push({ address, error });
      });
    }
    return list;
  }

  get hasFailures() {
    return this.failedList.length > 0;
  }

  @action
  handleRetry(address) {
    if (this.args.onRetry) {
      this.args.onRetry(address);
    }
  }
}
