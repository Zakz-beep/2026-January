"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings, 
  Menu,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  BarChart3,
  MoreVertical,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import CategoryModal from '@/components/dashboardContent/Categories';

// ===== TYPES =====
interface Article {
  id: string;
  title: string;
  status: string;
  created_at: string;
  view_count: number;
  slug: string;
  categories: { name: string } | { name: string }[] | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
}

interface CategoryStats {
  name: string;
  count: number;
}

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// ===== CUSTOM HOOKS =====

/**
 * Hook for authentication management
 */
function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

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
  }, [supabase]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [supabase]);

  return { user, loading, handleLogout };
}

/**
 * Hook for fetching dashboard statistics
 */
function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: articles, error } = await supabase
          .from("articles")
          .select("status, view_count");

        if (error) throw error;

        const total = articles?.length || 0;
        const published = articles?.filter(a => a.status === 'published').length || 0;
        const draft = articles?.filter(a => a.status === 'draft').length || 0;
        const views = articles?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;

        setStats({
          totalArticles: total,
          publishedArticles: published,
          draftArticles: draft,
          totalViews: views
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  return { stats, loading };
}

/**
 * Hook for managing articles with delete functionality
 */
function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchArticles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, 
          title, 
          status, 
          created_at, 
          view_count, 
          slug,
          categories (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const deleteFileFromStorage = useCallback(async (url: string) => {
    if (!url || !url.includes("storage/v1/object/public/article-images/")) return;
    
    const path = url.split("article-images/")[1];
    
    if (path) {
      const { error: storageError } = await supabase.storage
        .from("article-images")
        .remove([path]);
      
      if (storageError) {
        console.error("Gagal hapus file di storage:", storageError);
      }
    }
  }, [supabase]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Yakin mau hapus artikel "${title}"? File gambar juga bakal ikut dihapus dari storage.`
    );
    
    if (!confirmed) return;

    try {
      const { data: article, error: fetchError } = await supabase
        .from("articles")
        .select("featured_image, content")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete featured image
      if (article.featured_image) {
        await deleteFileFromStorage(article.featured_image);
      }

      // Delete images from content
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      while ((match = imgRegex.exec(article.content)) !== null) {
        const imgUrl = match[1];
        await deleteFileFromStorage(imgUrl);
      }

      // Delete article from database
      const { error: dbError } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Update local state
      setArticles((prev) => prev.filter((a) => a.id !== id));
      alert("Artikel dan semua filenya berhasil dimusnahkan!");

    } catch (err) {
      const error = err as Error;
      console.error("Error full delete:", err);
      alert("Gagal hapus total: " + error.message);
    }
  }, [supabase, deleteFileFromStorage]);

  return { articles, loading, handleDelete };
}

/**
 * Hook for fetching category statistics
 */
function useCategoryStats() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const { data: articles, error } = await supabase
          .from("articles")
          .select("category_id, categories(name)");

        if (error) throw error;

        const categoryCount: Record<string, number> = {};
        
        articles?.forEach(article => {
          // Handle both single object and array types
          const categoryData = article.categories;
          
          if (categoryData) {
            // Check if it's an array
            if (Array.isArray(categoryData)) {
              categoryData.forEach((cat: { name: string }) => {
                if (cat.name) {
                  categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
                }
              });
            } else {
              // It's a single object
              const cat = categoryData as { name: string };
              if (cat.name) {
                categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
              }
            }
          }
        });

        const sortedCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setCategories(sortedCategories);
      } catch (err) {
        console.error("Error fetching category stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, [supabase]);

  return { categories, loading };
}

/**
 * Hook for managing categories
 */
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      if (data) setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, fetchCategories };
}

// ===== COMPONENTS =====

/**
 * Sidebar navigation component
 */
const Sidebar = React.memo(function Sidebar({ 
  sidebarOpen, 
  activeMenu, 
  setActiveMenu,
  onLogout 
}: { 
  sidebarOpen: boolean;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
}) {
  const menuItems: MenuItem[] = useMemo(() => [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'articles', icon: FileText, label: 'Articles' },
    { id: 'categories', icon: FolderOpen, label: 'Categories' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ], []);

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {sidebarOpen ? (
          <div className="font-bold text-xl">
            <span className="text-blue-600">News</span>CMS
          </div>
        ) : (
          <FileText className="w-6 h-6 text-blue-600" />
        )}
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                activeMenu === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
});

/**
 * Dashboard header with user info and search
 */
const DashboardHeader = React.memo(function DashboardHeader({ 
  user, 
  sidebarOpen, 
  setSidebarOpen 
}: { 
  user: SupabaseUser | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  const userInitial = useMemo(() => 
    user?.email?.charAt(0).toUpperCase() || 'U',
    [user]
  );

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search articles, categories..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="flex items-center gap-3">
          <Avatar>
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="User avatar" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <AvatarFallback>{userInitial}</AvatarFallback>
            )}
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">Admin User</div>
            <div className="text-gray-500 text-xs">
              <p>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

/**
 * Statistics card component
 */
const StatsCard = React.memo(function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Recent articles list with actions
 */
const RecentArticlesCard = React.memo(function RecentArticlesCard({ 
  articles, 
  onDelete 
}: { 
  articles: Article[];
  onDelete: (id: string, title: string) => void;
}) {
  return (
    <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-black uppercase tracking-tight">Recent Articles</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/articles">View All</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div 
                key={article.id} 
                className="flex items-center justify-between py-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-all"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {article.status}
                    </span>
                    
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="w-3 h-3" />
                      {article.view_count || 0}
                    </span>

                    <span>{format(new Date(article.created_at), 'dd MMM yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild title="Edit Article">
                    <Link href={`/dashboard/post/edit/${article.id}`}>
                      <Edit className="w-4 h-4 text-slate-400 hover:text-blue-600 transition-colors" />
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${article.slug}`} target="_blank" className="cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4" /> View Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(article.id, article.title)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-3">
              <p className="text-slate-500 italic">Belum ada artikel nih, cok.</p>
              <Button asChild variant="secondary">
                <Link href="/dashboard/post">Buat Artikel Pertama</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Performance metrics card
 */
const PerformanceCard = React.memo(function PerformanceCard({ 
  stats, 
  categories 
}: { 
  stats: DashboardStats;
  categories: CategoryStats[];
}) {
  const publishedRate = useMemo(() => 
    stats.totalArticles > 0 
      ? ((stats.publishedArticles / stats.totalArticles) * 100).toFixed(1)
      : '0',
    [stats.totalArticles, stats.publishedArticles]
  );
  
  const avgViews = useMemo(() => 
    stats.publishedArticles > 0 
      ? (stats.totalViews / stats.publishedArticles).toFixed(0)
      : '0',
    [stats.totalViews, stats.publishedArticles]
  );

  const avgViewsPercentage = useMemo(() => 
    Math.min(100, parseInt(avgViews) / 100),
    [avgViews]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Published Rate</span>
              <span className="font-medium">{publishedRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${publishedRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Average Views</span>
              <span className="font-medium">{avgViews}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${avgViewsPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-3">Top Categories</h4>
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{category.name}</span>
                    <span className="font-medium">{category.count} articles</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No categories yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Main dashboard content
 */
const DashboardContent = React.memo(function DashboardContent({ 
  stats, 
  articles, 
  categories,
  onDeleteArticle 
}: {
  stats: DashboardStats;
  articles: Article[];
  categories: CategoryStats[];
  onDeleteArticle: (id: string, title: string) => void;
}) {
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href='/dashboard/post'>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Total Articles" 
          value={stats.totalArticles}
          icon={FileText}
          color="text-blue-600"
        />
        <StatsCard 
          title="Published" 
          value={stats.publishedArticles}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatsCard 
          title="Draft" 
          value={stats.draftArticles}
          icon={Edit}
          color="text-yellow-600"
        />
        <StatsCard 
          title="Total Views" 
          value={formatNumber(stats.totalViews)}
          icon={Eye}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentArticlesCard 
          articles={articles}
          onDelete={onDeleteArticle}
        />
        <PerformanceCard 
          stats={stats}
          categories={categories}
        />
      </div>
    </>
  );
});

/**
 * Categories management content
 */
const CategoriesContent = React.memo(function CategoriesContent({ 
  categories, 
  onRefresh 
}: { 
  categories: Category[];
  onRefresh: () => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black italic uppercase">Manage Categories</h1>
        <CategoryModal onSuccess={onRefresh} />
      </div>
      <div className="grid gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-sm"
          >
            <div>
              <p className="font-bold text-lg">{cat.name}</p>
              <p className="text-xs text-slate-500">slug: {cat.slug}</p>
            </div>
            <CategoryModal category={cat} onSuccess={onRefresh} />
          </div>
        ))}
      </div>
    </>
  );
});

/**
 * Placeholder page for unimplemented features
 */
const PlaceholderPage = React.memo(function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-400">{title}</h2>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );
});

// ===== MAIN COMPONENT =====

/**
 * Main dashboard component
 */
export default function NewsCMSDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const { user, handleLogout } = useAuth();
  const { stats } = useDashboardStats();
  const { articles, handleDelete } = useArticles();
  const { categories: categoryStats } = useCategoryStats();
  const { categories: allCategories, fetchCategories } = useCategories();

  const renderContent = useCallback(() => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardContent 
            stats={stats}
            articles={articles}
            categories={categoryStats}
            onDeleteArticle={handleDelete}
          />
        );
      case 'categories':
        return (
          <CategoriesContent 
            categories={allCategories}
            onRefresh={fetchCategories}
          />
        );
      case 'articles':
        return <PlaceholderPage title="Articles Page" />;
      case 'users':
        return <PlaceholderPage title="Users Page" />;
      case 'settings':
        return <PlaceholderPage title="Settings Page" />;
      default:
        return null;
    }
  }, [activeMenu, stats, articles, categoryStats, handleDelete, allCategories, fetchCategories]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}