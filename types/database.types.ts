// Database Types - Define todos os schemas das tabelas

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          bio: string | null
          rating: number | null
          total_ratings: number
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          rating?: number | null
          total_ratings?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          rating?: number | null
          total_ratings?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          kind: string | null
          lat: number | null
          lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          kind?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          kind?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: 'offer' | 'request'
          category: string
          proximity: number
          status: 'active' | 'matched' | 'completed' | 'cancelled'
          community: string | null
          reach: string
          reach_communities: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: 'offer' | 'request'
          category: string
          proximity?: number
          status?: 'active' | 'matched' | 'completed' | 'cancelled'
          community?: string | null
          reach?: string
          reach_communities?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: 'offer' | 'request'
          category?: string
          proximity?: number
          status?: 'active' | 'matched' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: 'new' | 'like_new' | 'good' | 'fair'
          images: string[]
          status: 'available' | 'reserved' | 'sold'
          location: string | null
          community: string | null
          reach: string
          reach_communities: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          condition: 'new' | 'like_new' | 'good' | 'fair'
          images?: string[]
          status?: 'available' | 'reserved' | 'sold'
          location?: string | null
          community?: string | null
          reach?: string
          reach_communities?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          condition?: 'new' | 'like_new' | 'good' | 'fair'
          images?: string[]
          status?: 'available' | 'reserved' | 'sold'
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mural_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          images: string[]
          type: 'announcement' | 'event' | 'general'
          community: string | null
          reach: string
          reach_communities: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          images?: string[]
          type?: 'announcement' | 'event' | 'general'
          community?: string | null
          reach?: string
          reach_communities?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          images?: string[]
          type?: 'announcement' | 'event' | 'general'
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          service_id: string | null
          product_id: string | null
          participant_1: string
          participant_2: string
          status: 'pending' | 'active' | 'declined' | 'completed'
          initiated_by: string | null
          offerer_service_id: string | null
          last_message: string | null
          last_message_at: string | null
          last_sender_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id?: string | null
          product_id?: string | null
          participant_1: string
          participant_2: string
          status?: 'pending' | 'active' | 'declined' | 'completed'
          initiated_by?: string | null
          offerer_service_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          last_sender_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string | null
          product_id?: string | null
          participant_1?: string
          participant_2?: string
          status?: 'pending' | 'active' | 'declined' | 'completed'
          initiated_by?: string | null
          offerer_service_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          last_sender_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          service_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          service_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          service_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          chat_id: string
          service_id: string | null
          participant_1: string
          participant_2: string
          closed_by: string
          outcome: 'completed' | 'partial' | 'cancelled'
          closed_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          service_id?: string | null
          participant_1: string
          participant_2: string
          closed_by: string
          outcome: 'completed' | 'partial' | 'cancelled'
          closed_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          service_id?: string | null
          participant_1?: string
          participant_2?: string
          closed_by?: string
          outcome?: 'completed' | 'partial' | 'cancelled'
          closed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
