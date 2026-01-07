import React from 'react';
import Header from '@/components/news-components/Header'; // Pastikan path sesuai
import Headline from '@/components/news-components/Headline';
import Content from '@/components/news-components/bodyContent';

const NewsHomepage = () => {
  return (
    // 1. Tambahkan dark:bg-slate-950 agar background halaman berubah saat dark mode
    <div className="min-h-screen bg-gray-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      
      {/* Header diletakkan di paling atas */}
      <Header />

      {/* 2. Main Content dengan padding agar rapi */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <Headline/>

      <Content />

      </main>
      
    </div>
  );
};

export default NewsHomepage;