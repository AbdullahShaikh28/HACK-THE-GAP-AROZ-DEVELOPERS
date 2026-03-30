export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      water_tanks: {
        Row: {
          id: number;
          name: string;
          type: "ESR" | "GSR" | "Sump";
          capacity_lakh_liters: number;
          capacity_used_lakh_liters: number | null;
          capacity_available_lakh_liters: number | null;
          latitude: number;
          longitude: number;
          ward: string;
          area_address: string;
          created_at: string | null;
        };
        Insert: {
          id: number;
          name: string;
          type: "ESR" | "GSR" | "Sump";
          capacity_lakh_liters: number;
          capacity_used_lakh_liters?: number | null;
          capacity_available_lakh_liters?: number | null;
          latitude: number;
          longitude: number;
          ward: string;
          area_address: string;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          type?: "ESR" | "GSR" | "Sump";
          capacity_lakh_liters?: number;
          capacity_used_lakh_liters?: number | null;
          capacity_available_lakh_liters?: number | null;
          latitude?: number;
          longitude?: number;
          ward?: string;
          area_address?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          tank_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          tank_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          tank_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      complaints: {
        Row: {
          id: string;
          name: string;
          phone_number: string;
          tank_id: number;
          issue: string;
          arrival_time: string | null;
          duration_minutes: number | null;
          pressure_level: "low" | "medium" | "high" | null;
          report_channel: "web" | "whatsapp";
          source_phone: string | null;
          whatsapp_message_sid: string | null;
          report_type: "complaint" | "supply_report";
          image_url: string | null;
          status: "open" | "in_progress" | "resolved" | "rejected";
          priority: "low" | "medium" | "high";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone_number: string;
          tank_id: number;
          issue: string;
          arrival_time?: string | null;
          duration_minutes?: number | null;
          pressure_level?: "low" | "medium" | "high" | null;
          report_channel?: "web" | "whatsapp";
          source_phone?: string | null;
          whatsapp_message_sid?: string | null;
          report_type?: "complaint" | "supply_report";
          image_url?: string | null;
          status?: "open" | "in_progress" | "resolved" | "rejected";
          priority?: "low" | "medium" | "high";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone_number?: string;
          tank_id?: number;
          issue?: string;
          arrival_time?: string | null;
          duration_minutes?: number | null;
          pressure_level?: "low" | "medium" | "high" | null;
          report_channel?: "web" | "whatsapp";
          source_phone?: string | null;
          whatsapp_message_sid?: string | null;
          report_type?: "complaint" | "supply_report";
          image_url?: string | null;
          status?: "open" | "in_progress" | "resolved" | "rejected";
          priority?: "low" | "medium" | "high";
          created_at?: string;
        };
        Relationships: [];
      };
      tank_areas: {
        Row: {
          id: number;
          tank_id: number;
          area_name: string;
          eta_minutes: number;
          duration_minutes: number;
          pressure_level: "low" | "medium" | "high";
          priority_rank: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          tank_id: number;
          area_name: string;
          eta_minutes: number;
          duration_minutes: number;
          pressure_level: "low" | "medium" | "high";
          priority_rank?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          tank_id?: number;
          area_name?: string;
          eta_minutes?: number;
          duration_minutes?: number;
          pressure_level?: "low" | "medium" | "high";
          priority_rank?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tank_contacts: {
        Row: {
          id: number;
          tank_id: number;
          name: string | null;
          phone_number: string;
          source: "complaint" | "profile" | "campaign_import";
          created_at: string;
        };
        Insert: {
          id?: number;
          tank_id: number;
          name?: string | null;
          phone_number: string;
          source?: "complaint" | "profile" | "campaign_import";
          created_at?: string;
        };
        Update: {
          id?: number;
          tank_id?: number;
          name?: string | null;
          phone_number?: string;
          source?: "complaint" | "profile" | "campaign_import";
          created_at?: string;
        };
        Relationships: [];
      };
      whatsapp_sessions: {
        Row: {
          phone_number: string;
          tank_id: number;
          selected_area_id: number | null;
          step:
            | "awaiting_language"
            | "awaiting_area"
            | "awaiting_complaint"
            | "completed";
          language: string | null;
          last_inbound_message_sid: string | null;
          updated_at: string;
        };
        Insert: {
          phone_number: string;
          tank_id: number;
          selected_area_id?: number | null;
          step?:
            | "awaiting_language"
            | "awaiting_area"
            | "awaiting_complaint"
            | "completed";
          language?: string | null;
          last_inbound_message_sid?: string | null;
          updated_at?: string;
        };
        Update: {
          phone_number?: string;
          tank_id?: number;
          selected_area_id?: number | null;
          step?:
            | "awaiting_language"
            | "awaiting_area"
            | "awaiting_complaint"
            | "completed";
          language?: string | null;
          last_inbound_message_sid?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

export type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatLanguage = "en" | "hi" | "mr" | "ur";
