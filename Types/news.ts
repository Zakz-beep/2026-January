// types/news.ts
export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id: string; // Menggunakan UUID atau string ID
  status: NewsStatus;
}