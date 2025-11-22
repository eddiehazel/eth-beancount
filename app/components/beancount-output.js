import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * BeancountOutput component for displaying and exporting generated output
 */
export default class BeancountOutputComponent extends Component {
  @tracked copySuccess = false;

  @action
  async copyToClipboard() {
    if (!this.args.output) return;

    try {
      await navigator.clipboard.writeText(this.args.output);
      this.copySuccess = true;

      // Reset success state after delay
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);

      if (this.args.onCopy) {
        this.args.onCopy();
      }
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = this.args.output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }
  }

  @action
  downloadFile() {
    if (!this.args.output) return;

    const addresses = this.args.addresses || [];
    let filename;

    if (addresses.length === 1) {
      filename = `ethereum-${addresses[0].slice(-6)}.beancount`;
    } else {
      filename = `ethereum-multiple-${addresses.length}-addresses.beancount`;
    }

    const blob = new Blob([this.args.output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    if (this.args.onDownload) {
      this.args.onDownload();
    }
  }
}
