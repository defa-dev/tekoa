// Export all types
export * from './database.types'

// Application-specific types
export type User = {
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

export type Community = {
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

export type Service = {
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
  user?: User
}

export type Product = {
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
  user?: User
}

export type MuralPost = {
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
  user?: User
}

export type ChatStatus = 'pending' | 'active' | 'declined' | 'completed'

export type Chat = {
  id: string
  service_id: string | null
  product_id: string | null
  participant_1: string
  participant_2: string
  status: ChatStatus
  initiated_by: string | null
  offerer_service_id: string | null
  last_message: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export type Rating = {
  id: string
  from_user_id: string
  to_user_id: string
  service_id: string | null
  rating: number
  comment: string | null
  created_at: string
}
