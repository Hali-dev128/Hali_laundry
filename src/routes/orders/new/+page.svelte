<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import ReceiptModal from '$lib/components/RecieptModal.svelte';
  import { fly, slide } from 'svelte/transition';

  let customerName = $state('');
  let customerPhone = $state('');
  let selectedCategory = $state('All');
  let cart = $state([]);
  let isExpress = $state(false);
  let amountPaid = $state(0);

  let createdOrder = $state(null);
  let showReceipt = $state(false);
  let errorMessage = $state('');

  const categories = ['All', 'Traditional', 'General', 'Formal', 'Bedding'];

  let filteredPrices = $derived(
    selectedCategory === 'All'
      ? laundryStore.prices
      : laundryStore.prices.filter((p) => p.category === selectedCategory)
  );

  let subtotal = $derived(
    cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  );

  let totalAmount = $derived(
    isExpress ? Math.round(subtotal * laundryStore.expressMultiplier) : subtotal
  );

  let balanceDue = $derived(
    Math.max(0, totalAmount - Number(amountPaid || 0))
  );

  function addToCart(priceItem) {
    const existing = cart.find((c) => c.priceId === priceItem.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        priceId: priceItem.id,
        name: priceItem.name,
        unitPrice: priceItem.price,
        qty: 1,
        note: ''
      });
    }
  }

  function updateQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    const nextQty = item.qty + delta;
    if (nextQty <= 0) {
      cart.splice(index, 1);
    } else {
      item.qty = nextQty;
    }
  }

  function removeItem(index) {
    cart.splice(index, 1);
  }

  function handleSubmitOrder(e) {
    e.preventDefault();
    errorMessage = '';

    if (!customerName.trim() || !customerPhone.trim()) {
      errorMessage = 'Please enter customer name and phone number.';
      return;
    }

    if (cart.length === 0) {
      errorMessage = 'Please add at least one garment to the order.';
      return;
    }

    const paid = Number(amountPaid || 0);
    if (paid < 0) {
      errorMessage = 'Amount paid cannot be negative.';
      return;
    }

    const order = laundryStore.addOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cart.map((c) => ({ ...c })),
      isExpress,
      amountPaid: Math.min(totalAmount, paid)
    });

    createdOrder = order;
    showReceipt = true;

    // Reset form
    customerName = '';
    customerPhone = '';
    cart = [];
    isExpress = false;
    amountPaid = 0;
  }

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;
</script>

<svelte:head>
  <title>New Drop-Off Order — Hali Laundry</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="max-w-7xl mx-auto space-y-5 pb-16">

  <!-- Page Header -->
  <div class="glass-card p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <h1 class="text-xl sm:text-2xl font-extrabold text-white">New Drop-Off Order</h1>
      <p class="text-xs sm:text-sm text-slate-300 mt-1">Select garments, add special care notes, and log deposit or full payment.</p>
    </div>
    <span class="text-xs font-mono font-bold text-sky-300">
      Express Rate: {laundryStore.expressMultiplier}x
    </span>
  </div>

  {#if errorMessage}
    <div transition:slide={{ duration: 160 }} class="bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl">
      {errorMessage}
    </div>
  {/if}

  <form onsubmit={handleSubmitOrder} class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

    <!-- Left Column: Customer Info + Garment Catalog (7 cols) -->
    <div class="lg:col-span-7 space-y-5">

      <!-- Customer Details -->
      <div class="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
        <h2 class="text-base font-extrabold text-white">1. Customer Details</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label for="customerName" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              id="customerName"
              bind:value={customerName}
              placeholder="e.g. Mr. Ibrahim"
              class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
            />
          </div>

          <div>
            <label for="customerPhone" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              id="customerPhone"
              bind:value={customerPhone}
              placeholder="e.g. 08031234567"
              class="glass-well w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
            />
          </div>
        </div>
      </div>

      <!-- Garment Menu -->
      <div class="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 class="text-base font-extrabold text-white">2. Select Garments</h2>

          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {#each categories as cat}
              <button
                type="button"
                onclick={() => selectedCategory = cat}
                class="btn-tactile shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition {selectedCategory === cat ? 'bg-sky-500 text-white border-sky-400' : 'glass-well text-slate-300 hover:text-white'}"
              >
                {cat}
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {#each filteredPrices as item}
            <button
              type="button"
              onclick={() => addToCart(item)}
              class="btn-tactile glass-well p-3.5 rounded-2xl text-left hover:border-sky-400/70 transition flex flex-col justify-between gap-2"
            >
              <div>
                <p class="text-xs sm:text-sm font-extrabold text-white leading-snug">{item.name}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
              </div>
              <span class="text-xs sm:text-sm font-extrabold text-sky-300">
                {formatNaira(item.price)}
              </span>
            </button>
          {/each}
        </div>
      </div>

    </div>

    <!-- Right Column: Order Summary & Payment (5 cols) -->
    <div class="lg:col-span-5 glass-card p-4 sm:p-6 rounded-3xl space-y-4 lg:sticky lg:top-24">
      <h2 class="text-base font-extrabold text-white">3. Order Summary</h2>

      {#if cart.length === 0}
        <div class="glass-well rounded-2xl p-6 text-center text-xs sm:text-sm text-slate-300">
          Tap any garment on the left to add it to this order.
        </div>
      {:else}
        <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {#each cart as item, index}
            <div
              in:fly={{ y: 10, duration: 180 }}
              out:slide={{ duration: 150 }}
              class="glass-well p-3 rounded-2xl space-y-2"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs sm:text-sm font-bold text-white truncate">{item.name}</p>
                  <p class="text-[11px] text-sky-300 font-semibold">
                    {formatNaira(item.unitPrice * item.qty)}
                  </p>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onclick={() => updateQty(index, -1)}
                    class="btn-tactile w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                  >
                    -
                  </button>
                  <span class="w-6 text-center text-xs font-extrabold text-white">{item.qty}</span>
                  <button
                    type="button"
                    onclick={() => updateQty(index, 1)}
                    class="btn-tactile w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onclick={() => removeItem(index)}
                    class="btn-tactile ml-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <input
                type="text"
                bind:value={item.note}
                placeholder="Stain or starch note (optional)"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
          {/each}
        </div>
      {/if}

      <!-- Express Toggle -->
      <label class="glass-well flex items-center justify-between p-3.5 rounded-2xl cursor-pointer">
        <div>
          <p class="text-xs sm:text-sm font-bold text-white">⚡ Express Service</p>
          <p class="text-[11px] text-slate-300">Applies {laundryStore.expressMultiplier}x rush multiplier</p>
        </div>
        <input type="checkbox" bind:checked={isExpress} class="w-4 h-4 accent-sky-500 rounded" />
      </label>

      <!-- Totals & Deposit -->
      <div class="glass-well p-4 rounded-2xl space-y-2.5 text-xs sm:text-sm">
        <div class="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span class="font-bold text-white">{formatNaira(subtotal)}</span>
        </div>

        <div class="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
          <span>Total Due</span>
          <span class="text-sky-300">{formatNaira(totalAmount)}</span>
        </div>

        <div class="pt-2">
          <label for="amountPaid" class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Amount Paid Now (₦)
          </label>
          <input
            type="number"
            min="0"
            id="amountPaid"
            bind:value={amountPaid}
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-emerald-300 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div class="flex justify-between text-xs font-bold pt-1">
          <span class="text-slate-300">Remaining Balance:</span>
          <span class={balanceDue > 0 ? 'text-rose-300' : 'text-emerald-300'}>
            {formatNaira(balanceDue)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        class="btn-tactile w-full py-3.5 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25"
      >
        Confirm & Generate Receipt
      </button>
    </div>

  </form>
</div>

<ReceiptModal
  order={createdOrder}
  isOpen={showReceipt}
  onClose={() => { showReceipt = false; }}
/>