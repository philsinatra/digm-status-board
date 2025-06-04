<div class="card">
  {#if $$slots.header}
  <header class="card-header">
    <slot name="header"></slot>
  </header>
  {/if}
  <div class="card-content">
    <slot></slot>
  </div>

  {#if $$slots.footer}
  <footer class="card-footer">
    <slot name="footer"></slot>
  </footer>
  {/if}
</div>


<style>
  .card {
    background-color: var(--color-white);
    border: 1px solid #ccc;
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);

  }

  .card-header,
  .card-footer {
    background-color: var(--color-drexel-blue);
  color: var(--color-white);
    font-weight: bold;
    padding: 0.5rem 0;
  }

  .card-header {
    border-bottom: 1px solid #eee;
  }

  .card-content {
    background-color: var(--color-drexel-neutral-gray);
    color: var(--color-drexel-blue);
  }

  .card-footer {
    border-top: 1px solid #eee;
    color: #666;
    font-size: 0.9rem;
  }
</style>