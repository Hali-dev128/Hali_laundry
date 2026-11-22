<script>
  import './layout.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { fade } from 'svelte/transition';

  let { children } = $props();

  $effect(() => {
    if (browser && !laundryStore.isAuthenticated && page.url.pathname !== '/') {
      goto('/');
    }
  });
</script>

<div class="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
  
  <!-- Ambient Glassmorphism Background Accents -->
  <div class="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div class="ambient-blob absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl"></div>
    <div class="ambient-blob absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" style="animation-delay: -4s;"></div>
    <div class="ambient-blob absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" style="animation-delay: -8s;"></div>
  </div>

  {#if laundryStore.isAuthenticated}
    <div transition:fade={{ duration: 180 }}>
      <Navbar />
    </div>
  {/if}

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#key page.url.pathname}
      <div in:fade={{ duration: 180, delay: 40 }}>
        {@render children()}
      </div>
    {/key}
  </main>

  <footer class="py-4 text-center text-xs text-slate-500 border-t border-white/5">
    {laundryStore.storeName} &bull; Order & Workflow System
  </footer>
</div>