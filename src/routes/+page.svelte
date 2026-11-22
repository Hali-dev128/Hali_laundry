<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { goto } from '$app/navigation';

  let mode = $state('login'); // 'login' | 'signup'

  // Login fields
  let loginStoreId = $state('hali_laundry_01');
  let loginPassword = $state('');
  let selectedRole = $state('worker');

  // Signup fields
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
    laundryStore.login({
      storeId: loginStoreId,
      role: selectedRole
    });
    goto('/dashboard');
  }

  function handleSignup(e) {
    e.preventDefault();
    errorMsg = '';
    if (!storeName.trim() || !contactInfo.trim()) {
      errorMsg = 'Please enter your laundry business name and phone/email.';
      return;
    }
    laundryStore.signupStore({
      storeName,
      phoneOrEmail: contactInfo
    });
    goto('/dashboard');
  }

  // One-click demo login for CV reviewers / clients
  function handleQuickDemo(role) {
    laundryStore.login({
      storeId: 'hali_laundry_01',
      role
    });
    goto('/dashboard');
  }
</script>

<div class="min-h-[82vh] flex items-center justify-center px-4 py-10">
  <div class="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
    
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-sky-500/25">
        🧺
      </div>
      <h1 class="text-2xl font-extrabold text-white tracking-tight">Hali Laundry</h1>
      <p class="text-xs text-slate-400">
        {mode === 'login' ? 'Sign in to access your shop workflow' : 'Register a new laundry store workspace'}
      </p>
    </div>

    <!-- Mode Switcher (Login vs Sign Up) -->
    <div class="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
      <button
        type="button"
        onclick={() => { mode = 'login'; errorMsg = ''; }}
        class="py-2.5 rounded-xl transition {mode === 'login' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'text-slate-400 hover:text-white'}"
      >
        Sign In
      </button>
      <button
        type="button"
        onclick={() => { mode = 'signup'; errorMsg = ''; }}
        class="py-2.5 rounded-xl transition {mode === 'signup' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}"
      >
        New Store Sign Up
      </button>
    </div>

    {#if errorMsg}
      <div class="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium px-4 py-3 rounded-2xl">
        {errorMsg}
      </div>
    {/if}

    {#if mode === 'login'}
      <form onsubmit={handleLogin} class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Store ID
          </label>
          <input
            type="text"
            bind:value={loginStoreId}
            placeholder="e.g. hali_laundry_01"
            required
            class="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Access Role
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onclick={() => selectedRole = 'worker'}
              class="py-2.5 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'worker' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-950/50 text-slate-400 border-white/10 hover:text-white'}"
            >
              👨‍💼 Worker / Staff
            </button>
            <button
              type="button"
              onclick={() => selectedRole = 'admin'}
              class="py-2.5 px-3 rounded-xl text-xs font-bold border transition {selectedRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950/50 text-slate-400 border-white/10 hover:text-white'}"
            >
              👑 Admin / Owner
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            PIN / Password
          </label>
          <input
            type="password"
            bind:value={loginPassword}
            placeholder="Any PIN works in demo mode"
            class="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <button
          type="submit"
          class="w-full py-3.5 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition transform active:scale-95"
        >
          Enter Shop Workspace &rarr;
        </button>
      </form>
    {:else}
      <form onsubmit={handleSignup} class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Laundry Business Name *
          </label>
          <input
            type="text"
            bind:value={storeName}
            placeholder="e.g. CleanWave Express"
            required
            class="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Owner Phone or Email *
          </label>
          <input
            type="text"
            bind:value={contactInfo}
            placeholder="e.g. 08012345678 or owner@shop.com"
            required
            class="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Create Password
          </label>
          <input
            type="password"
            bind:value={signupPassword}
            placeholder="Create a strong password"
            class="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          class="w-full py-3.5 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition transform active:scale-95"
        >
          Create Store & Launch ✨
        </button>
      </form>
    {/if}

    <!-- One-Click Demo Access for CV Reviewers -->
    <div class="pt-4 border-t border-white/10 space-y-2.5">
      <p class="text-[11px] text-center text-slate-400">
        Recruiter or evaluating the demo? Launch instantly with sample data:
      </p>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onclick={() => handleQuickDemo('admin')}
          class="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
        >
          ⚡ Demo as Admin
        </button>
        <button
          type="button"
          onclick={() => handleQuickDemo('worker')}
          class="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
        >
          ⚡ Demo as Worker
        </button>
      </div>
    </div>

  </div>
</div>