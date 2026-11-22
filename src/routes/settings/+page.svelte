<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { slide } from 'svelte/transition';

  let newItemName = $state('');
  let newItemCategory = $state('General');
  let newItemPrice = $state(500);

  let multiplierInput = $state(laundryStore.expressMultiplier);
  let storeIdInput = $state(laundryStore.storeId);

  let editingId = $state(null);
  let editPriceValue = $state(0);

  const categories = ['Traditional', 'General', 'Formal', 'Bedding'];

  function handleAddPrice(e) {
    e.preventDefault();
    const price = Number(newItemPrice);
    if (!newItemName.trim() || price <= 0) return;

    laundryStore.prices.push({
      id: `p-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      price
    });
    laundryStore.save();

    newItemName = '';
    newItemPrice = 500;
  }

  function startEditPrice(item) {
    editingId = item.id;
    editPriceValue = item.price;
  }

  function saveEditPrice(item) {
    const val = Number(editPriceValue);
    if (val > 0) {
      item.price = val;
      laundryStore.save();
    }
    editingId = null;
  }

  function deletePrice(id) {
    laundryStore.prices = laundryStore.prices.filter((p) => p.id !== id);
    laundryStore.save();
  }

  function applyMultiplier() {
    const val = Number(multiplierInput);
    if (val >= 1) {
      laundryStore.expressMultiplier = val;
      laundryStore.save();
    }
  }

  function applyStoreId() {
    laundryStore.setStoreId(storeIdInput);
    storeIdInput = laundryStore.storeId;
  }

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;
</script>

<svelte:head>
  <title>Admin Settings — Hali Laundry</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="max-w-7xl mx-auto space-y-5 pb-16">

  {#if laundryStore.role !== 'admin'}
    <div class="glass-card p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
      <p class="text-3xl">🔒</p>
      <h1 class="text-xl font-extrabold text-white">Admin Access Required</h1>
      <p class="text-xs sm:text-sm text-slate-300">
        Switch to Admin mode in the top bar to manage garment pricing, express multipliers, and store settings.
      </p>
      <a
        href="/dashboard"
        class="btn-tactile inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-extrabold"
      >
        Return to Dashboard
      </a>
    </div>
  {:else}

    <!-- Header -->
    <div class="glass-card p-4 sm:p-6 rounded-3xl">
      <h1 class="text-xl sm:text-2xl font-extrabold text-white">Admin Settings & Price Menu</h1>
      <p class="text-xs sm:text-sm text-slate-300 mt-1">
        Configure garment rates, express pricing, and active store isolation.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

      <!-- Left Column: Store & Express Settings (5 cols) -->
      <div class="lg:col-span-5 space-y-5">

        <!-- Multi-Tenancy Store ID -->
        <div class="glass-card p-4 sm:p-6 rounded-3xl space-y-3">
          <h2 class="text-base font-extrabold text-white">🏢 Store / Tenant ID</h2>
          <p class="text-xs text-slate-300">
            Isolates orders, customers, and prices per laundry branch.
          </p>
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={storeIdInput}
              class="glass-well flex-1 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onclick={applyStoreId}
              class="btn-tactile px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs shrink-0"
            >
              Switch
            </button>
          </div>
        </div>

        <!-- Express Multiplier -->
        <div class="glass-card p-4 sm:p-6 rounded-3xl space-y-3">
          <h2 class="text-base font-extrabold text-white">⚡ Express Multiplier</h2>
          <p class="text-xs text-slate-300">
            Multiplier applied when an order is marked Express (e.g. `1.5` = +50%).
          </p>
          <div class="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="1"
              bind:value={multiplierInput}
              class="glass-well flex-1 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onclick={applyMultiplier}
              class="btn-tactile px-4 py-2.5 rounded-xl bg-sky-500 text-white font-extrabold text-xs shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        <!-- Add New Garment Price -->
        <form onsubmit={handleAddPrice} class="glass-card p-4 sm:p-6 rounded-3xl space-y-3.5">
          <h2 class="text-base font-extrabold text-white">+ Add Garment Price</h2>

          <div>
            <label for="newItemName" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Garment Name
            </label>
            <input
              type="text"
              id="newItemName"
              bind:value={newItemName}
              placeholder="e.g. Babanriga"
              class="glass-well w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="newItemCategory" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Category
              </label>
              <select
                id="newItemCategory"
                bind:value={newItemCategory}
                class="glass-well w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
              >
                {#each categories as cat}
                  <option value={cat} class="bg-slate-900">{cat}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="newItemPrice" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Price (₦)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                id="newItemPrice"
                bind:value={newItemPrice}
                class="glass-well w-full rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn-tactile w-full py-3 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm"
          >
            Save to Price Menu
          </button>
        </form>

      </div>

      <!-- Right Column: Current Price List (7 cols) -->
      <div class="lg:col-span-7 glass-card p-4 sm:p-6 rounded-3xl space-y-3">
        <h2 class="text-base font-extrabold text-white">Current Price List ({laundryStore.prices.length})</h2>

        <div class="space-y-2.5">
          {#each laundryStore.prices as item}
            <div class="glass-well p-3.5 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-extrabold text-white truncate">{item.name}</p>
                  <span class="text-[11px] text-slate-400">{item.category}</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-sm font-extrabold text-emerald-300">{formatNaira(item.price)}</span>
                  <button
                    type="button"
                    onclick={() => startEditPrice(item)}
                    class="btn-tactile px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onclick={() => deletePrice(item.id)}
                    class="btn-tactile px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {#if editingId === item.id}
                <div transition:slide={{ duration: 150 }} class="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="number"
                    min="50"
                    step="50"
                    bind:value={editPriceValue}
                    class="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white"
                  />
                  <button
                    type="button"
                    onclick={() => saveEditPrice(item)}
                    class="btn-tactile px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onclick={() => editingId = null}
                    class="btn-tactile px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

    </div>

  {/if}

</div>