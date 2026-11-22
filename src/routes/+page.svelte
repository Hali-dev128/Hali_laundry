<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let mode = $state('login'); // 'login' | 'signup'

  // Login fields
  let loginStoreId = $state('hali_laundry_01');
  let loginPassword = $state('');
  let selectedRole = $state('worker');
  let rememberLogin = $state(true);

  // Signup fields
  let storeName = $state('');
  let contactInfo = $state('');
  let signupPassword = $state('');
  let rememberSignup = $state(true);

  let errorMsg = $state('');

  const storeIdPattern = /^[a-zA-Z0-9_-]{3,40}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function isValidPhoneOrEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.includes('@')) {
      return emailPattern.test(trimmed);
    }
    const digitsOnly = trimmed.replace(/[\s\-()+]/g, '');
    return /^\d{7,15}$/.test(digitsOnly);
  }

  onMount(() => {
    if (!browser) return;
    const saved = laundryStore.getRemembered?.();
    if (saved) {
      if (saved.storeId) loginStoreId = saved.storeId;
      if (saved.role) selectedRole = saved.role;
      if (saved.storeName) storeName = saved.storeName;
      if (saved.contactInfo) contactInfo = saved.contactInfo;
      rememberLogin = saved.remember ?? true;
      rememberSignup = saved.remember ?? true;
    }
  });

  function handleLogin(e) {
    e.preventDefault();
    errorMsg = '';

    const cleanId = loginStoreId.trim();
    const cleanPin = loginPassword.trim();

    if (!cleanId) {
      errorMsg = 'Please enter your Store ID.';
      return;
    }

    if (!storeIdPattern.test(cleanId)) {
      errorMsg = 'Store ID must be 3–40 characters using only letters, numbers, underscores (_), or hyphens (-).';
      return;
    }

    if (!cleanPin) {
      errorMsg = 'Please enter a PIN or password (any 4+ character PIN works in demo mode).';
      return;
    }

    if (cleanPin.length < 4) {
      errorMsg = 'PIN or password must be at least 4 characters long.';
      return;
    }

    laundryStore.setRemembered?.(
      rememberLogin
        ? {
            remember: true,
            storeId: cleanId,
            role: selectedRole
          }
        : null
    );

    laundryStore.login({
      storeId: cleanId,
      role: selectedRole
    });
    goto('/dashboard');
  }

  function handleSignup(e) {
    e.preventDefault();
    errorMsg = '';

    const cleanName = storeName.trim();
    const cleanContact = contactInfo.trim();
    const cleanPassword = signupPassword.trim();

    if (cleanName.length < 2) {
      errorMsg = 'Laundry business name must be at least 2 characters.';
      return;
    }

    if (!isValidPhoneOrEmail(cleanContact)) {
      errorMsg = 'Please enter a valid phone number (e.g. 08012345678) or email address.';
      return;
    }

    if (cleanPassword.length < 6) {
      errorMsg = 'Please create a password with at least 6 characters.';
      return;
    }

    laundryStore.setRemembered?.(
      rememberSignup
        ? {
            remember: true,
            storeName: cleanName,
            contactInfo: cleanContact
          }
        : null
    );

    laundryStore.signupStore({
      storeName: cleanName,
      phoneOrEmail: cleanContact
    });
    goto('/dashboard');
  }

  function handleQuickDemo(role) {
    errorMsg = '';
    laundryStore.login({
      storeId: 'hali_laundry_01',
      role
    });
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Sign In or Create Store — Hali Laundry</title>
  <meta
    name="description"
    content="Sign in to Hali Laundry, register a new laundry shop workspace, or launch an instant Admin or Worker demo."
  />
</svelte:head>

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
      <div
        role="alert"
        transition:slide={{ duration: 160 }}
        class="bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-semibold px-4 py-3 rounded-2xl"
      >
        {errorMsg}
      </div>
    {/if}

    {#if mode === 'login'}
      <form onsubmit={handleLogin} novalidate class="space-y-4">
        <div>
          <label for="login-store-id" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Store ID
          </label>
          <input
            id="login-store-id"
            type="text"
            bind:value={loginStoreId}
            placeholder="e.g. hali_laundry_01"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        <div>
          <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Access Role
          </span>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onclick={() => (selectedRole = 'worker')}
              class="btn-tactile py-3 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'worker' ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400' : 'glass-well text-slate-300 hover:text-white'}"
            >
              👨‍💼 Worker
            </button>
            <button
              type="button"
              onclick={() => (selectedRole = 'admin')}
              class="btn-tactile py-3 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'admin' ? 'bg-amber-500/25 text-amber-200 border-amber-400' : 'glass-well text-slate-300 hover:text-white'}"
            >
              👑 Admin
            </button>
          </div>
        </div>

        <div>
          <label for="login-password" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            PIN / Password
          </label>
          <input
            id="login-password"
            type="password"
            bind:value={loginPassword}
            placeholder="Any 4+ char PIN works in demo mode"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        <label class="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
          <input
            type="checkbox"
            bind:checked={rememberLogin}
            class="w-4 h-4 rounded accent-sky-500 cursor-pointer"
          />
          <span class="text-xs font-semibold text-slate-300">Remember my Store ID & role</span>
        </label>

        <button
          type="submit"
          class="btn-tactile w-full py-3.5 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-sky-500/30"
        >
          Enter Shop Workspace &rarr;
        </button>
      </form>
    {:else}
      <form onsubmit={handleSignup} novalidate class="space-y-4">
        <div>
          <label for="signup-store-name" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Laundry Business Name *
          </label>
          <input
            id="signup-store-name"
            type="text"
            bind:value={storeName}
            placeholder="e.g. CleanWave Express"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <div>
          <label for="signup-contact" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Owner Phone or Email *
          </label>
          <input
            id="signup-contact"
            type="text"
            bind:value={contactInfo}
            placeholder="e.g. 08012345678 or owner@shop.com"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <div>
          <label for="signup-password" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Create Password
          </label>
          <input
            id="signup-password"
            type="password"
            bind:value={signupPassword}
            placeholder="At least 6 characters"
            class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        <label class="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
          <input
            type="checkbox"
            bind:checked={rememberSignup}
            class="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
          />
          <span class="text-xs font-semibold text-slate-300">Remember my store details on this device</span>
        </label>

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