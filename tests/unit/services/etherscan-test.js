import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | etherscan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:etherscan');
    assert.ok(service);
  });

  test('isValidAddress validates Ethereum addresses', function (assert) {
    let service = this.owner.lookup('service:etherscan');

    assert.true(service.isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f7890a'));
    assert.true(service.isValidAddress('0x0000000000000000000000000000000000000000'));
    assert.false(service.isValidAddress('0x123')); // Too short
    assert.false(service.isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f7890a')); // Missing 0x
    assert.false(service.isValidAddress('')); // Empty
  });

  test('getAccountId returns last 6 characters', function (assert) {
    let service = this.owner.lookup('service:etherscan');

    assert.strictEqual(service.getAccountId('0x742d35Cc6634C0532925a3b844Bc9e7595f7890a'), '7890A');
    assert.strictEqual(service.getAccountId('0x0000000000000000000000000000000000000000'), '000000');
  });

  test('parseAddresses handles multiple formats', function (assert) {
    let service = this.owner.lookup('service:etherscan');

    const text = `0x742d35Cc6634C0532925a3b844Bc9e7595f7890a:mywallet
0x0000000000000000000000000000000000000001
0x742d35Cc6634C0532925a3b844Bc9e7595f7890A`;

    const addresses = service.parseAddresses(text);

    // Should deduplicate (case insensitive)
    assert.strictEqual(addresses.length, 2);
    assert.strictEqual(addresses[0], '0x742d35Cc6634C0532925a3b844Bc9e7595f7890a');
    assert.strictEqual(addresses[1], '0x0000000000000000000000000000000000000001');

    // Should store nickname
    assert.strictEqual(
      service.addressNicknames.get('0x742d35cc6634c0532925a3b844bc9e7595f7890a'),
      'mywallet'
    );
  });
});
