<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const isActive = (path) => page.url.pathname === path;

  function handleLogout() {
    laundryStore.logout();
    goto('/');
  }
</script>

<header class="bg-slate-900/70 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Brand & Network Status -->
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
        🧺
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-base font-bold tracking-tight text-white block leading-none">{laundryStore.storeName}</span>
          <span class="flex h-2 w-2 relative" title={laundryStore.isOnline ? 'Online' : 'Offline'}>
            {#if laundryStore.isOnline}
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            {:else}
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            {/if}
          </span>
        </div>
        <span class="text-[10px] text-slate-400 font-medium">ID: {laundryStore.storeId}</span>
      </div>

      <span class="text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold {laundryStore.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
        {laundryStore.role}
      </span>
    </div>

    <!-- Navigation Links -->
    <nav class="hidden md:flex items-center space-x-1 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
      <a href="/dashboard" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all {isActive('/dashboard') ? 'bg-sky-500/20 text-sky-400 shadow-sm border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
        Dashboard
      </a>
      <a href="/orders/new" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all {isActive('/orders/new') ? 'bg-sky-500/20 text-sky-400 shadow-sm border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
        New Order
      </a>
      <a href="/orders" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all {isActive('/orders') ? 'bg-sky-500/20 text-sky-400 shadow-sm border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
        Active Orders
      </a>

      {#if laundryStore.role === 'admin'}
        <a href="/settings" class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all {isActive('/settings') ? 'bg-amber-500/20 text-amber-400 shadow-sm border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
          ⚙️ Settings
        </a>
      {/if}
    </nav>

    <!-- Role Switcher & Logout -->
    <div class="flex items-center space-x-2">
      <button 
        onclick={() => laundryStore.toggleRole()}
        class="text-xs font-semibold px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
      >
        {laundryStore.role === 'worker' ? 'Admin 👑' : 'Worker 👨‍💼'}
      </button>
      <button 
        onclick={handleLogout}
        class="text-xs btn-tactile font-semibold px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
      >
        Logout
      </button>
    </div>

  </div>

  <!-- Mobile Sub-nav -->
  <div class="md:hidden flex items-center justify-around bg-slate-950/80 backdrop-blur-md py-2.5 border-t border-white/5 text-xs font-medium">
    <a href="/dashboard" class="{isActive('/dashboard') ? 'text-sky-400 font-bold' : 'text-slate-400'}">Dashboard</a>
    <a href="/orders/new" class="{isActive('/orders/new') ? 'text-sky-400 font-bold' : 'text-slate-400'}">New Order</a>
    <a href="/orders" class="{isActive('/orders') ? 'text-sky-400 font-bold' : 'text-slate-400'}">Orders</a>
    {#if laundryStore.role === 'admin'}
      <a href="/settings" class="{isActive('/settings') ? 'text-amber-400 font-bold' : 'text-slate-400'}">Settings</a>
    {/if}
  </div>
</header>