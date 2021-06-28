<script>
  import { Schema, Input } from '../../lib/main.js';

  let status = 'pristine';
  let valid = false;

  function save(e) {
    alert(JSON.stringify(e.detail, null, 2));
  }
  function check(e) {
    valid = e.detail.valid;
    status = e.detail.valid ? 'valid' : 'invalid';
  }
</script>

<details>
  <summary id="test-builder">Form builder</summary>
  <Schema debug on:submit={save} on:change={check}>
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
      <span class="flex gap">
        <label for="validity" class="min">checkValidity</label>
        <input id="validity" type="checkbox" bind:checked={valid} />
      </span>
    </slot>
  </Schema>
</details>
