-- Optional industry tags on products (slugs of Industry records; may be empty).
-- IF NOT EXISTS keeps this safe on databases already synced with `prisma db push`.

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "industrySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
