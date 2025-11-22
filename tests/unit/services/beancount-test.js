import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | beancount', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:beancount');
    assert.ok(service);
  });

  test('sanitizeSymbol handles various inputs', function (assert) {
    let service = this.owner.lookup('service:beancount');

    assert.strictEqual(service.sanitizeSymbol('ETH'), 'ETH');
    assert.strictEqual(service.sanitizeSymbol('USDT'), 'USDT');
    assert.strictEqual(service.sanitizeSymbol('eth'), 'ETH');
    assert.strictEqual(service.sanitizeSymbol('token-name'), 'TOKENNAME');
    assert.strictEqual(service.sanitizeSymbol('123'), 'TOKEN123');
    assert.strictEqual(service.sanitizeSymbol(''), 'UNKNOWN');
    assert.strictEqual(service.sanitizeSymbol(null), 'UNKNOWN');
  });

  test('sanitizeAccountName handles various inputs', function (assert) {
    let service = this.owner.lookup('service:beancount');

    assert.strictEqual(service.sanitizeAccountName('MyWallet'), 'MYWALLET');
    assert.strictEqual(service.sanitizeAccountName('my.wallet'), 'MYWALLET');
    assert.strictEqual(service.sanitizeAccountName('123wallet'), 'X123WALLET');
    assert.strictEqual(service.sanitizeAccountName(''), 'UNKNOWN');
  });

  test('sanitizeUrls removes malicious URLs', function (assert) {
    let service = this.owner.lookup('service:beancount');

    assert.strictEqual(service.sanitizeUrls('Normal text'), 'Normal text');
    assert.strictEqual(service.sanitizeUrls('Visit https://evil.com now'), 'Visit [ url removed ] now');
    assert.strictEqual(service.sanitizeUrls('Check www.phishing.net'), 'Check [ url removed ]');
    assert.strictEqual(service.sanitizeUrls('Go to example.com'), 'Go to [ url removed ]');
    assert.strictEqual(service.sanitizeUrls('claim.airdrop'), '[ url removed ]');
  });

  test('formatEthValue converts wei to ETH', function (assert) {
    let service = this.owner.lookup('service:beancount');

    assert.strictEqual(service.formatEthValue('1000000000000000000'), '1');
    assert.strictEqual(service.formatEthValue('500000000000000000'), '0.5');
    assert.strictEqual(service.formatEthValue('0'), '0');
  });
});
