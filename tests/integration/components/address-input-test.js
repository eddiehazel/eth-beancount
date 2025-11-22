import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | address-input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<AddressInput />`);

    assert.dom('textarea').exists();
    assert.dom('label').hasText(/Ethereum Addresses/);
  });

  test('it shows placeholder text', async function (assert) {
    await render(hbs`<AddressInput />`);

    assert.dom('textarea').hasAttribute('placeholder');
  });
});
