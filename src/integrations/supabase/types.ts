export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_secret: boolean
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          bonus_percentage: number
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          target_affiliates: number | null
          updated_at: string
        }
        Insert: {
          bonus_percentage?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          target_affiliates?: number | null
          updated_at?: string
        }
        Update: {
          bonus_percentage?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          target_affiliates?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          base_sale_value: number | null
          created_at: string
          due_date: string | null
          id: string
          installment_number: number | null
          lead_id: string | null
          paid_at: string | null
          percentage: number
          product_id: string | null
          status: string
          total_installments: number | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          base_sale_value?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          lead_id?: string | null
          paid_at?: string | null
          percentage: number
          product_id?: string | null
          status?: string
          total_installments?: number | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          base_sale_value?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          installment_number?: number | null
          lead_id?: string | null
          paid_at?: string | null
          percentage?: number
          product_id?: string | null
          status?: string
          total_installments?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_form_questions: {
        Row: {
          conditional_field: string | null
          conditional_value: string | null
          created_at: string
          display_order: number
          field_key: string
          id: string
          is_active: boolean
          is_required: boolean
          options: Json | null
          question: string
          type: string
          updated_at: string
        }
        Insert: {
          conditional_field?: string | null
          conditional_value?: string | null
          created_at?: string
          display_order?: number
          field_key: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          options?: Json | null
          question: string
          type: string
          updated_at?: string
        }
        Update: {
          conditional_field?: string | null
          conditional_value?: string | null
          created_at?: string
          display_order?: number
          field_key?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          options?: Json | null
          question?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          accepts_whatsapp: boolean | null
          adjustment_month: string | null
          affiliate_id: string | null
          cnpj_or_region: string | null
          company_type: string | null
          converted_at: string | null
          covered_ages: string | null
          created_at: string
          email: string
          form_responses: Json | null
          has_health_plan: string | null
          health_plan_investment: string | null
          id: string
          insurance_provider: string | null
          monthly_income: string | null
          name: string
          notes: string | null
          payment_confirmed_at: string | null
          payment_notes: string | null
          payment_status: string | null
          pdv_id: string | null
          phone: string | null
          product_id: string | null
          rejection_reason: string | null
          sale_value: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          accepts_whatsapp?: boolean | null
          adjustment_month?: string | null
          affiliate_id?: string | null
          cnpj_or_region?: string | null
          company_type?: string | null
          converted_at?: string | null
          covered_ages?: string | null
          created_at?: string
          email: string
          form_responses?: Json | null
          has_health_plan?: string | null
          health_plan_investment?: string | null
          id?: string
          insurance_provider?: string | null
          monthly_income?: string | null
          name: string
          notes?: string | null
          payment_confirmed_at?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          pdv_id?: string | null
          phone?: string | null
          product_id?: string | null
          rejection_reason?: string | null
          sale_value?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          accepts_whatsapp?: boolean | null
          adjustment_month?: string | null
          affiliate_id?: string | null
          cnpj_or_region?: string | null
          company_type?: string | null
          converted_at?: string | null
          covered_ages?: string | null
          created_at?: string
          email?: string
          form_responses?: Json | null
          has_health_plan?: string | null
          health_plan_investment?: string | null
          id?: string
          insurance_provider?: string | null
          monthly_income?: string | null
          name?: string
          notes?: string | null
          payment_confirmed_at?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          pdv_id?: string | null
          phone?: string | null
          product_id?: string | null
          rejection_reason?: string | null
          sale_value?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pdv_id_fkey"
            columns: ["pdv_id"]
            isOneToOne: false
            referencedRelation: "pdv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          commission_percentage: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          pdv_id: string | null
          phone: string | null
          pix_key: string | null
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          pdv_id?: string | null
          phone?: string | null
          pix_key?: string | null
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          pdv_id?: string | null
          phone?: string | null
          pix_key?: string | null
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pdv_id_fkey"
            columns: ["pdv_id"]
            isOneToOne: false
            referencedRelation: "pdv"
            referencedColumns: ["id"]
          },
        ]
      }
      site_assets: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          thumbnail_url: string | null
          type: string
          updated_at: string
          updated_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          thumbnail_url?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_assets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content_key: string
          created_at: string
          description: string | null
          display_order: number | null
          extra_data: Json | null
          icon: string | null
          id: string
          is_active: boolean
          section: string
          title: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          content_key: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          extra_data?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          section: string
          title?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          content_key?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          extra_data?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          section?: string
          title?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_initials: string | null
          avatar_url: string | null
          content: string
          created_at: string
          display_order: number
          earnings: string
          id: string
          is_active: boolean
          name: string
          period: string
          role: string
          stars: number
          updated_at: string
          video_thumbnail: string | null
          video_url: string | null
        }
        Insert: {
          avatar_initials?: string | null
          avatar_url?: string | null
          content: string
          created_at?: string
          display_order?: number
          earnings: string
          id?: string
          is_active?: boolean
          name: string
          period: string
          role: string
          stars?: number
          updated_at?: string
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Update: {
          avatar_initials?: string | null
          avatar_url?: string | null
          content?: string
          created_at?: string
          display_order?: number
          earnings?: string
          id?: string
          is_active?: boolean
          name?: string
          period?: string
          role?: string
          stars?: number
          updated_at?: string
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          affiliate_id: string
          amount: number
          id: string
          notes: string | null
          pix_key: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Insert: {
          affiliate_id: string
          amount: number
          id?: string
          notes?: string | null
          pix_key: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
        }
        Update: {
          affiliate_id?: string
          amount?: number
          id?: string
          notes?: string | null
          pix_key?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_installment_commissions: {
        Args: {
          _affiliate_id: string
          _lead_id: string
          _product_id: string
          _sale_value: number
        }
        Returns: undefined
      }
      create_lead_result_notification: {
        Args: {
          _affiliate_id: string
          _commission_amount?: number
          _converted: boolean
          _lead_name: string
          _rejection_reason?: string
        }
        Returns: undefined
      }
      generate_tracking_code: { Args: never; Returns: string }
      get_affiliate_balance: {
        Args: { _affiliate_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "affiliate" | "gestor"
      lead_status: "pending" | "contacted" | "qualified" | "converted" | "lost"
      transaction_type: "commission" | "withdrawal" | "bonus" | "adjustment"
      withdrawal_status: "pending" | "approved" | "rejected" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "affiliate", "gestor"],
      lead_status: ["pending", "contacted", "qualified", "converted", "lost"],
      transaction_type: ["commission", "withdrawal", "bonus", "adjustment"],
      withdrawal_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
