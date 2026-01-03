"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ModeToggle } from "@/components/Dark";
import { LayoutTextFlipDemo } from "@/components/Welcome";
import { TimelineDemo } from "@/components/actionComponents/TimelinesComp";

export default function NavbarDemo() {
  const navItems = [
    { name: "Home", link: "#hero" },
    { name: "Features", link: "#features" },
    { name: "Projects", link: "#projects" },
    { name: "Contact", link: "#contact" },
  ];

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/My-cv.pdf";
    link.download = "Alviansyah CV.pdf";
    link.click();
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen flex flex-col font-sans">
      
      {/* --- NAVBAR --- */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        
        {/* DESKTOP VIEW */}
        <NavBody>
          <NavbarLogo className="font-bold text-xl" />
          <NavItems items={navItems} />
          <div className="flex items-center gap-3">
            <NavbarButton variant="primary" onClick={handleDownload}>
              My CV
            </NavbarButton>
            {/* Mode Toggle dibungkus div agar rapi */}
            <div className="ml-2">
              <ModeToggle />
            </div>
          </div>
        </NavBody>

        {/* MOBILE VIEW */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            
            {/* Hanya tampilkan elemen penting di Header Mobile agar tidak sempit */}
            <div className="flex items-center gap-2">
              <ModeToggle /> 
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {/* Link Navigasi Mobile */}
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-neutral-600 dark:text-neutral-300 border-b border-gray-100 dark:border-gray-800"
              >
                {item.name}
              </a>
            ))}

            {/* Tombol Action di Mobile (Dipindah ke sini agar header lega) */}
            <div className="mt-6 flex flex-col gap-4">
              <button
                onClick={handleDownload}
                className="w-full rounded-xl bg-black text-white py-3 font-semibold dark:bg-white dark:text-black"
              >
                Download My CV
              </button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* --- MAIN CONTENT (Proporsional & Scalable) --- */}
      <main className="flex-grow">
        <MainContent />
      </main>

    </div>
  );
}

// Komponen Konten Utama
// Disusun per-section agar mudah ditambah di masa depan
const MainContent = () => {
  return (
    <div className="flex flex-col w-full">
      
      {/* SECTION 1: HERO (Welcome) */}
      {/* id="hero" penting untuk scroll nav */}
      <section id="hero" className="w-full min-h-screen pt-20 flex flex-col justify-center">
         <div className="container mx-auto px-4">
            <LayoutTextFlipDemo />
         </div>
      </section>

      {/* SECTION 2: CONTOH COMPONENT LAIN (Nanti isi di sini) */}
      {/* Tambahkan ini agar layout tidak rusak saat nambah konten baru */}
      <section id="features" className="w-full py-20 bg-gray-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl font-bold mb-4">My Services</h2>
           <p className="text-gray-500">Konten komponen lain akan masuk di sini dengan rapi.</p>
          <TimelineDemo />
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section id="projects" className="w-full py-20">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Latest Projects</h2>
            {/* Component Projects di sini */}
         </div>
      </section>

    </div>
  );
};