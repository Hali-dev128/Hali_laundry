<script>
  import { fly, slide } from 'svelte/transition';
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import { goto } from '$app/navigation';

  // Form State
  let customerPhone = $state('');
  let customerName = $state('');
  let isExpress = $state(false);
  let amountPaid = $state(0);
  
  // Cart containing selected items
  let cart = $state([]);

  // Auto-fill customer name if phone number matches existing customer directory
  function handlePhoneInput(e) {
    const phone = e.target.value;
    customerPhone = phone;
    const found = laundryStore.customers.find(c => c.phone === phone);
    if (found) {
      customerName = found.name;
    }
  }

  // Add item from price list to cart
  function addToCart(priceItem) {
    const existing = cart.find(i => i.id === priceItem.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: priceItem.id,
        name: priceItem.name,
        unitPrice: priceItem.price,
        qty: 1,
        note: ''
      });
    }
  }

  // Update item quantity or remove if qty < 1
  function updateQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== itemId);
    }
  }

  // Calculations
  let subtotal = $derived(cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0));
  let totalAmount = $derived(isExpress ? Math.round(subtotal * laundryStore.expressMultiplier) : subtotal);
  let balanceDue = $derived(Math.max(0, totalAmount - amountPaid));

  // Submit Order Rule enforcement
  let errorMessage = $state('');

  function handleSubmit(e) {
    e.preventDefault();
    errorMessage = '';

    if (!customerPhone.trim() || !customerName.trim()) {
      errorMessage = 'Please enter both customer name and phone number.';
      return;
    }
    if (cart.length === 0) {
      errorMessage = 'Cannot create an empty order. Please select at least one garment.';
      return;
    }

    // Save order via store method
    const newOrder = laundryStore.addOrder({
      customerName,
      customerPhone,
      items: cart,
      isExpress,
      amountPaid: Number(amountPaid)
    });

    // Redirect to active orders board upon successful intake
    goto('/orders');
  }

  const formatNaira = (amt) => `₦${amt.toLocaleString()}`;
</script>

<div class="max-w-6xl mx-auto space-y-6 pb-16">
  
  <!-- Header -->
  <div class="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-extrabold text-white">New Drop-off Intake</h1>
      <p class="text-sm text-slate-400 mt-1">Select garments, attach notes, and process deposit payments.</p>
    </div>
    <a href="/orders" class="text-xs btn-tactile font-semibold text-slate-400 hover:text-white transition bg-white/5 px-4 py-2 rounded-xl border border-white/10">
      &larr; Back to Orders
    </a>
  </div>

  {#if errorMessage}
    <div transition:slide={{ duration: 180 }} class="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-sm font-medium">
      {errorMessage}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- LEFT SIDE: Customer Details & Price Grid (7 Cols) -->
    <div class="lg:col-span-7 space-y-6">
      
      <!-- Customer Box -->
      <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
        <h2 class="text-base font-bold text-white flex items-center gap-2">
          <span>👤</span> Customer Information
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="customerPhone" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number *</label>
            <input 
              type="text" 
              id="customerPhone"
              bind:value={customerPhone} 
              oninput={handlePhoneInput}
              placeholder="e.g. 08031234567" 
              required
              class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label for="customerName" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Customer Name *</label>
            <input 
              type="text" 
              id="customerName"
              bind:value={customerName} 
              placeholder="e.g. Mr. Adebayo" 
              required
              class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </div>

      <!-- Garment Price Grid -->
      <div class="bg-slate-900/60 backdrop-blur-xl glass-card border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span>👕</span> Tap Garments to Add
          </h2>
          <span class="text-xs text-slate-400">Click any item to add to order</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {#each laundryStore.prices as p}
            <button 
              type="button"
              onclick={() => addToCart(p)}
              class="p-3.5 btn-tactile rounded-2xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/40 text-left transition group flex flex-col justify-between"
            >
              <div>
                <p class="text-xs font-bold text-white group-hover:text-sky-400 transition">{p.name}</p>
                <span class="text-[10px] text-slate-400 block mt-0.5">{p.category}</span>
              </div>
              <p class="text-sm font-extrabold text-emerald-400 mt-3">{formatNaira(p.price)}</p>
            </button>
          {/each}
        </div>
      </div>

    </div>

    <!-- RIGHT SIDE: Cart & Payment Summary (5 Cols) -->
    <div class="lg:col-span-5 space-y-6">
      
      <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-6 sticky top-24">
        <h2 class="text-base font-bold text-white flex items-center justify-between">
          <span>🛒 Itemized Cart</span>
          <span class="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 font-semibold">{cart.reduce((a, b) => a + b.qty, 0)} items</span>
        </h2>

        <!-- Cart List -->
        {#if cart.length === 0}
          <div class="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            <p class="text-3xl mb-1">🧺</p>
            <p class="text-xs">No garments selected yet.</p>
          </div>
        {:else}
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            {#each cart as item}
              <div in:fly={{ y: 10, duration: 180 }} out:slide={{ duration: 150 }} class="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white">{item.name}</span>
                  <span class="text-xs font-bold text-emerald-400">{formatNaira(item.unitPrice * item.qty)}</span>
                </div>

                <div class="flex items-center justify-between gap-2">
                  <!-- Qty Controls -->
                  <div class="flex items-center space-x-2 bg-slate-950/60 px-2 py-1 rounded-xl border border-white/10">
                    <button type="button" onclick={() => updateQty(item.id, -1)} class="text-xs text-slate-400 hover:text-white px-1">-</button>
                    <span class="text-xs font-bold text-white w-4 text-center">{item.qty}</span>
                    <button type="button" onclick={() => updateQty(item.id, 1)} class="text-xs text-slate-400 hover:text-white px-1">+</button>
                  </div>

                  <!-- Condition / Intake Note -->
                  <input 
                    type="text" 
                    bind:value={item.note} 
                    placeholder="Note (e.g. Stain on collar)" 
                    class="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1 text-[11px] text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Express Surcharge Toggle -->
        <div class="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p class="text-xs font-bold text-white">Express Service (+50%)</p>
            <p class="text-[10px] text-slate-400">Urgent 24-hr turnaround</p>
          </div>
          <input type="checkbox" bind:checked={isExpress} class="w-5 h-5 rounded accent-sky-500 cursor-pointer" />
        </div>

        <!-- Financial Summary -->
        <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2 text-sm">
          <div class="flex justify-between text-slate-400 text-xs">
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          {#if isExpress}
            <div class="flex justify-between text-amber-400 text-xs">
              <span>Express Surcharge</span>
              <span>+{formatNaira(totalAmount - subtotal)}</span>
            </div>
          {/if}
          <div class="flex justify-between text-white font-extrabold text-base pt-2 border-t border-white/10">
            <span>Total Amount</span>
            <span class="text-sky-400">{formatNaira(totalAmount)}</span>
          </div>
        </div>

        <!-- Deposit / Payment Input -->
        <div class="space-y-2">
          <label for="amountPaid" class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Amount Paid Now (Deposit)</label>
          <input 
            type="number" 
            id="amountPaid"
            bind:value={amountPaid} 
            max={totalAmount}
            min="0"
            class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition font-bold"
          />
          <div class="flex justify-between text-xs font-medium pt-1">
            <span class="text-slate-400">Balance Due at Pickup:</span>
            <span class="{balanceDue > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}">{formatNaira(balanceDue)}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          class="w-full btn-tactile py-3.5 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition transform active:scale-95 text-center block"
        >
          Confirm & Generate Order 🚀
        </button>

      </div>

    </div>

  </form>

</div>