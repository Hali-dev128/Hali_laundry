<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';
  import ReceiptModal from '$lib/components/RecieptModal.svelte';
  import { slide } from 'svelte/transition';

  let searchQuery = $state('');
  let selectedTab = $state('ALL');

  let activeReceiptOrder = $state(null);
  let isReceiptOpen = $state(false);

  let payingOrderId = $state(null);
  let paymentInput = $state(0);

  let filteredOrders = $derived(
    laundryStore.orders.filter((ord) => {
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

<div class="max-w-7xl mx-auto space-y-5 pb-16">
  
  <!-- Header & Search -->
  <div class="glass-card p-4 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3.5">
    <div>
      <h1 class="text-xl sm:text-2xl font-extrabold text-white">Active Orders Workflow</h1>
      <p class="text-xs sm:text-sm text-slate-300 mt-1">Manage garment stages and verify balances before release.</p>
    </div>

    <div class="w-full md:w-80">
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Search Order ID, Name, Phone..." 
        class="glass-well w-full rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
      />
    </div>
  </div>

  <!-- Horizontal Scrollable Status Tabs on Mobile -->
  <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
    {#each ['ALL', 'RECEIVED', 'WASHING', 'IRONING', 'READY', 'COLLECTED'] as tab}
      <button 
        onclick={() => selectedTab = tab}
        class="btn-tactile shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition {selectedTab === tab ? 'bg-sky-500 text-white border-sky-400 shadow-md' : 'glass-card text-slate-200 hover:text-white'}"
      >
        {tab} ({tab === 'ALL' ? laundryStore.orders.length : laundryStore.orders.filter((o) => o.status === tab).length})
      </button>
    {/each}
  </div>

  <!-- Orders Grid -->
  {#if filteredOrders.length === 0}
    <div class="glass-card rounded-3xl p-10 text-center text-slate-300">
      <p class="text-3xl mb-2">🔍</p>
      <p class="text-sm font-medium">No orders found matching your filter.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {#each filteredOrders as ord}
        <div class="glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4">
          
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <span class="text-xs font-mono font-extrabold text-sky-300 block">{ord.orderCode}</span>
              <h3 class="text-base font-extrabold text-white mt-0.5 truncate">{ord.customerName}</h3>
              <p class="text-xs text-slate-300">{ord.customerPhone}</p>
            </div>
            
            <span class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border
              {ord.status === 'RECEIVED' ? 'bg-slate-800 text-slate-200 border-slate-600' : ''}
              {ord.status === 'WASHING' ? 'bg-blue-500/25 text-blue-200 border-blue-400/50' : ''}
              {ord.status === 'IRONING' ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50' : ''}
              {ord.status === 'READY' ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50' : ''}
              {ord.status === 'COLLECTED' ? 'bg-slate-800/80 text-slate-300 border-slate-600' : ''}
            ">
              {ord.status}
            </span>
          </div>

          <!-- Garments Well -->
          <div class="glass-well p-3.5 rounded-2xl space-y-2 text-xs">
            <div class="flex justify-between font-bold text-slate-300 border-b border-slate-800 pb-1.5">
              <span>Garments ({ord.items.reduce((a, b) => a + b.qty, 0)})</span>
              <span>Price</span>
            </div>
            <div class="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {#each ord.items as item}
                <div class="flex justify-between text-slate-100">
                  <span>{item.qty}x {item.name}</span>
                  <span class="text-slate-300 font-semibold">{formatNaira(item.unitPrice * item.qty)}</span>
                </div>
                {#if item.note}
                  <p class="text-[11px] text-amber-300 font-medium">Note: {item.note}</p>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Financial Well -->
          <div class="glass-well p-3.5 rounded-2xl space-y-2 text-xs">
            <div class="flex justify-between text-slate-300">
              <span>Total:</span>
              <span class="font-extrabold text-white">{formatNaira(ord.totalAmount)}</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Paid:</span>
              <span class="font-extrabold text-emerald-300">{formatNaira(ord.amountPaid)}</span>
            </div>
            <div class="flex justify-between items-center pt-1.5 border-t border-slate-800">
              <span class="text-slate-300 font-semibold">Balance:</span>
              <span class="font-extrabold text-sm {ord.totalAmount - ord.amountPaid > 0 ? 'text-rose-300' : 'text-emerald-300'}">
                {formatNaira(ord.totalAmount - ord.amountPaid)}
              </span>
            </div>

            {#if ord.totalAmount - ord.amountPaid > 0}
              <div class="pt-2">
                {#if payingOrderId === ord.id}
                  <div transition:slide={{ duration: 150 }} class="flex items-center gap-2">
                    <input 
                      type="number" 
                      bind:value={paymentInput}
                      placeholder="Amount" 
                      class="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                    <button 
                      onclick={() => handleRecordPayment(ord.id)}
                      class="btn-tactile px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
                    >
                      Save
                    </button>
                    <button 
                      onclick={() => payingOrderId = null}
                      class="btn-tactile px-2.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
                    >
                      &times;
                    </button>
                  </div>
                {:else}
                  <button 
                    onclick={() => { payingOrderId = ord.id; paymentInput = ord.totalAmount - ord.amountPaid; }}
                    class="btn-tactile w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-extrabold hover:bg-emerald-500/30 text-xs"
                  >
                    + Log Balance Payment
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Workflow Action Buttons -->
          <div class="space-y-2 pt-2 border-t border-slate-800">
            <div class="grid grid-cols-2 gap-2">
              {#if ord.status === 'RECEIVED'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'WASHING')} class="btn-tactile py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs">
                  Start Wash &rarr;
                </button>
              {:else if ord.status === 'WASHING'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'IRONING')} class="btn-tactile py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs">
                  Start Ironing &rarr;
                </button>
              {:else if ord.status === 'IRONING'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'READY')} class="btn-tactile py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs">
                  Mark Ready ✨
                </button>
              {:else if ord.status === 'READY'}
                <button onclick={() => laundryStore.updateOrderStatus(ord.id, 'COLLECTED')} class="btn-tactile py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs">
                  Mark Collected ✅
                </button>
              {:else}
                <span class="py-2.5 text-center text-slate-400 text-xs font-bold col-span-2">Completed & Closed</span>
              {/if}

              <button 
                onclick={() => openReceipt(ord)}
                class="btn-tactile py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-extrabold text-xs flex items-center justify-center gap-1"
              >
                <span>🧾 Receipt</span>
              </button>
            </div>

            {#if laundryStore.role === 'admin' && ord.status === 'COLLECTED'}
              <button 
                onclick={() => laundryStore.updateOrderStatus(ord.id, 'READY')} 
                class="w-full py-1.5 text-[11px] text-amber-300 hover:text-amber-200 text-center block font-bold"
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

<ReceiptModal 
  order={activeReceiptOrder} 
  isOpen={isReceiptOpen} 
  onClose={() => isReceiptOpen = false} 
/>