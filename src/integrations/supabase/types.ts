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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          lead_id: string | null
          paid_at: string | null
          percentage: number
          product_id: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          percentage: number
          product_id?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          percentage?: number
          product_id?: string | null
          status?: string
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
      leads: {
        Row: {
          affiliate_id: string | null
          converted_at: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          product_id: string | null
          sale_value: number | null
          status: Database["public"]["Enums"]["lead_status"]
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          product_id?: string | null
          sale_value?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          product_id?: string | null
          sale_value?: number | null
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
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          phone?: string | null
          pix_key?: string | null
          tracking_code?: string | null
          updated_at?: string
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
      app_role: "admin" | "affiliate"
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
      app_role: ["admin", "affiliate"],
      lead_status: ["pending", "contacted", "qualified", "converted", "lost"],
      transaction_type: ["commission", "withdrawal", "bonus", "adjustment"],
      withdrawal_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
