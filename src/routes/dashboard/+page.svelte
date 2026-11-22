<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';

  let totalOrders = $derived(laundryStore.orders.length);
  let activeOrders = $derived(
    laundryStore.orders.filter((o) => o.status !== 'COLLECTED').length
  );
  let readyOrders = $derived(
    laundryStore.orders.filter((o) => o.status === 'READY').length
  );
  let totalRevenue = $derived(
    laundryStore.orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0)
  );
  let pendingBalance = $derived(
    laundryStore.orders.reduce(
      (sum, o) => sum + Math.max(0, (o.totalAmount || 0) - (o.amountPaid || 0)),
      0
    )
  );

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;
</script>

<div class="space-y-6 pb-12">
  
  <!-- Top Welcome Banner -->
  <div class="glass-card p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl font-extrabold text-white">Shop Overview</h1>
      <p class="text-xs sm:text-sm text-slate-300 mt-1">
        Live garment tracking & revenue summary for <span class="text-sky-300 font-semibold">{laundryStore.storeName}</span>.
      </p>
    </div>

    <a
      href="/orders/new"
      class="btn-tactile w-full sm:w-auto text-center px-5 py-3 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-500/25"
    >
      + New Drop-off Order
    </a>
  </div>

  <!-- 2x2 Mobile / 4-Column Desktop KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div class="glass-card p-4 sm:p-5 rounded-2xl border-l-4 border-l-sky-400">
      <p class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Active Orders</p>
      <p class="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">{activeOrders}</p>
      <p class="text-[11px] text-slate-400 mt-1">{totalOrders} total logged</p>
    </div>

    <div class="glass-card p-4 sm:p-5 rounded-2xl border-l-4 border-l-emerald-400">
      <p class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Ready for Pickup</p>
      <p class="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1.5">{readyOrders}</p>
      <p class="text-[11px] text-slate-400 mt-1">Awaiting customer</p>
    </div>

    <div class="glass-card p-4 sm:p-5 rounded-2xl border-l-4 border-l-indigo-400">
      <p class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Cash Collected</p>
      <p class="text-xl sm:text-2xl font-extrabold text-white mt-1.5 truncate">{formatNaira(totalRevenue)}</p>
      <p class="text-[11px] text-emerald-300 mt-1">Paid deposits & balances</p>
    </div>

    <div class="glass-card p-4 sm:p-5 rounded-2xl border-l-4 border-l-rose-400">
      <p class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Unpaid Balance</p>
      <p class="text-xl sm:text-2xl font-extrabold text-rose-300 mt-1.5 truncate">{formatNaira(pendingBalance)}</p>
      <p class="text-[11px] text-slate-400 mt-1">Due before release</p>
    </div>
  </div>

  <!-- Recent Orders Panel -->
  <div class="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-base sm:text-lg font-extrabold text-white">Recent Orders</h2>
      <a href="/orders" class="text-xs font-bold text-sky-300 hover:text-sky-200">
        View All Orders &rarr;
      </a>
    </div>

    {#if laundryStore.orders.length === 0}
      <div class="glass-well rounded-2xl p-8 text-center text-slate-300 text-sm">
        No orders recorded yet. Tap <strong>+ New Drop-off Order</strong> to log your first customer.
      </div>
    {:else}
      <div class="space-y-2.5">
        {#each laundryStore.orders.slice(0, 5) as ord}
          <div class="glass-well p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-extrabold text-sky-300">{ord.orderCode}</span>
                <span class="text-sm font-bold text-white truncate">{ord.customerName}</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">
                {ord.items.reduce((a, b) => a + b.qty, 0)} garments &bull; {ord.createdAt}
              </p>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <span class="text-sm font-extrabold text-white">{formatNaira(ord.totalAmount)}</span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border
                {ord.status === 'READY' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' : ''}
                {ord.status === 'COLLECTED' ? 'bg-slate-700/60 text-slate-300 border-slate-500/50' : ''}
                {ord.status !== 'READY' && ord.status !== 'COLLECTED' ? 'bg-sky-500/20 text-sky-200 border-sky-400/50' : ''}
              ">
                {ord.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

</div>