
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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          university: string | null
          location: string | null
          bio: string | null
          interests: string[] | null
          skills: string[] | null
          profile_image_url: string | null
          linkedin_url: string | null
          is_online: boolean
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          university?: string | null
          location?: string | null
          bio?: string | null
          interests?: string[] | null
          skills?: string[] | null
          profile_image_url?: string | null
          linkedin_url?: string | null
          is_online?: boolean
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          university?: string | null
          location?: string | null
          bio?: string | null
          interests?: string[] | null
          skills?: string[] | null
          profile_image_url?: string | null
          linkedin_url?: string | null
          is_online?: boolean
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          related_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          related_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          related_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      housing_listings: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          location: string
          price: number
          move_in_date: string | null
          bedrooms: number | null
          bathrooms: number | null
          image_urls: string[] | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          location: string
          price: number
          move_in_date?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          image_urls?: string[] | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          location?: string
          price?: number
          move_in_date?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          image_urls?: string[] | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      internships: {
        Row: {
          id: string
          company_name: string
          position: string
          description: string
          location: string
          application_deadline: string | null
          salary_range: string | null
          requirements: string[] | null
          application_link: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          position: string
          description: string
          location: string
          application_deadline?: string | null
          salary_range?: string | null
          requirements?: string[] | null
          application_link?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          position?: string
          description?: string
          location?: string
          application_deadline?: string | null
          salary_range?: string | null
          requirements?: string[] | null
          application_link?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_urls: string[] | null
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          image_urls?: string[] | null
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          image_urls?: string[] | null
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_internships: {
        Row: {
          id: string
          user_id: string
          internship_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          internship_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          internship_id?: string
          created_at?: string
        }
      }
    }
  }
}
