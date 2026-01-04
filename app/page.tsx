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
import { InfiniteMovingCardsDemo } from "@/components/CardComp";
import { CommentFormDemo } from "@/components/FormComp";

import { Spotlight } from "@/components/ui/spotlight-new";


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
          <NavbarLogo/>
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
      <main className="grow">
        <MainContent />
      </main>

    </div>
  );
}

// Komponen Konten Utama
// Disusun per-section agar mudah ditambah di masa depan
// Komponen Konten Utama
const MainContent = () => {
  return (
    <div className="flex flex-col w-full overflow-x-hidden"> {/* Mencegah horizontal scroll */}
      
      {/* SECTION 1: HERO */}
      {/* min-h-screen terkadang bermasalah di mobile (URL bar), 
          gunakan min-[100dvh] untuk hasil lebih presisi */}
      <section id="hero" className="w-full min-h-dvh flex flex-col justify-center items-center py-10">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <LayoutTextFlipDemo />
         </div>
      </section>

      {/* SECTION 2: MY JOURNAL */}
      <section id="features" className="w-full py-16 md:py-24 bg-neutral-50/5 dark:bg-white/2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">My Journal</h2>
           <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-sm md:text-base">
             This is a collection of my thoughts and daily progress.
           </p>
          <div className="w-full overflow-hidden"> {/* Menjaga timeline agar tidak melebar */}
            <TimelineDemo />
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS (Infinite Cards) */}
      <section id="projects" className="w-full py-16 md:py-24">
         <div className="container mx-auto px-0 md:px-4 text-center">
            {/* Judul opsional untuk memperjelas section */}
            <h2 className="text-2xl md:text-4xl font-bold mb-10">Featured Projects</h2>
            <InfiniteMovingCardsDemo />
         </div>
      </section>

       {/* SECTION 4: CONTACT FORM */}
       <section id="contact" className="w-full py-16 md:py-24">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-white/3 p-6 md:p-10 rounded-3xl border border-white/10 shadow-xl">
               <CommentFormDemo />
            </div>
         </div>
      </section>

      {/* SECTION 5: FOOTER / THANKS */}
      {/* Gunakan relative untuk memposisikan Spotlight agar tidak merusak layout */}
      <section className="relative w-full py-24 md:py-40 flex items-center justify-center overflow-hidden">
         <Spotlight  />
         
         <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold bg-clip-text text-transparent bg-linear-to-b from-neutral-50 to-neutral-400 leading-tight">
              Thanks for <br className="hidden md:block" /> Visiting My Website
            </h1>
         </div>
      </section>

    </div>
  );
};