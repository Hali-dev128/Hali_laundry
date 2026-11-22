<script>
  import { slide } from 'svelte/transition';
  import { laundryStore } from '$lib/stores/store.svelte.js';

  // Form State for Adding New Garment Price
  let newName = $state('');
  let newCategory = $state('General');
  let newPrice = $state('');

  // Inline Editing State
  let editingId = $state(null);
  let editPriceValue = $state(0);

  // Shop Configuration State (Escape Hatch for Future Delivery Support)
  let enableDeliveries = $state(false);
  let expressPercent = $state(Math.round((laundryStore.expressMultiplier - 1) * 100));

  function handleAddPrice(e) {
    e.preventDefault();
    if (!newName.trim() || !newPrice || Number(newPrice) <= 0) return;

    laundryStore.prices.push({
      id: `p-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice)
    });

    laundryStore.save();
    newName = '';
    newPrice = '';
  }

  function startEdit(item) {
    editingId = item.id;
    editPriceValue = item.price;
  }

  function saveEdit(itemId) {
    const item = laundryStore.prices.find(p => p.id === itemId);
    if (item && Number(editPriceValue) > 0) {
      item.price = Number(editPriceValue);
      laundryStore.save();
    }
    editingId = null;
  }

  function deletePrice(itemId) {
    laundryStore.prices = laundryStore.prices.filter(p => p.id !== itemId);
    laundryStore.save();
  }

  function updateExpressMultiplier() {
    const pct = Math.max(0, Number(expressPercent));
    laundryStore.expressMultiplier = 1 + (pct / 100);
    laundryStore.save();
  }

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;
</script>

{#if laundryStore.role !== 'admin'}
  <!-- Role Guardrail if a Worker tries to visit /settings directly -->
  <div class="max-w-md mx-auto mt-16 bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
    <div class="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-2xl">
      🔒
    </div>
    <h1 class="text-xl font-extrabold text-white">Admin Access Only</h1>
    <p class="text-sm text-slate-400">
      Workers are restricted from modifying garment prices or shop configurations. Switch to Admin view in the top bar to test this page.
    </p>
    <a href="/" class="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition">
      &larr; Return to Dashboard
    </a>
  </div>
{:else}

 <div class="max-w-5xl mx-auto space-y-8 pb-16">
    <!-- Multi-Tenancy Store ID Switcher Card -->
    <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
    <h2 class="text-base font-bold text-white flex items-center gap-2">
        <span>🏢</span> Store / Tenant Identifier
    </h2>
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Current Store ID</label>
        <div class="flex gap-2">
        <input 
            type="text" 
            bind:value={laundryStore.storeId} 
            class="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
        />
        <button 
            type="button"
            onclick={() => laundryStore.setStoreId(laundryStore.storeId)}
            class="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition"
        >
            Set Store
        </button>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Changing this isolates data so different shops don't mix records.</p>
    </div>
    </div>
    
    <!-- Header -->
    <div class="bg-linear-to-r from-slate-900/80 via-slate-900/50 to-amber-950/20 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          👑 Admin Control Center
        </span>
        <h1 class="text-2xl font-extrabold text-white mt-2">Price List & Shop Settings</h1>
        <p class="text-sm text-slate-400 mt-1">Manage garment rates, express surcharges, and system rules.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT COLUMN: Add New Garment & Global Rules (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Add Garment Form -->
        <form onsubmit={handleAddPrice} class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>➕</span> Add New Garment Rate
          </h2>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Garment Name *</label>
            <input 
              type="text" 
              bind:value={newName} 
              placeholder="e.g. White Kaftan, Curtains..." 
              required
              class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select 
                bind:value={newCategory}
                class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              >
                <option value="General">General</option>
                <option value="Traditional">Traditional</option>
                <option value="Formal">Formal</option>
                <option value="Bedding">Bedding</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Price (₦) *</label>
              <input 
                type="number" 
                bind:value={newPrice} 
                min="50"
                step="50"
                placeholder="1000" 
                required
                class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            class="w-full py-3 rounded-2xl bg-linear-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition transform active:scale-95"
          >
            Save Item to Price Menu
          </button>
        </form>

        <!-- Shop Rules & Escape Hatch Card -->
        <div transition:slide={{ duration: 160 }} class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-5">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Operations Configuration
          </h2>

          <!-- Express Surcharge Percentage -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Express Surcharge (%)</label>
            <div class="flex items-center gap-2">
              <input 
                type="number" 
                bind:value={expressPercent}
                min="0"
                max="200"
                class="w-28 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
              />
              <button 
                type="button"
                onclick={updateExpressMultiplier}
                class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
              >
                Apply ({expressPercent}%)
              </button>
            </div>
            <p class="text-[11px] text-slate-400">Current multiplier: <span class="text-amber-400 font-bold">{laundryStore.expressMultiplier}x</span></p>
          </div>

          <!-- Future Escape Hatch Toggle -->
          <div class="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-white">Enable Delivery Dispatch</p>
              <p class="text-[10px] text-slate-400">Currently Walk-in Pickup Only (v1)</p>
            </div>
            <input 
              type="checkbox" 
              bind:checked={enableDeliveries}
              class="w-5 h-5 rounded accent-amber-500 cursor-pointer"
            />
          </div>
          {#if enableDeliveries}
            <p class="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
              Delivery module flag enabled! Ready to unlock dispatch fields when building the backend.
            </p>
          {/if}
        </div>

      </div>

      <!-- RIGHT COLUMN: Current Active Price List (7 Cols) -->
      <div class="lg:col-span-7">
        <div class="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-white">Active Garment Price Menu</h2>
            <span class="text-xs text-slate-400">{laundryStore.prices.length} items listed</span>
          </div>

          <div class="divide-y divide-white/5">
            {#each laundryStore.prices as item}
              <div class="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-white">{item.name}</p>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {item.category}
                  </span>
                </div>

                <div class="flex items-center transition:slide={{ duration: 160 }} gap-2">
                  {#if editingId === item.id}
                    <input 
                      type="number" 
                      bind:value={editPriceValue}
                      class="w-24 bg-slate-950 border border-amber-500 rounded-xl px-2.5 py-1 text-white text-xs font-bold"
                    />
                    <button 
                      onclick={() => saveEdit(item.id)}
                      class="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Save
                    </button>
                    <button 
                      onclick={() => editingId = null}
                      class="px-2 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs"
                    >
                      &times;
                    </button>
                  {:else}
                    <span class="text-sm font-extrabold text-emerald-400 mr-2">{formatNaira(item.price)}</span>
                    <button 
                      onclick={() => startEdit(item)}
                      class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                    >
                      Edit
                    </button>
                    <button 
                      onclick={() => deletePrice(item.id)}
                      class="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
                    >
                      Delete
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    </div>
  </div>
{/if}