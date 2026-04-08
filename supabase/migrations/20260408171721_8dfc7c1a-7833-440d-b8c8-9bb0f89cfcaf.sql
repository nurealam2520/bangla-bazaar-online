UPDATE blog_posts 
SET cover_image = 'https://tbuyrfpzmwghiwapixym.supabase.co/storage/v1/object/public/site-images/' || REPLACE(cover_image, '/uploads/', '') 
WHERE cover_image LIKE '/uploads/%';

UPDATE site_content 
SET value = 'https://tbuyrfpzmwghiwapixym.supabase.co/storage/v1/object/public/site-images/' || REPLACE(value, '/uploads/', '') 
WHERE value LIKE '/uploads/%';

UPDATE products 
SET image = 'https://tbuyrfpzmwghiwapixym.supabase.co/storage/v1/object/public/site-images/' || REPLACE(image, '/uploads/', '') 
WHERE image LIKE '/uploads/%';