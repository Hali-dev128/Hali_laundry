<script>
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { laundryStore } from '$lib/stores/store.svelte.js';

  let { order = null, isOpen = false, onClose = () => {} } = $props();

  const formatNaira = (amt) => `₦${(amt || 0).toLocaleString()}`;

  let balance = $derived(
    order ? Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0)) : 0
  );

  function shareOnWhatsApp() {
    if (!order) return;

    const itemsText = order.items
      .map(
        (i) =>
          `• ${i.qty}x ${i.name} (${formatNaira(i.unitPrice * i.qty)})${
            i.note ? ` — _${i.note}_` : ''
          }`
      )
      .join('\n');

    const message = [
      `*${laundryStore.storeName} — Order Receipt*`,
      `Order ID: *${order.orderCode}*`,
      `Customer: ${order.customerName} (${order.customerPhone})`,
      `Status: *${order.status}*${order.isExpress ? ' ⚡ EXPRESS' : ''}`,
      ``,
      `*Items:*`,
      itemsText,
      ``,
      `Total: *${formatNaira(order.totalAmount)}*`,
      `Paid: ${formatNaira(order.amountPaid)}`,
      `Balance Due: *${formatNaira(balance)}*`,
      `Date: ${order.createdAt}`
    ].join('\n');

    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    const normalizedPhone = cleanPhone.startsWith('0')
      ? `234${cleanPhone.slice(1)}`
      : cleanPhone;

    const url = normalizedPhone
      ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function printReceipt() {
    window.print();
  }
</script>

{#if isOpen && order}
  <div
    transition:fade={{ duration: 160 }}
    class="fixed inset-0 z-50 bg-[#060913]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-label="Order Receipt"
  >
    <div
      in:scale={{ duration: 220, start: 0.94, opacity: 0, easing: cubicOut }}
      out:fade={{ duration: 140 }}
      class="glass-card w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 text-slate-100 relative my-auto"
    >
      <!-- Top Header -->
      <div class="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span class="text-[11px] font-mono font-extrabold uppercase tracking-wider text-sky-300">
            Digital Receipt
          </span>
          <h2 class="text-lg sm:text-xl font-extrabold text-white mt-0.5">
            {order.orderCode}
          </h2>
          <p class="text-xs text-slate-300 mt-0.5">
            {laundryStore.storeName} &bull; {order.createdAt}
          </p>
        </div>

        <button
          type="button"
          onclick={onClose}
          class="btn-tactile w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center text-base font-bold shrink-0"
          aria-label="Close receipt"
        >
          &times;
        </button>
      </div>

      <!-- Customer & Status Well -->
      <div class="glass-well p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs">
        <div class="min-w-0">
          <p class="font-extrabold text-white text-sm truncate">{order.customerName}</p>
          <p class="text-slate-300 font-mono mt-0.5">{order.customerPhone}</p>
        </div>

        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-200 border border-sky-400/50">
            {order.status}
          </span>
          {#if order.isExpress}
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-200 border border-amber-400/50">
              ⚡ Express
            </span>
          {/if}
        </div>
      </div>

      <!-- Garments Breakdown Well -->
      <div class="glass-well p-3.5 rounded-2xl space-y-2.5 text-xs">
        <div class="flex justify-between font-bold text-slate-300 border-b border-slate-800 pb-1.5">
          <span>Garment Breakdown</span>
          <span>Amount</span>
        </div>

        <div class="max-h-44 overflow-y-auto space-y-2 pr-1">
          {#each order.items as item}
            <div class="space-y-0.5">
              <div class="flex justify-between items-baseline gap-2">
                <span class="font-semibold text-white">
                  {item.qty}x {item.name}
                </span>
                <span class="font-bold text-slate-200 shrink-0">
                  {formatNaira(item.unitPrice * item.qty)}
                </span>
              </div>
              {#if item.note}
                <p class="text-[11px] text-amber-300 pl-3">
                  Note: {item.note}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Payment Summary Well -->
      <div class="glass-well p-4 rounded-2xl space-y-2 text-xs sm:text-sm">
        <div class="flex justify-between text-slate-300">
          <span>Total Order</span>
          <span class="font-extrabold text-white">{formatNaira(order.totalAmount)}</span>
        </div>
        <div class="flex justify-between text-slate-300">
          <span>Amount Paid</span>
          <span class="font-extrabold text-emerald-300">{formatNaira(order.amountPaid)}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-slate-800">
          <span class="font-bold text-slate-200">Balance Due</span>
          <span class="text-base font-extrabold {balance > 0 ? 'text-rose-300' : 'text-emerald-300'}">
            {formatNaira(balance)}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onclick={shareOnWhatsApp}
          class="btn-tactile py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
        >
          <span>📲 WhatsApp Receipt</span>
        </button>

        <button
          type="button"
          onclick={printReceipt}
          class="btn-tactile py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5"
        >
          <span>🖨️ Print / Save PDF</span>
        </button>
      </div>
    </div>
  </div>
{/if}