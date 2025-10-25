<script lang="ts">
  import { onMount } from 'svelte';

  let count = $state(0);
  let apiHealth = $state<string>('Checking...');

  // Test API connection
  onMount(async () => {
    try {
      const response = await fetch('/health');
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

<main class="max-w-4xl mx-auto p-8 text-center">
  <h1 class="text-5xl font-bold text-primary-600 mb-8">
    Budget Tracker
  </h1>
  
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
    <button 
      onclick={increment}
      class="px-6 py-3 text-xl font-semibold rounded-lg border-2 border-primary-600 bg-white text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-200"
    >
      Count is {count}
    </button>
    <p class="mt-4 text-gray-600 dark:text-gray-400">
      Click the button to test Svelte reactivity
    </p>
  </div>

  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
    <p class="text-lg font-medium text-blue-900 dark:text-blue-100">
      {apiHealth}
    </p>
  </div>

  <p class="text-gray-500 dark:text-gray-400">
    Frontend running on Vite + Svelte 5 + TypeScript + Tailwind CSS
  </p>
</main>