// Generado desde el esquema de Supabase (proyecto StrikeLab).
// Regenerar con: supabase gen types typescript --project-id hwqiyqullrznovamkhsz
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bowling_centers: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowling_centers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      frames: {
        Row: {
          cumulative_score: number | null
          frame_number: number
          game_player_id: string
          id: string
          is_spare: boolean
          is_split: boolean
          is_strike: boolean
        }
        Insert: {
          cumulative_score?: number | null
          frame_number: number
          game_player_id: string
          id?: string
          is_spare?: boolean
          is_split?: boolean
          is_strike?: boolean
        }
        Update: {
          cumulative_score?: number | null
          frame_number?: number
          game_player_id?: string
          id?: string
          is_spare?: boolean
          is_split?: boolean
          is_strike?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "frames_game_player_id_fkey"
            columns: ["game_player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          final_score: number
          game_id: string
          id: string
          player_id: string
          turn_order: number
        }
        Insert: {
          final_score: number
          game_id: string
          id?: string
          player_id: string
          turn_order?: number
        }
        Update: {
          final_score?: number
          game_id?: string
          id?: string
          player_id?: string
          turn_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          center_id: string | null
          created_at: string
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          notes: string | null
          owner_id: string
          played_at: string
          scoring_mode: Database["public"]["Enums"]["scoring_mode"]
        }
        Insert: {
          center_id?: string | null
          created_at?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          notes?: string | null
          owner_id: string
          played_at?: string
          scoring_mode?: Database["public"]["Enums"]["scoring_mode"]
        }
        Update: {
          center_id?: string | null
          created_at?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          notes?: string | null
          owner_id?: string
          played_at?: string
          scoring_mode?: Database["public"]["Enums"]["scoring_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "games_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "bowling_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pin_results: {
        Row: {
          id: string
          is_knocked: boolean
          pin_number: number
          throw_id: string
        }
        Insert: {
          id?: string
          is_knocked: boolean
          pin_number: number
          throw_id: string
        }
        Update: {
          id?: string
          is_knocked?: boolean
          pin_number?: number
          throw_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pin_results_throw_id_fkey"
            columns: ["throw_id"]
            isOneToOne: false
            referencedRelation: "throws"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_owner: boolean
          name: string
          owner_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_owner?: boolean
          name: string
          owner_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_owner?: boolean
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email: string
          id: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      shared_score_cards: {
        Row: {
          created_at: string
          game_id: string
          id: string
          image_url: string | null
          user_id: string
          watermarked: boolean
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          image_url?: string | null
          user_id: string
          watermarked?: boolean
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          image_url?: string | null
          user_id?: string
          watermarked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "shared_score_cards_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_score_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_snapshots: {
        Row: {
          average_score: number | null
          best_score: number | null
          computed_at: string
          extra: Json
          games_count: number
          id: string
          open_frame_rate: number | null
          period_end: string
          period_start: string
          player_id: string | null
          spare_rate: number | null
          strike_rate: number | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          best_score?: number | null
          computed_at?: string
          extra?: Json
          games_count?: number
          id?: string
          open_frame_rate?: number | null
          period_end: string
          period_start: string
          player_id?: string | null
          spare_rate?: number | null
          strike_rate?: number | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          best_score?: number | null
          computed_at?: string
          extra?: Json
          games_count?: number
          id?: string
          open_frame_rate?: number | null
          period_end?: string
          period_start?: string
          player_id?: string | null
          spare_rate?: number | null
          strike_rate?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stats_snapshots_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stats_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: Database["public"]["Enums"]["plan_tier"]
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      throws: {
        Row: {
          frame_id: string
          id: string
          pins_knocked: number
          throw_number: number
        }
        Insert: {
          frame_id: string
          id?: string
          pins_knocked: number
          throw_number: number
        }
        Update: {
          frame_id?: string
          id?: string
          pins_knocked?: number
          throw_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "throws_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "frames"
            referencedColumns: ["id"]
          },
        ]
      }
      training_recommendations: {
        Row: {
          body: string
          category: string | null
          created_at: string
          expected_gain: number | null
          id: string
          priority: number
          status: Database["public"]["Enums"]["recommendation_status"]
          title: string
          user_id: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          expected_gain?: number | null
          id?: string
          priority?: number
          status?: Database["public"]["Enums"]["recommendation_status"]
          title: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          expected_gain?: number | null
          id?: string
          priority?: number
          status?: Database["public"]["Enums"]["recommendation_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_recommendations_user_id_fkey"
            columns: ["user_id"]
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
      owns_frame: { Args: { p_frame_id: string }; Returns: boolean }
      owns_game: { Args: { p_game_id: string }; Returns: boolean }
      owns_game_player: { Args: { p_game_player_id: string }; Returns: boolean }
      owns_throw: { Args: { p_throw_id: string }; Returns: boolean }
      player_missed_pins: {
        Args: { p_player_id: string }
        Returns: {
          missed_count: number
          pin_number: number
        }[]
      }
      player_score_history: {
        Args: { p_limit?: number; p_player_id: string }
        Returns: {
          center_name: string
          final_score: number
          game_id: string
          played_at: string
        }[]
      }
      player_spare_conversion: {
        Args: { p_player_id: string }
        Returns: number
      }
      player_stats_summary: {
        Args: { p_player_id: string }
        Returns: {
          average_score: number
          best_score: number
          games_count: number
          open_frame_rate: number
          spare_rate: number
          strike_rate: number
        }[]
      }
    }
    Enums: {
      game_type: "practice" | "casual" | "league" | "tournament"
      plan_tier: "free" | "plus" | "pro"
      recommendation_status: "pending" | "viewed" | "done" | "dismissed"
      scoring_mode: "final_only" | "frame_by_frame" | "pin_by_pin"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
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
      game_type: ["practice", "casual", "league", "tournament"],
      plan_tier: ["free", "plus", "pro"],
      recommendation_status: ["pending", "viewed", "done", "dismissed"],
      scoring_mode: ["final_only", "frame_by_frame", "pin_by_pin"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "expired",
      ],
    },
  },
} as const
