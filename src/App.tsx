/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Plus, History, Store, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceList from "./components/InvoiceList";
import ShopProfile from "./components/ShopProfile";
import { cn } from "./lib/utils";

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center p-3 px-8 rounded-xl transition-all duration-300",
        isActive ? "text-blue-400 bg-white/5 shadow-inner" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-glow-blue">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-xl tracking-tight text-white uppercase italic">
              Invoice<span className="text-blue-500">Pro</span>
            </h1>
          </div>
          <Link to="/profile" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <User className="w-6 h-6 text-slate-400" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 pb-40">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-1.5 flex gap-1 items-center rounded-2xl shadow-2xl">
        <NavItem to="/" icon={Plus} label="Create" />
        <NavItem to="/history" icon={History} label="History" />
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<InvoiceForm />} />
          <Route path="/history" element={<InvoiceList />} />
          <Route path="/profile" element={<ShopProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}
