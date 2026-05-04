
ALTER TABLE public.lost_found_items
  ADD COLUMN IF NOT EXISTS verification_question text;

ALTER TABLE public.lost_found_claims
  ADD COLUMN IF NOT EXISTS verification_answer text;

-- Allow finders (item owners) to read claims on their items (already present, but ensure)
-- Already covered by existing policy "Claimer and item owner can read claims"

-- Allow item owners to update their own items (already present via "Users can update own items")
-- Allow item owners to update claim status (already present via "Item owner can update claim status")
