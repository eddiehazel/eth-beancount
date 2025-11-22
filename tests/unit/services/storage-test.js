import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | storage', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:storage');
    assert.ok(service);
  });

  test('it has default empty values', function (assert) {
    let service = this.owner.lookup('service:storage');
    assert.strictEqual(service.addresses, '');
    assert.strictEqual(service.apiKey, '');
  });
});
