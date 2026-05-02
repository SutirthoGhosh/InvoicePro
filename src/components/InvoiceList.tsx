import React, { useEffect, useState } from "react";
import { History, Calendar, User, Phone, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { getInvoices } from "../lib/api";
import { Invoice } from "../types";
import { formatCurrency } from "../lib/utils";

import { getShopProfile } from "./ShopProfile";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const shareInvoice = (invoice: Invoice) => {
    const shop = getShopProfile();
    
    let msg = "";
    if (shop.name) {
      msg += `*${shop.name}*\n`;
      if (shop.tagline) msg += `_${shop.tagline}_\n`;
      if (shop.phone) msg += `Phone: ${shop.phone}\n`;
      if (shop.address) msg += `Address: ${shop.address}\n`;
      msg += `--------------------------\n\n`;
    }

    msg += `*Invoice ${invoice.invoiceNumber}*\n`;
    msg += `*Customer:* ${invoice.customerName}\n`;
    msg += `*Items:*\n`;
    invoice.items.forEach((item: any) => {
      msg += `• ${item.name} x${item.qty} = ₹${item.qty * item.price}\n`;
    });
    msg += `\n*Total: ₹${invoice.total}*\n`;
    
    if (shop.upiId) {
      msg += `\n*UPI Payment:* ${shop.upiId}\n`;
    }

    msg += `\n_Generated via WhatsApp Invoice Tool_`;
    
    const text = encodeURIComponent(msg);
    const phone = invoice.customerPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Records...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
          <History className="w-10 h-10 text-slate-700" />
        </div>
        <h3 className="text-2xl font-black text-white px-2">NO RECORDS FOUND</h3>
        <p className="text-slate-500 mt-3 font-medium">Draft your first invoice to see the history here.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">History</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Transaction Log</p>
        </div>
        <span className="bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
          {invoices.length} Entries
        </span>
      </div>

      <div className="space-y-5">
        {invoices.map((invoice, idx) => (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg uppercase tracking-widest leading-none block w-fit border border-blue-400/20">
                  {invoice.invoiceNumber}
                </span>
                <h3 className="font-extrabold text-2xl text-white tracking-tight leading-none">
                  {invoice.customerName}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white leading-none">{formatCurrency(invoice.total)}</p>
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Today'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-white/5 text-[10px] font-black tracking-widest uppercase">
                <Phone className="w-4 h-4 text-slate-700" />
                {invoice.customerPhone}
              </div>
              <button 
                onClick={() => shareInvoice(invoice)}
                className="flex items-center gap-2 text-white font-black text-xs bg-slate-800 px-6 py-3 rounded-2xl hover:bg-green-500 hover:text-black transition-all active:scale-[0.98] shadow-lg border border-white/5"
              >
                <MessageSquare className="w-4 h-4" />
                RESEND
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
