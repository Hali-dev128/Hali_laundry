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

<header class="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/70 sticky top-0 z-50 shadow-xl">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
    
    <!-- Brand & Network Status -->
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 text-white text-sm sm:text-base font-bold">
        🧺
      </div>

      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
          {laundryStore.storeName}
        </span>
        <span class="flex h-2 w-2 shrink-0 relative" title={laundryStore.isOnline ? 'Online' : 'Offline'}>
          {#if laundryStore.isOnline}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          {:else}
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          {/if}
        </span>
      </div>

      <span class="hidden lg:inline-block text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold {laundryStore.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'}">
        {laundryStore.role}
      </span>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex items-center space-x-1 bg-[#060913] p-1.5 rounded-xl border border-slate-700/70">
      <a href="/dashboard" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all {isActive('/dashboard') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
        Dashboard
      </a>
      <a href="/orders/new" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all {isActive('/orders/new') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
        New Order
      </a>
      <a href="/orders" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all {isActive('/orders') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
        Active Orders
      </a>

      {#if laundryStore.role === 'admin'}
        <a href="/settings" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all {isActive('/settings') ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
          ⚙️ Settings
        </a>
      {/if}
    </nav>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <button 
        onclick={() => laundryStore.toggleRole()}
        class="btn-tactile text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80"
      >
        {laundryStore.role === 'worker' ? '👑 Admin' : '👨‍💼 Worker'}
      </button>
      <button 
        onclick={handleLogout}
        class="btn-tactile text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40"
      >
        Logout
      </button>
    </div>

  </div>

  <!-- Mobile Sub-Nav -->
  <nav class="md:hidden grid {laundryStore.role === 'admin' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 bg-[#060913] px-2 py-2 border-t border-slate-800 text-xs font-bold">
    <a href="/dashboard" class="py-2 rounded-lg text-center transition {isActive('/dashboard') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/70'}">
      Dashboard
    </a>
    <a href="/orders/new" class="py-2 rounded-lg text-center transition {isActive('/orders/new') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/70'}">
      + Order
    </a>
    <a href="/orders" class="py-2 rounded-lg text-center transition {isActive('/orders') ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/70'}">
      Orders
    </a>
    {#if laundryStore.role === 'admin'}
      <a href="/settings" class="py-2 rounded-lg text-center transition {isActive('/settings') ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-300 hover:bg-slate-800/70'}">
        Settings
      </a>
    {/if}
  </nav>
</header>