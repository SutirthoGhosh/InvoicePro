import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Store, Save, ArrowLeft, Camera, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export interface ShopProfileData {
  name: string;
  tagline: string;
  phone: string;
  address: string;
  upiId: string;
  logo?: string;
}

const STORAGE_KEY = "whatsapp_invoice_shop_profile";

export const getShopProfile = (): ShopProfileData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {
    name: "",
    tagline: "",
    phone: "",
    address: "",
    upiId: "",
    logo: ""
  };
};

export default function ShopProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ShopProfileData>(getShopProfile());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("Image too large. Max 1MB allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, logo: reader.result as string });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setProfile({ ...profile, logo: "" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate("/");
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">Shop Profile</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Identity Settings</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-6">
          {/* Logo Upload Section */}
          <div className="flex justify-center flex-col items-center gap-3">
            <div className="relative group">
              <div 
                className={cn(
                  "w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-dashed flex items-center justify-center transition-all overflow-hidden",
                  profile.logo ? "border-blue-500/50 shadow-glow-blue" : "border-white/10 hover:border-blue-500/30"
                )}
              >
                {profile.logo ? (
                  <img src={profile.logo} alt="Shop Logo" className="w-full h-full object-cover" />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-1 group/label">
                    <Camera className="w-8 h-8 text-slate-800 group-hover:text-blue-500/50 transition-colors" />
                    <span className="text-[8px] font-black text-slate-700 tracking-tighter uppercase">Upload Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              
              {profile.logo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}
            {!profile.logo && <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest leading-none">Optional: Upload shop logo</p>}
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Kirana Store"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-4 text-lg font-bold text-white transition-all outline-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Business Tagline</label>
              <input
                type="text"
                placeholder="Quality you can trust"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-3 text-base font-bold text-white transition-all outline-none shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Business Phone</label>
                <input
                  type="tel"
                  placeholder="+91 12345 67890"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-3 text-base font-bold text-white transition-all outline-none shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">UPI ID (for payments)</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={profile.upiId}
                  onChange={(e) => setProfile({ ...profile, upiId: e.target.value })}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-3 text-base font-bold text-white transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shop Address</label>
              <textarea
                placeholder="Store street, Area, City"
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:bg-slate-950 rounded-2xl px-5 py-3 text-base font-bold text-white transition-all outline-none shadow-inner resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl text-lg transition-all shadow-glow-blue active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {saved ? (
            "SAVED SUCCESSFULLY!"
          ) : (
            <>
              <Save className="w-6 h-6" />
              SAVE PROFILE
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
