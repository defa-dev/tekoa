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
  created_by: string | null
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
  accepts_tekoins: boolean
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
  last_sender_id: string | null
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
  product_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export type TradeOutcome = 'completed' | 'partial' | 'cancelled'

export type Trade = {
  id: string
  chat_id: string
  service_id: string | null
  product_id: string | null
  participant_1: string
  participant_2: string
  closed_by: string
  outcome: TradeOutcome
  closed_at: string
}

export type TekoinTransactionType =
  | 'earned_rating'
  | 'earned_aviso'
  | 'admin_adjustment'
  | 'spent_highlight'
  | 'spent_priority'
  | 'donated_feira'
  | 'earned_mutirao_base'
export type TekoinReferenceType = 'trade' | 'aviso' | 'service' | 'product' | 'mutirao'

export type TekoinTransaction = {
  id: string
  user_id: string
  counterparty_id: string | null
  amount: number
  type: TekoinTransactionType
  reference_type: TekoinReferenceType | null
  reference_id: string | null
  created_at: string
}

export type TekoinBoostKind = 'highlight' | 'priority'

export type TekoinBoost = {
  id: string
  user_id: string
  service_id: string | null
  product_id: string | null
  kind: TekoinBoostKind
  expires_at: string
  created_at: string
}

export type TekoinBadge = {
  id: string
  user_id: string
  badge_code: string
  earned_at: string
}

export type CommunityAdmin = {
  id: string
  community_id: string
  user_id: string
  assigned_by: string | null
  created_at: string
}

export type CommunityFund = {
  community_id: string
  balance: number
}

export type CommunityFundTransactionType = 'mutirao_extra' | 'admin_topup'

export type CommunityFundTransaction = {
  id: string
  community_id: string
  amount: number
  type: CommunityFundTransactionType
  reference_id: string | null
  created_at: string
}

export type MutiraoStatus = 'open' | 'confirmed' | 'completed' | 'cancelled'

export type MutiraoRequest = {
  id: string
  organizer_id: string
  community_id: string | null
  title: string
  description: string
  location: string | null
  scheduled_at: string | null
  min_confirmations: number
  status: MutiraoStatus
  created_at: string
  completed_at: string | null
  /** Território informal do organizador (denormalizado) — diferente de `community_id`. */
  community: string | null
  reach: string
  reach_communities: string[]
}

export type MutiraoConfirmation = {
  id: string
  mutirao_id: string
  user_id: string
  confirmed_at: string
  attended: boolean | null
}

export type MutiraoMessage = {
  id: string
  mutirao_id: string
  sender_id: string
  content: string
  created_at: string
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  cover_image: string | null
  author_name: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export type BlogLink = {
  id: string
  title: string
  source: string
  url: string
  note: string | null
  added_by: string | null
  created_at: string
}
