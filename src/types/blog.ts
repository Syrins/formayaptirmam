
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author?: string;
  category_id?: string;
  published?: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  featured?: boolean;
  reading_time?: number;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Author {
  name: string;
  avatar?: string;
}

export interface BlogCategory {
  category: string;
  count: number;
}

export interface Translation {
  id: string;
  key: string;
  tr: string;
  en: string;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageContent {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  created_at?: string;
  updated_at?: string;
}
