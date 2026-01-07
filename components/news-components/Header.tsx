"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useMotionValueEvent 
} from "motion/react";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  Menu, 
  
  User, 
  X, 
  Loader2, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  Search
} from "lucide-react";
import { ModeToggle } from "../Dark"; // Pastikan path ini benar
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link"; // Gunakan Link dari Next.js untuk navigasi SPA
import SearchModal from "./Search";
import Image from "next/image";

// --- CONSTANTS ---
const ADMIN_EMAIL = "muhammadakbaralfiansyah@gmail.com";

// --- TYPES ---
interface NavLink {
  name: string;
  link: string;
}

// --- MAIN COMPONENT ---
const Header = () => {
  const supabase = createClient();
  const ref = useRef<HTMLDivElement>(null);
 
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
 

  // 1. STATE UNTUK NAVIGASI DINAMIS
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { name: "Beranda", link: "/news" }, // Default selalu ada
  ]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 50);
  });

  // 2. FETCH KATEGORI DARI SUPABASE (FILTERED)
  useEffect(() => {
    const fetchCategories = async () => {
      // Logic: Ambil kategori yang HANYA memiliki artikel berstatus 'published'
      const { data} = await supabase
        .from("categories")
        .select(`
          name,
          slug,
          articles!inner(status) 
        `)
        .eq("articles.status", "published");

      if (data) {
        // Hapus duplikat (jika satu kategori punya banyak artikel)
        const uniqueCategories = Array.from(
          new Map(data.map(item => [item["slug"], item])).values()
        );

        const categoryLinks = uniqueCategories.map((cat) => ({
          name: cat.name,
          link: `/category/${cat.slug}`, // Sesuaikan dengan route Next.js lu
        }));

        // Gabungkan: Home + Kategori DB
        setNavLinks([{ name: "Beranda", link: "/news" }, ...categoryLinks]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
     {/* 2. Panggil Komponen Modal di luar struktur utama (biar rapi), tapi masih dalam fragment */}
    
      <motion.div ref={ref} className="sticky inset-x-0 top-0 z-50 w-full pt-4 px-4 sm:px-0">
        {/* Desktop Navigation */}
        <DesktopNav visible={visible}>
          <div className="flex items-center gap-6">
            <Logo />
            {/* Lempar data navLinks yang dinamis ke sini */}
            <NavItems items={navLinks} />
          </div>
          
          <div className="flex items-center gap-3">
          <ActionIcons 
  onUserClick={() => setIsLoginOpen(true)} 
  onSearchClick={() => setIsSearchOpen(true)} // <--- Tambahkan ini
/>
            <div className="pl-2 border-l border-gray-200 dark:border-gray-700">
              <ModeToggle />
            </div>
          </div>
        </DesktopNav>

        {/* Mobile Navigation */}
        <MobileNav 
          visible={visible} 
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onUserClick={() => setIsLoginOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          items={navLinks} // Lempar navLinks ke mobile juga
        />
      </motion.div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      {/* 2. Panggil Komponen Modal di luar struktur utama (biar rapi), tapi masih dalam fragment */}
      <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
       />
    </>
  );
};

export default Header;

// --- SUB COMPONENTS ---

const Logo = () => (
  <Link href="/" className="text-xl font-bold tracking-tight text-black dark:text-white">
   AlviansyahX
  </Link>
);

// --- ACTION ICONS COMPONENT ---
const ActionIcons = ({ onUserClick,onSearchClick }: { onUserClick: () => void;onSearchClick: () => void; }) => {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 relative">
    <button 
            onClick={onSearchClick} 
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            <Search className="h-5 w-5" />
          </button>

      <button 
        className="hidden md:block p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 relative transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
      </button>

      <div className="relative ml-1">
        {loading ? (
          <div className="p-2">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : user ? (
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-9 w-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-white text-xs font-bold overflow-hidden hover:scale-105 transition-transform"
          >
            {user.user_metadata?.avatar_url ? (
             
<div className="relative h-full w-full">
  <Image
    src={user.user_metadata.avatar_url}
    alt="User avatar"
    fill
    className="object-cover"
    sizes="40px"
  />
</div>
            ) : (
              user.email?.charAt(0).toUpperCase()
            )}
          </button>
        ) : (
          <button
            onClick={onUserClick}
            className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            <User className="h-5 w-5" />
          </button>
        )}

        <AnimatePresence>
          {isProfileOpen && user && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Akun Saya
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user.email}
                  </p>
                  {user.email === ADMIN_EMAIL && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800 w-fit">
                      <ShieldCheck size={12} /> ADMIN
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <Settings size={18} /> Pengaturan
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mt-1"
                  >
                    <LogOut size={18} /> Keluar
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- DESKTOP NAV ---
const DesktopNav = ({ 
  children, 
  visible 
}: { 
  children: React.ReactNode; 
  visible: boolean;
}) => {
  return (
    <motion.div
      animate={{
        width: visible ? "85%" : "100%",
        y: visible ? 10 : 0,
        borderRadius: visible ? "50px" : "0px",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "mx-auto hidden lg:flex flex-row items-center justify-between py-3 px-8 transition-colors duration-300",
        visible 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border border-slate-200 dark:border-slate-800" 
          : "bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      )}
      style={{ maxWidth: "1280px" }}
    >
      {children}
    </motion.div>
  );
};

// --- MOBILE NAV ---
const MobileNav = ({ 
  visible, 
  isOpen,
  onToggle,
  onUserClick,
  onSearchClick,
  items // Terima items sebagai props
}: { 
  visible: boolean; 
  isOpen: boolean;
  onToggle: () => void;
  onUserClick: () => void;
  onSearchClick: () => void; // 2. Daftarkan tipenya di sini
  items: NavLink[]; // Tambahkan Type
}) => {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
 
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <motion.div
      animate={{
        y: visible ? 10 : 0,
        borderRadius: visible || isOpen ? "24px" : "0px",
      }}
      className={cn(
        "flex lg:hidden flex-col py-3 px-4 transition-all duration-300 mx-auto",
        visible || isOpen
          ? "w-[95%] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border border-slate-200 dark:border-slate-800"
          : "w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggle}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
        </div>

        <div className="flex items-center gap-2 relative">
        {/* INI TOMBOLNYA BUAT MOBILE */}
        <button 
            onClick={onSearchClick} 
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            <Search className="h-5 w-5" />
          </button>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 hover:scale-105 transition-transform"
              >
                {user.user_metadata?.avatar_url ? (
                  <Image
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                ) : (
                  user.email?.charAt(0).toUpperCase()
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Akun Saya
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user.email}
                        </p>
                        {user.email === ADMIN_EMAIL && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800 w-fit">
                            <ShieldCheck size={12} /> ADMIN
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <Settings size={18} /> Pengaturan
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mt-1"
                        >
                          <LogOut size={18} /> Keluar
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={onUserClick}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              <User className="h-5 w-5" />
            </button>
          )}
          
          <ModeToggle />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <nav className="flex flex-col gap-1 pt-4 pb-2">
              {/* Mapping dari ITEMS props, bukan constant */}
              {items.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.link}
                  className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={onToggle}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- NAV ITEMS ---
const NavItems = ({ items }: { items: NavLink[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
    
      onMouseLeave={() => setHovered(null)}
      className="hidden lg:flex items-center gap-1"
    >
      {items.map((item, idx) => (
        <Link
          key={idx}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          className="relative px-3 py-2 text-sm font-medium text-slate-600 transition-colors dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered-pill"
              className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

// --- LOGIN MODAL (TETAP SAMA) ---
const LoginModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const supabase = createClient();
  const router = useRouter();
  
  const [view, setView] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        
        alert("Cek email Anda untuk konfirmasi!");
        setView("login");
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onClose();
          if (data.user.email === ADMIN_EMAIL) {
            window.location.href = "/dashboard";
          } else {
            router.refresh();
          }
        }
      }
    } catch (err) {
      const error = err as Error
      setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const error = err as Error
      setErrorMsg(error.message || "Gagal login dengan Google");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setFullName("");
      setErrorMsg(null);
      setView("login");
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-[400px] bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] overflow-hidden pointer-events-auto border border-slate-200 dark:border-slate-800"
            >
              <div className="relative p-8 pb-0">
                <button 
                  onClick={onClose} 
                  className="absolute right-6 top-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
                <motion.h2 
                  key={view} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-2xl font-bold text-slate-900 dark:text-white"
                >
                  {view === "login" ? "Selamat Datang" : "Buat Akun"}
                </motion.h2>
              </div>

              <div className="p-8">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-700 dark:text-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {view === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">
                      Atau pakai email
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={view} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      className="space-y-4"
                    >
                      {view === "signup" && (
                        <input 
                          required 
                          type="text" 
                          placeholder="Nama Lengkap" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder:text-slate-400"
                        />
                      )}
                      
                      <input 
                        required 
                        type="email" 
                        placeholder="Alamat Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder:text-slate-400"
                      />
                      
                      <input 
                        required 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder:text-slate-400"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex justify-center items-center shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      view === "login" ? "Masuk Sekarang" : "Buat Akun"
                    )}
                  </button>
                </form>
                
                <p className="mt-8 text-center text-sm text-slate-500">
                  {view === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setView(view === "login" ? "signup" : "login");
                      setErrorMsg(null);
                    }}
                    className="text-blue-500 font-bold hover:underline"
                  >
                    {view === "login" ? "Daftar" : "Masuk"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};