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
      contact_audit_logs: {
        Row: {
          created_at: string | null
          email_to: string
          error_message: string | null
          id: string
          status: string
          submission_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_to: string
          error_message?: string | null
          id?: string
          status: string
          submission_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_to?: string
          error_message?: string | null
          id?: string
          status?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_audit_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          assunto: string
          created_at: string
          email: string
          id: string
          mensagem: string
          nome: string
        }
        Insert: {
          assunto: string
          created_at?: string
          email: string
          id?: string
          mensagem: string
          nome: string
        }
        Update: {
          assunto?: string
          created_at?: string
          email?: string
          id?: string
          mensagem?: string
          nome?: string
        }
        Relationships: []
      }
      crm_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_companies: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          health_score: string | null
          id: string
          name: string
          nif: string | null
          owner_id: string | null
          phone: string | null
          sector: string | null
          size: string | null
          status: Database["public"]["Enums"]["crm_company_status"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          health_score?: string | null
          id?: string
          name: string
          nif?: string | null
          owner_id?: string | null
          phone?: string | null
          sector?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["crm_company_status"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          health_score?: string | null
          id?: string
          name?: string
          nif?: string | null
          owner_id?: string | null
          phone?: string | null
          sector?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["crm_company_status"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contracts: {
        Row: {
          company_id: string | null
          contract_number: string | null
          created_at: string
          document_url: string | null
          end_date: string | null
          id: string
          notes: string | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["crm_contract_status"] | null
          type: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          company_id?: string | null
          contract_number?: string | null
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["crm_contract_status"] | null
          type?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          company_id?: string | null
          contract_number?: string | null
          created_at?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["crm_contract_status"] | null
          type?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_finances: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          due_date: string | null
          id: string
          invoice_url: string | null
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["crm_transaction_type"]
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string
          description: string
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          project_id?: string | null
          status?: string | null
          type: Database["public"]["Enums"]["crm_transaction_type"]
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          project_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["crm_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "crm_finances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          company: string | null
          company_id: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          google_drive_folder_id: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["crm_lead_status"]
          updated_at: string
        }
        Insert: {
          company?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          google_drive_folder_id?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
        }
        Update: {
          company?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          google_drive_folder_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_projects: {
        Row: {
          budget: number | null
          budget_alert_threshold: number | null
          company_id: string | null
          created_at: string
          end_date: string | null
          google_drive_folder_id: string | null
          id: string
          lead_id: string | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["crm_project_status"]
          total_value: number | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          budget_alert_threshold?: number | null
          company_id?: string | null
          created_at?: string
          end_date?: string | null
          google_drive_folder_id?: string | null
          id?: string
          lead_id?: string | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          budget_alert_threshold?: number | null
          company_id?: string | null
          created_at?: string
          end_date?: string | null
          google_drive_folder_id?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["crm_project_status"]
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          lead_id: string | null
          priority: string | null
          project_id: string | null
          spent_hours: number | null
          status: Database["public"]["Enums"]["crm_task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          project_id?: string | null
          spent_hours?: number | null
          status?: Database["public"]["Enums"]["crm_task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          project_id?: string | null
          spent_hours?: number | null
          status?: Database["public"]["Enums"]["crm_task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tickets: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["crm_ticket_status"] | null
          subject: string
          ticket_number: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["crm_ticket_status"] | null
          subject: string
          ticket_number?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["crm_ticket_status"] | null
          subject?: string
          ticket_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cookie_preferences: Json | null
          id: string
          updated_at: string
        }
        Insert: {
          cookie_preferences?: Json | null
          id: string
          updated_at?: string
        }
        Update: {
          cookie_preferences?: Json | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      crm_company_status: "active" | "inactive" | "prospective"
      crm_contract_status:
        | "draft"
        | "sent"
        | "signed"
        | "active"
        | "expired"
        | "cancelled"
      crm_lead_status:
        | "new"
        | "contacted"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      crm_project_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled"
      crm_proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "negotiation"
        | "accepted"
        | "rejected"
        | "expired"
      crm_task_status: "todo" | "in_progress" | "blocked" | "review" | "done"
      crm_ticket_status:
        | "open"
        | "in_progress"
        | "waiting_client"
        | "resolved"
        | "closed"
      crm_transaction_type: "income" | "expense"
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
      app_role: ["admin", "moderator", "user"],
      crm_company_status: ["active", "inactive", "prospective"],
      crm_contract_status: [
        "draft",
        "sent",
        "signed",
        "active",
        "expired",
        "cancelled",
      ],
      crm_lead_status: [
        "new",
        "contacted",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      crm_project_status: [
        "planning",
        "active",
        "on_hold",
        "completed",
        "cancelled",
      ],
      crm_proposal_status: [
        "draft",
        "sent",
        "viewed",
        "negotiation",
        "accepted",
        "rejected",
        "expired",
      ],
      crm_task_status: ["todo", "in_progress", "blocked", "review", "done"],
      crm_ticket_status: [
        "open",
        "in_progress",
        "waiting_client",
        "resolved",
        "closed",
      ],
      crm_transaction_type: ["income", "expense"],
    },
  },
} as const
