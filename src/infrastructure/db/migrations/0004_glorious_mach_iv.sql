CREATE TYPE "public"."service_category" AS ENUM('nails', 'eyebrows');--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DEFAULT 'nails'::"public"."service_category";--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE "public"."service_category" USING "category"::"public"."service_category";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category" "service_category" DEFAULT 'nails' NOT NULL;