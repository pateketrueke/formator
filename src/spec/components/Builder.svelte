<script>
  import { Fence } from 'smoo';
  import { Schema, Input } from '../../lib/main.js';

  let status = 'pristine';
  let valid = false;
  let modal;
  let visible;
  let missing;

  function save(e) {
    alert(JSON.stringify(e.detail, null, 2));
  }
  function check(e) {
    valid = e.detail.valid;
    status = e.detail.valid ? 'valid' : 'invalid';
  }
  function toggle() {
    visible = !visible;
    if (!visible) modal = false;
  }
  function overlay(e) {
    modal = e.target.checked;
  }
  function invalid() {
    missing = !missing;
  }
</script>

<details>
  <summary id="test-builder">Form builder</summary>
  <button class="nosel" on:click={toggle}>Toggle form</button>
  <Fence autofocus bind:visible bind:modal on:cancel={toggle}>
    <div class="formator" slot="main">
      <Schema debug on:submit={save} on:change={check}>
        {#if missing}<Input />{/if}
        <Input
          name="email"
          label="E-mail"
          format="email"
          required
          autocomplete="current-email"
        />
        <Input
          name="password"
          label="New password"
          password
          required
          autocomplete="current-password"
        />
        <Input
          name="new_password"
          label="Confirm password"
          password
          required
          autocomplete="confirm-password"
        />
        <slot slot="actions">
          <input type="submit" value="Save" disabled={!valid} />
          <span class="fill">{status}</span>
          <span class="flex gap x2">
            <label class="flex gap min">
              <input type="checkbox" on:change={overlay} />
              modal
            </label>
            <label class="flex gap min">
              <input type="checkbox" on:change={invalid} />
              missing
            </label>
            <label class="flex gap min">
              <input type="checkbox" bind:checked={valid} />
              validate
            </label>
          </span>
        </slot>
      </Schema>
    </div>
  </Fence>
</details>
