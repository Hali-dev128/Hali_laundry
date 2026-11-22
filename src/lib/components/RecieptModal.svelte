<script>
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { order = null, isOpen = false, onClose = () => {} } = $props();

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;

  function shareOnWhatsApp() {
    if (!order) return;
    const itemsList = order.items.map(i => `- ${i.qty}x ${i.name} (${formatNaira(i.unitPrice * i.qty)})`).join('\n');
    const message = `🧺 *Hali Laundry Receipt*\n` +
      `Order Code: *${order.orderCode}*\n` +
      `Customer: ${order.customerName}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `Total: *${formatNaira(order.totalAmount)}*\n` +
      `Paid: ${formatNaira(order.amountPaid)}\n` +
      `Balance Due: *${formatNaira(order.totalAmount - order.amountPaid)}*\n` +
      `Status: ${order.paymentStatus}\n\n` +
      `Thank you for choosing Hali Laundry! ✨`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${order.customerPhone}?text=${encoded}`, '_blank');
  }

  function handlePrint() {
    window.print();
  }
</script>

{#if isOpen && order}
  <div
    transition:fade={{ duration: 160 }}
    class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
  >
    <div
      in:scale={{ duration: 220, start: 0.94, opacity: 0, easing: cubicOut }}
      out:fade={{ duration: 140 }}
      class="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 text-slate-100 relative"
    >
      
      <!-- Close button -->
      <button 
        onclick={onClose}
        class="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
      >
        &times;
      </button>

      <!-- Receipt Header -->
      <div class="text-center space-y-1">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto text-xl shadow-lg shadow-sky-500/20">
          🧺
        </div>
        <h2 class="text-xl font-extrabold tracking-tight text-white">Hali Laundry Services</h2>
        <p class="text-xs text-slate-400">Digital Order Receipt & Tag</p>
      </div>

      <!-- Order Meta -->
      <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-400">Order Code:</span>
          <span class="font-bold text-sky-400">{order.orderCode}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Customer Name:</span>
          <span class="font-medium text-white">{order.customerName}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Phone:</span>
          <span class="font-medium text-white">{order.customerPhone}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Date:</span>
          <span class="font-medium text-white">{order.createdAt}</span>
        </div>
      </div>

      <!-- Itemized List -->
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Itemized Garments</p>
        <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
          {#each order.items as item}
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
              <div>
                <p class="font-bold text-white">{item.qty}x {item.name}</p>
                {#if item.note}
                  <p class="text-[10px] text-amber-400/90 mt-0.5">Note: {item.note}</p>
                {/if}
              </div>
              <span class="font-bold text-emerald-400">{formatNaira(item.unitPrice * item.qty)}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Financial Breakdown -->
      <div class="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
        {#if order.isExpress}
          <div class="flex justify-between text-amber-400">
            <span>Express Surcharge Applied</span>
            <span>Included</span>
          </div>
        {/if}
        <div class="flex justify-between text-slate-300 font-bold">
          <span>Total Amount:</span>
          <span>{formatNaira(order.totalAmount)}</span>
        </div>
        <div class="flex justify-between text-emerald-400">
          <span>Amount Paid (Deposit):</span>
          <span>{formatNaira(order.amountPaid)}</span>
        </div>
        <div class="flex justify-between text-white font-extrabold pt-2 border-t border-white/10 text-sm">
          <span>Balance Due:</span>
          <span class="{order.totalAmount - order.amountPaid > 0 ? 'text-rose-400' : 'text-emerald-400'}">
            {formatNaira(order.totalAmount - order.amountPaid)}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button 
          onclick={shareOnWhatsApp}
          class="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-1.5"
        >
          <span>💬 Send WhatsApp</span>
        </button>
        <button 
          onclick={handlePrint}
          class="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
        >
          <span>🖨️ Print / Save</span>
        </button>
      </div>

    </div>
  </div>
{/if}