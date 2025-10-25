<script lang="ts">
  import { onMount } from 'svelte';

  let count = $state(0);
  let apiHealth = $state<string>('Checking...');

  // Test API connection
  onMount(async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      apiHealth = `API Status: ${data.status}`;
    } catch (error) {
      apiHealth = 'API not reachable';
    }
  });

  function increment(): void {
    count += 1;
  }
</script>

<main>
  <h1>Budget Tracker</h1>
  
  <div class="card">
    <button onclick={increment}>
      Count is {count}
    </button>
    <p>Click the button to test Svelte reactivity</p>
  </div>

  <div class="api-status">
    <p>{apiHealth}</p>
  </div>

  <p class="info">
    Frontend running on Vite + Svelte 5 + TypeScript
  </p>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    color: #ff3e00;
    font-size: 3rem;
    margin-bottom: 2rem;
  }

  .card {
    padding: 2rem;
    background: #f0f0f0;
    border-radius: 8px;
    margin: 2rem 0;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-size: 1.25rem;
    border-radius: 8px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover {
    background: #ff3e00;
    color: white;
  }

  .api-status {
    margin: 2rem 0;
    padding: 1rem;
    background: #e8f4f8;
    border-radius: 8px;
  }

  .info {
    color: #666;
    margin-top: 2rem;
  }
</style>