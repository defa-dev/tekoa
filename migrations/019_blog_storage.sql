-- Bucket de Storage para capas de posts do blog.
-- Escrita restrita a admin (current_user_is_admin(), de 002_admin.sql) —
-- mesmo padrão de blog_posts/blog_links: leitura pública, edição editorial.

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;
CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog');

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog'
    AND public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog'
    AND public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog'
    AND public.current_user_is_admin()
  );
