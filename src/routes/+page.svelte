<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { goto } from '$app/navigation';
  import { slide } from 'svelte/transition';

  let mode = $state('login');
  let loginStoreId = $state('hali_laundry_01');
  let loginPassword = $state('');
  let selectedRole = $state('worker');

  let storeName = $state('');
  let contactInfo = $state('');
  let signupPassword = $state('');
  let errorMsg = $state('');

  function handleLogin(e) {
    e.preventDefault();
    errorMsg = '';
    if (!loginStoreId.trim()) {
      errorMsg = 'Please enter your Store ID.';
      return;
    }
    laundryStore.login({ storeId: loginStoreId, role: selectedRole });
    goto('/dashboard');
  }

  function handleSignup(e) {
    e.preventDefault();
    errorMsg = '';
    if (!storeName.trim() || !contactInfo.trim()) {
      errorMsg = 'Please enter your laundry business name and phone/email.';
      return;
    }
    laundryStore.signupStore({ storeName, phoneOrEmail: contactInfo });
    goto('/dashboard');
  }

  function handleQuickDemo(role) {
    laundryStore.login({ storeId: 'hali_laundry_01', role });
    goto('/dashboard');
  }
</script>

<div class="min-h-[82vh] flex items-center justify-center py-6 sm:py-10">
  <div class="glass-card w-full max-w-md rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6">
    
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-sky-500/30">
        🧺
      </div>
      <h1 class="text-2xl font-extrabold text-white tracking-tight">Hali Laundry</h1>
      <p class="text-xs text-slate-300">
        {mode === 'login' ? 'Sign in to access your shop workflow' : 'Register a new laundry store workspace'}
      </p>
    </div>

    <!-- Mode Switcher -->
    <div class="glass-well grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl text-xs font-bold">
      <button
        type="button"
        onclick={() => { mode = 'login'; errorMsg = ''; }}
        class="btn-tactile py-2.5 rounded-xl transition {mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'}"
      >
        Sign In
      </button>
      <button
        type="button"
        onclick={() => { mode = 'signup'; errorMsg = ''; }}
        class="btn-tactile py-2.5 rounded-xl transition {mode === 'signup' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-300 hover:text-white'}"
      >
        New Store Sign Up
      </button>
    </div>

    {#if errorMsg}
      <div transition:slide={{ duration: 160 }} class="bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-semibold px-4 py-3 rounded-2xl">
        {errorMsg}
      </div>
    {/if}

    {#if mode === 'login'}
      <form onsubmit={handleLogin} class="space-y-4">
        <div>
          <label for="loginStoreId" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Store ID
          </label>
          <input
            type="text"
            id="loginStoreId"
            bind:value={loginStoreId}
            placeholder="e.g. hali_laundry_01"
            required
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        <div>
          <label for="loginRole" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Access Role
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onclick={() => selectedRole = 'worker'}
              class="btn-tactile py-3 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'worker' ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400' : 'glass-well text-slate-300 hover:text-white'}"
            >
              👨‍💼 Worker
            </button>
            <button
              type="button"
              onclick={() => selectedRole = 'admin'}
              class="btn-tactile py-3 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'admin' ? 'bg-amber-500/25 text-amber-200 border-amber-400' : 'glass-well text-slate-300 hover:text-white'}"
            >
              👑 Admin
            </button>
          </div>
        </div>

        <div>
          <label for="loginPassword" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            PIN / Password
          </label>
          <input
            type="password"
            id="loginPassword"
            bind:value={loginPassword}
            placeholder="Any PIN works in demo mode"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        <button
          type="submit"
          class="btn-tactile w-full py-3.5 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-sky-500/30"
        >
          Enter Shop Workspace &rarr;
        </button>
      </form>
    {:else}
      <form onsubmit={handleSignup} class="space-y-4">
        <div>
          <label for="signupStoreName" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Laundry Business Name *
          </label>
          <input
            type="text"
            id="signupStoreName"
            bind:value={storeName}
            placeholder="e.g. CleanWave Express"
            required
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <div>
          <label for="signupContactInfo" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Owner Phone or Email *
          </label>
          <input
            type="text"
            id="signupContactInfo"
            bind:value={contactInfo}
            placeholder="e.g. 08012345678 or owner@shop.com"
            required
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <div>
          <label for="signupPassword" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Create Password
          </label>
          <input
            type="password"
            id="signupPassword"
            bind:value={signupPassword}
            placeholder="Create a strong password"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <button
          type="submit"
          class="btn-tactile w-full py-3.5 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30"
        >
          Create Store & Launch ✨
        </button>
      </form>
    {/if}

    <!-- One-Click Demo Access -->
    <div class="pt-4 border-t border-slate-700/70 space-y-2.5">
      <p class="text-[11px] text-center text-slate-300 font-medium">
        Evaluating the demo? Launch instantly with sample data:
      </p>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onclick={() => handleQuickDemo('admin')}
          class="btn-tactile py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs font-extrabold"
        >
          ⚡ Demo Admin
        </button>
        <button
          type="button"
          onclick={() => handleQuickDemo('worker')}
          class="btn-tactile py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 text-xs font-extrabold"
        >
          ⚡ Demo Worker
        </button>
      </div>
    </div>

  </div>
</div>