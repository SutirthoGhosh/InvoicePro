import React, { useState, useEffect } from "react";
import { Plus, Trash2, Send, Copy, Check, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createInvoice, getCustomers } from "../lib/api";
import { InvoiceItem, Customer } from "../types";
import { cn, formatCurrency } from "../lib/utils";

import { getShopProfile } from "./ShopProfile";

export default function InvoiceForm() {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerPhone(val);
    
    // Auto-fill name if customer exists
    const existing = customers.find(c => c.phone === val);
    if (existing) {
      setCustomerName(existing.name);
    }
  };

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || items.some(i => !i.name || i.qty <= 0 || i.price < 0)) return;

    setIsSubmitting(true);
    try {
      const result = await createInvoice({
        customerName,
        customerPhone,
        items,
        total
      });
      setGeneratedInvoice(result);
      fetchCustomers(); // Refresh customer list for next time
    } catch (error) {
      alert("Failed to generate invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMessage = () => {
    if (!generatedInvoice) return "";
    const shop = getShopProfile();
    
    let msg = "";
    if (shop.name) {
      msg += `*${shop.name}*\n`;
      if (shop.tagline) msg += `_${shop.tagline}_\n`;
      if (shop.phone) msg += `Phone: ${shop.phone}\n`;
      if (shop.address) msg += `Address: ${shop.address}\n`;
      msg += `--------------------------\n\n`;
    }

    msg += `*Invoice ${generatedInvoice.invoiceNumber}*\n`;
    msg += `*Customer:* ${generatedInvoice.customerName}\n`;
    msg += `*Items:*\n`;
    generatedInvoice.items.forEach((item: any) => {
      msg += `• ${item.name} x${item.qty} = ₹${item.qty * item.price}\n`;
    });
    msg += `\n*Total: ₹${generatedInvoice.total}*\n`;
    
    if (shop.upiId) {
      msg += `\n*UPI Payment:* ${shop.upiId}\n`;
    }

    msg += `\n_Generated via WhatsApp Invoice Tool_`;
    return msg;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(formatMessage());
    const phone = customerPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (generatedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white">Invoice Ready!</h2>
            <div className="bg-green-500/20 p-2 rounded-full border border-green-500/30">
              <Check className="w-5 h-5 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-950 p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap mb-8 border border-white/5 relative overflow-hidden text-slate-300">
            <div className="absolute -top-4 -right-4 p-3 opacity-5">
              <MessageSquare className="w-24 h-24" />
            </div>
            {getShopProfile().logo && (
              <div className="mb-6 flex justify-center">
                <img src={getShopProfile().logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl shadow-glow-blue border border-white/10" />
              </div>
            )}
            {formatMessage()}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-5 rounded-2xl transition-all shadow-glow-green active:scale-[0.98]"
            >
              <MessageSquare className="w-6 h-6" />
              SEND ON WHATSAPP
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-5 rounded-2xl transition-all active:scale-[0.98]"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
              {copied ? "COPIED TO CLIPBOARD" : "COPY MESSAGE TEXT"}
            </button>
          </div>

          <button
            onClick={() => {
              setGeneratedInvoice(null);
              setCustomerPhone("");
              setCustomerName("");
              setItems([{ name: "", qty: 1, price: 0 }]);
            }}
            className="w-full mt-8 text-slate-500 font-bold py-3 rounded-xl hover:text-slate-300 transition-colors uppercase tracking-[0.2em] text-[10px]"
          >
            Create New Invoice
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-left px-2">
        <h2 className="text-3xl font-black text-white tracking-tight leading-none italic uppercase">New Invoice</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Live Session</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        {/* Customer Info */}
        <section className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Customer Details</h3>
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 98123 45678"
                value={customerPhone}
                onChange={handlePhoneChange}
                className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-4 text-lg font-bold text-white transition-all outline-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
              <input
                type="text"
                placeholder="Walking Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-4 text-lg font-bold text-white transition-all outline-none shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* Invoice Items */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Item List</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-blue-400 font-black text-[10px] bg-blue-400/10 border border-blue-400/20 px-3 py-1.5 rounded-full hover:bg-blue-400/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 p-5 rounded-[2rem] border border-white/5 space-y-4 relative group hover:border-white/10 transition-colors"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Basmati Rice"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 py-1 font-bold text-white outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Rate (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.price || ""}
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Qty</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={item.qty || ""}
                        onChange={(e) => updateItem(index, "qty", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-2 py-2 font-bold text-white outline-none focus:border-blue-500/50 text-center"
                      />
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* PROMINENT STICKY TOTAL SECTION */}
        <div className="fixed bottom-24 left-0 right-0 z-40 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-10 pb-4 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-blue-600 p-6 rounded-3xl shadow-glow-blue flex items-center justify-between border border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] leading-none">Total Payable</p>
                <p className="text-4xl font-extrabold text-white tracking-tighter leading-none">
                  {formatCurrency(total)}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "bg-white text-blue-600 font-extrabold px-6 py-4 rounded-2xl shadow-xl transition-all active:scale-[0.95] disabled:opacity-50 flex items-center gap-2",
                  isSubmitting ? "animate-pulse" : "hover:bg-blue-50"
                )}
              >
                {isSubmitting ? "WAIT..." : (
                  <>
                    <Send className="w-5 h-5" />
                    CREATE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
