<script>
  import { laundryStore } from '$lib/stores/store.svelte.js';

  // Compute live stats from store orders
  let totalOrdersCount = $derived(laundryStore.orders.length);
  let readyCount = $derived(laundryStore.orders.filter(o => o.status === 'READY').length);
  let inProgressCount = $derived(laundryStore.orders.filter(o => ['WASHING', 'IRONING'].includes(o.status)).length);
  
  let totalRevenue = $derived(
    laundryStore.orders
      .filter(o => o.paymentStatus === 'PAID' || o.amountPaid > 0)
      .reduce((sum, o) => sum + o.amountPaid, 0)
  );

  // Format currency in Naira
  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;
</script>

<div class="space-y-8 pb-12">
  
  <!-- Top Welcome Banner -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900/80 via-slate-900/50 to-indigo-950/30 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Shop Operations Dashboard</h1>
      <p class="text-sm text-slate-400 mt-1">Monitor daily garment flow, track ready pickups, and review revenue effortlessly.</p>
    </div>
    <div class="flex items-center gap-3">
      <a href="/orders/new" class="px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition transform active:scale-95 flex items-center space-x-2">
        <span>+ New Drop-off Order</span>
      </a>
    </div>
  </div>

  <!-- Stats Grid (Glass Cards) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    
    <!-- Stat 1 -->
    <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Total Orders</p>
        <p class="text-3xl font-bold text-white mt-1">{totalOrdersCount}</p>
        <span class="text-xs text-emerald-400 font-medium mt-1 inline-block">Active system queue</span>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl">
        📦
      </div>
    </div>

    <!-- Stat 2 -->
    <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">In Progress</p>
        <p class="text-3xl font-bold text-sky-400 mt-1">{inProgressCount}</p>
        <span class="text-xs text-sky-300 font-medium mt-1 inline-block">Washing & Ironing</span>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
        🌊
      </div>
    </div>

    <!-- Stat 3 -->
    <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Ready for Pickup</p>
        <p class="text-3xl font-bold text-emerald-400 mt-1">{readyCount}</p>
        <span class="text-xs text-emerald-300 font-medium mt-1 inline-block">Awaiting customer</span>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
        ✨
      </div>
    </div>

    <!-- Stat 4 -->
    <div class="bg-slate-900/60 glass-card backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Cash Collected</p>
        <p class="text-3xl font-bold text-amber-400 mt-1">{formatNaira(totalRevenue)}</p>
        <span class="text-xs text-amber-300/80 font-medium mt-1 inline-block">Deposits & Balances</span>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
        💵
      </div>
    </div>

  </div>

  <!-- Recent Orders Section -->
  <div class="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-white">Recent Drop-offs</h2>
      <a href="/orders" class="text-xs font-semibold text-sky-400 hover:text-sky-300 transition">View All Orders &rarr;</a>
    </div>

    {#if laundryStore.orders.length === 0}
      <div class="text-center py-12 text-slate-500">
        <p class="text-4xl mb-2">📭</p>
        <p class="text-sm">No orders recorded yet. Click "+ New Drop-off Order" to begin.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-4">Order ID</th>
              <th class="py-3 px-4">Customer</th>
              <th class="py-3 px-4">Items Count</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Payment</th>
              <th class="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            {#each laundryStore.orders.slice(0, 5) as ord}
              <tr class="hover:bg-white/5 transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sky-400">{ord.orderCode}</td>
                <td class="py-3.5 px-4 font-medium text-white">{ord.customerName} <span class="text-xs text-slate-500 block">{ord.customerPhone}</span></td>
                <td class="py-3.5 px-4 text-slate-300">{ord.items.reduce((acc, i) => acc + i.qty, 0)} items</td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold 
                    {ord.status === 'RECEIVED' ? 'bg-slate-800 text-slate-300 border border-slate-700' : ''}
                    {ord.status === 'WASHING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                    {ord.status === 'IRONING' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : ''}
                    {ord.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                    {ord.status === 'COLLECTED' ? 'bg-slate-700/50 text-slate-400 border border-slate-600' : ''}
                  ">
                    {ord.status}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold 
                    {ord.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                    {ord.paymentStatus === 'PART_PAID' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                    {ord.paymentStatus === 'UNPAID' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : ''}
                  ">
                    {ord.paymentStatus.replace('_', ' ')}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-semibold text-white">{formatNaira(ord.totalAmount)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

</div>