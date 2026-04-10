-- Public read access for completed playbooks (shareable links)
-- UUIDs are unguessable (128-bit random), and only Variant B
-- (sanitized prompts with placeholder keys) is stored.
CREATE POLICY "Anyone can view completed playbooks by id"
  ON public.playbooks FOR SELECT
  USING (status = 'completed');
