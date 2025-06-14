export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      about_features: {
        Row: {
          created_at: string
          description_en: string
          description_tr: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_tr: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_features_section_key_fkey"
            columns: ["section_key"]
            isOneToOne: false
            referencedRelation: "about_sections"
            referencedColumns: ["section_key"]
          },
        ]
      }
      about_sections: {
        Row: {
          created_at: string
          description_en: string
          description_tr: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_tr: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
        }
        Relationships: []
      }
      design_options: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          name_tr: string
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          name_tr: string
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          name_tr?: string
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      design_templates: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          model_url: string | null
          name: string
          name_tr: string
          preview_url: string
          texture_url: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          model_url?: string | null
          name: string
          name_tr: string
          preview_url: string
          texture_url?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          model_url?: string | null
          name?: string
          name_tr?: string
          preview_url?: string
          texture_url?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer_en: string
          answer_tr: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question_en: string
          question_tr: string
          updated_at: string
        }
        Insert: {
          answer_en: string
          answer_tr: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question_en: string
          question_tr: string
          updated_at?: string
        }
        Update: {
          answer_en?: string
          answer_tr?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question_en?: string
          question_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section: string
          title_en: string
          title_tr: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section: string
          title_en: string
          title_tr: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      gallery_settings: {
        Row: {
          created_at: string
          default_filter_view: string
          delivery_time_text_en: string
          delivery_time_text_tr: string
          description_en: string
          description_tr: string
          id: string
          items_per_page: number
          layout_type: string
          show_delivery_time: boolean
          show_filters: boolean
          show_min_order: boolean
          show_price: boolean
          show_search: boolean
          show_stock_status: boolean
          sort_order: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_filter_view?: string
          delivery_time_text_en?: string
          delivery_time_text_tr?: string
          description_en?: string
          description_tr?: string
          id?: string
          items_per_page?: number
          layout_type?: string
          show_delivery_time?: boolean
          show_filters?: boolean
          show_min_order?: boolean
          show_price?: boolean
          show_search?: boolean
          show_stock_status?: boolean
          sort_order?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_filter_view?: string
          delivery_time_text_en?: string
          delivery_time_text_tr?: string
          description_en?: string
          description_tr?: string
          id?: string
          items_per_page?: number
          layout_type?: string
          show_delivery_time?: boolean
          show_filters?: boolean
          show_min_order?: boolean
          show_price?: boolean
          show_search?: boolean
          show_stock_status?: boolean
          sort_order?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          created_at: string
          description_en: string
          description_tr: string
          id: string
          section: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_tr: string
          id?: string
          section: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_tr?: string
          id?: string
          section?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_features: {
        Row: {
          created_at: string
          description_en: string
          description_tr: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          section_key: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_tr: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          section_key: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          section_key?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_features_section_key_fkey"
            columns: ["section_key"]
            isOneToOne: false
            referencedRelation: "homepage_sections"
            referencedColumns: ["section_key"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          created_at: string
          description_en: string
          description_tr: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_tr: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      jersey_colors: {
        Row: {
          created_at: string
          hex_code: string
          id: string
          is_active: boolean
          name: string
          name_tr: string
        }
        Insert: {
          created_at?: string
          hex_code: string
          id?: string
          is_active?: boolean
          name: string
          name_tr: string
        }
        Update: {
          created_at?: string
          hex_code?: string
          id?: string
          is_active?: boolean
          name?: string
          name_tr?: string
        }
        Relationships: []
      }
      jersey_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_tr: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_tr: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_tr?: string
        }
        Relationships: []
      }
      order_quantities: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          value?: number
        }
        Relationships: []
      }
      page_contents: {
        Row: {
          contact_image_url: string | null
          content_en: string
          content_tr: string
          created_at: string
          id: string
          is_active: boolean
          page_type: string
          title_en: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          contact_image_url?: string | null
          content_en: string
          content_tr: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_type: string
          title_en: string
          title_tr: string
          updated_at?: string
        }
        Update: {
          contact_image_url?: string | null
          content_en?: string
          content_tr?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_type?: string
          title_en?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_ranges: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          max: number
          min: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          max?: number
          min?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          max?: number
          min?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: string[] | null
          colors: number | null
          created_at: string | null
          description: string | null
          display_id: number | null
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          jersey_type: string | null
          min_order: number | null
          name: string
          price: number
          selected_colors: string[] | null
          slug: string | null
          stock: number
          updated_at: string | null
        }
        Insert: {
          additional_images?: string[] | null
          colors?: number | null
          created_at?: string | null
          description?: string | null
          display_id?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          jersey_type?: string | null
          min_order?: number | null
          name: string
          price: number
          selected_colors?: string[] | null
          slug?: string | null
          stock?: number
          updated_at?: string | null
        }
        Update: {
          additional_images?: string[] | null
          colors?: number | null
          created_at?: string | null
          description?: string | null
          display_id?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          jersey_type?: string | null
          min_order?: number | null
          name?: string
          price?: number
          selected_colors?: string[] | null
          slug?: string | null
          stock?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_jersey_type_fkey"
            columns: ["jersey_type"]
            isOneToOne: false
            referencedRelation: "jersey_types"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          id: string
          keywords: string | null
          meta_description: string | null
          meta_title: string | null
          site_description: string | null
          site_title: string | null
        }
        Insert: {
          id: string
          keywords?: string | null
          meta_description?: string | null
          meta_title?: string | null
          site_description?: string | null
          site_title?: string | null
        }
        Update: {
          id?: string
          keywords?: string | null
          meta_description?: string | null
          meta_title?: string | null
          site_description?: string | null
          site_title?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_color: string | null
          created_at: string
          font_family: string | null
          gradient_direction: string | null
          gradient_end: string | null
          gradient_start: string | null
          id: string
          letter_colors: Json | null
          logo_image_url: string | null
          logo_text: string | null
          logo_type: string
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string
          use_gradient: boolean | null
          use_letter_colors: boolean | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          font_family?: string | null
          gradient_direction?: string | null
          gradient_end?: string | null
          gradient_start?: string | null
          id: string
          letter_colors?: Json | null
          logo_image_url?: string | null
          logo_text?: string | null
          logo_type?: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
          use_gradient?: boolean | null
          use_letter_colors?: boolean | null
        }
        Update: {
          background_color?: string | null
          created_at?: string
          font_family?: string | null
          gradient_direction?: string | null
          gradient_end?: string | null
          gradient_start?: string | null
          id?: string
          letter_colors?: Json | null
          logo_image_url?: string | null
          logo_text?: string | null
          logo_type?: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
          use_gradient?: boolean | null
          use_letter_colors?: boolean | null
        }
        Relationships: []
      }
      story_rings: {
        Row: {
          content: string | null
          content_en: string | null
          content_tr: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          images: string[] | null
          is_active: boolean | null
          jersey_type_id: string | null
          ring_color: string | null
          shape: string | null
          title: string
          title_en: string | null
          title_tr: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_en?: string | null
          content_tr?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          images?: string[] | null
          is_active?: boolean | null
          jersey_type_id?: string | null
          ring_color?: string | null
          shape?: string | null
          title: string
          title_en?: string | null
          title_tr?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_en?: string | null
          content_tr?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          images?: string[] | null
          is_active?: boolean | null
          jersey_type_id?: string | null
          ring_color?: string | null
          shape?: string | null
          title?: string
          title_en?: string | null
          title_tr?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_rings_jersey_type_id_fkey"
            columns: ["jersey_type_id"]
            isOneToOne: false
            referencedRelation: "jersey_types"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          en: string
          id: string
          key: string
          tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          en: string
          id?: string
          key: string
          tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          en?: string
          id?: string
          key?: string
          tr?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_blog_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
