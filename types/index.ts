export type Round = {
  id: string
  prompt: string
  image_url: string | null
  winner_submission_id: string | null
  status: 'open' | 'closed'
  created_at: string
  closed_at: string | null
}

export type Submission = {
  id: string
  round_id: string
  prompt: string
  submitter_name: string
  created_at: string
  vote_count?: number
}

export type Vote = {
  id: string
  round_id: string
  submission_id: string
  voter_id: string
  created_at: string
}
