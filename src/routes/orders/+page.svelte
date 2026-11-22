<script>
  import { slide } from 'svelte/transition';
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import ReceiptModal from '$lib/components/RecieptModal.svelte';

  // Search & Filter State
  let searchQuery = $state('');
  let selectedTab = $state('ALL'); // ALL, RECEIVED, WASHING, IRONING, READY, COLLECTED

  // Modal State
  let activeReceiptOrder = $state(null);
  let isReceiptOpen = $state(false);

  // Payment Logging Prompt State
  let payingOrderId = $state(null);
  let paymentInput = $state(0);

  // Filtered orders
  let filteredOrders = $derived(
    laundryStore.orders.filter(ord => {
      const matchesTab = selectedTab === 'ALL' || ord.status === selectedTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        ord.orderCode.toLowerCase().includes(query) ||
        ord.customerName.toLowerCase().includes(query) ||
        ord.customerPhone.includes(query);
      return matchesTab && matchesSearch;
    })
  );

  function openReceipt(ord) {
    activeReceiptOrder = ord;
    isReceiptOpen = true;
  }

  function handleRecordPayment(ordId) {
    const amt = Number(paymentInput);
    if (amt <= 0) return;
    laundryStore.recordPayment(ordId, amt);
    payingOrderId = null;
    paymentInput = 0;
  }

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;
</script>

<div class="max-w-7xl mx-auto space-y-6 pb-16">
  
  <!-- Header & Search Bar -->
  <div class="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-extrabold text-white">Active Orders Workflow</h1>
      <p class="text-sm text-slate-400 mt-1">Manage garment progress through stages and verify balances.</p>
    </div>

    <!-- Search Input -->
    <div class="w-full md:w-80">
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Search Order ID, Name, Phone..." 
        class="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition shadow-inner"
      />
    </div>
  </div>

  <!-- Status Tabs -->
  <div class="flex flex-wrap gap-2">
    {#each ['ALL', 'RECEIVED', 'WASHING', 'IRONING', 'READY', 'COLLECTED'] as tab}
      <button 
        onclick={() => selectedTab = tab}
        class="px-4 py-2 rounded-2xl btn-tactile text-xs font-bold transition shadow-sm {selectedTab === tab ? 'bg-sky-500 text-white shadow-sky-500/25' : 'bg-slate-900/60 text-slate-400 border border-white/10 hover:text-white hover:bg-white/5'}"
      >
        {tab} {tab !== 'ALL' ? `(${laundryStore.orders.filter(o => o.status === tab).length})` : `(${laundryStore.orders.length})`}
      </button>
    {/each}
  </div>

  <!-- Orders Grid -->
  {#if filteredOrders.length === 0}
    <div class="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center text-slate-500">
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-sm">No orders found matching your filter.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredOrders as ord}
        <div class="bg-slate-900/60 backdrop-blur-xl border glass-card border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          
          <!-- Card Header -->
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-mono font-extrabold text-sky-400 block">{ord.orderCode}</span>
              <h3 class="text-base font-bold text-white mt-0.5">{ord.customerName}</h3>
              <p class="text-xs text-slate-400">{ord.customerPhone}</p>
            </div>
            
            <!-- Status Badge -->
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider
              {ord.status === 'RECEIVED' ? 'bg-slate-800 text-slate-300 border border-slate-700' : ''}
              {ord.status === 'WASHING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
              {ord.status === 'IRONING' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : ''}
              {ord.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
              {ord.status === 'COLLECTED' ? 'bg-slate-700/50 text-slate-400 border border-slate-600' : ''}
            ">
              {ord.status}
            </span>
          </div>

          <!-- Garments Summary -->
          <div class="bg-slate-950/50 p-3 rounded-2xl border border-white/5 space-y-1.5 text-xs">
            <div class="flex justify-between font-semibold text-slate-400 border-b border-white/5 pb-1">
              <span>Garments ({ord.items.reduce((a,b) => a + b.qty, 0)})</span>
              <span>Price</span>
            </div>
            <div class="max-h-24 overflow-y-auto space-y-1 pr-1">
              {#each ord.items as item}
                <div class="flex justify-between text-white">
                  <span>{item.qty}x {item.name}</span>
                  <span class="text-slate-400">{formatNaira(item.unitPrice * item.qty)}</span>
                </div>
                {#if item.note}
                  <p class="text-[10px] text-amber-400 italic">Note: {item.note}</p>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Financial Details & Payment Gate -->
          <div class="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
            <div class="flex justify-between text-slate-300">
              <span>Total:</span>
              <span class="font-bold text-white">{formatNaira(ord.totalAmount)}</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Paid:</span>
              <span class="font-bold text-emerald-400">{formatNaira(ord.amountPaid)}</span>
            </div>
            <div class="flex justify-between items-center pt-1.5 border-t border-white/10">
              <span class="text-slate-400">Balance:</span>
              <span class="font-extrabold {ord.totalAmount - ord.amountPaid > 0 ? 'text-rose-400' : 'text-emerald-400'}">
                {formatNaira(ord.totalAmount - ord.amountPaid)}
              </span>
            </div>

            <!-- Record Payment Form Trigger if Unpaid/Part-paid -->
            {#if ord.totalAmount - ord.amountPaid > 0}
              <div class="pt-2">
                {#if payingOrderId === ord.id}
                  <div transition:slide={{ duration: 160 }} class="flex items-center gap-2">
                    <input 
                      type="number" 
                      bind:value={paymentInput}
                      placeholder="Amount" 
                      class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-2 py-1 text-white text-xs"
                    />
                    <button 
                      onclick={() => handleRecordPayment(ord.id)}
                      class="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Save
                    </button>
                    <button 
                      onclick={() => payingOrderId = null}
                      class="px-2 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                {:else}
                  <button 
                    onclick={() => { payingOrderId = ord.id; paymentInput = ord.totalAmount - ord.amountPaid; }}
                    class="w-full py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition text-[11px]"
                  >
                    + Log Balance Payment
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Workflow Action Buttons -->
          <div class="space-y-2 pt-2 border-t border-white/10">
            <div class="grid grid-cols-2 gap-2">
              {#if ord.status === 'RECEIVED'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'WASHING')} class="py-2 btn-tactile rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition">
                  Start Wash &rarr;
                </button>
              {:else if ord.status === 'WASHING'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'IRONING')} class="py-2 btn-tactile rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
                  Start Ironing &rarr;
                </button>
              {:else if ord.status === 'IRONING'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'READY')} class="py-2 btn-tactile rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
                  Mark Ready ✨
                </button>
              {:else if ord.status === 'READY'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'COLLECTED')} class="py-2 btn-tactile rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition">
                  Mark Collected ✅
                </button>
              {:else}
                <span class="py-2 text-center text-slate-500 text-xs font-semibold col-span-2">Completed & Closed</span>
              {/if}

              <button 
                onclick={() => openReceipt(ord)}
                class="py-2 rounded-xl btn-tactile bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition flex items-center justify-center space-x-1"
              >
                <span>🧾 Receipt</span>
              </button>
            </div>

            <!-- Admin Override / Void Button -->
            {#if laundryStore.role === 'admin' && ord.status === 'COLLECTED'}
              <button 
                onclick={() => laundryStore.updateOrderStatus(ord.id, 'READY')} 
                class="w-full py-1 text-[10px] text-amber-400 hover:text-amber-300 transition text-center block font-semibold"
              >
                👑 [Admin Override] Reopen Order
              </button>
            {/if}
          </div>

        </div>
      {/each}
    </div>
  {/if}

</div>

<!-- Receipt Modal Component Integration -->
<ReceiptModal 
  order={activeReceiptOrder} 
  isOpen={isReceiptOpen} 
  onClose={() => isReceiptOpen = false} 
/>