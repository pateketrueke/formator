<script>
  import { Schema, Input } from '../../lib/main.js';
</script>

<details>
  <summary id="test-builder">Form builder</summary>
  <Schema debug>
    <Input name="email" label="E-mail" format="email" required autocomplete="current-email" />
    <Input name="password" label="New password" password required autocomplete="current-password" />
    <Input name="new_password" label="Confirm password" password required autocomplete="confirm-password" />
  </Schema>
</details>
