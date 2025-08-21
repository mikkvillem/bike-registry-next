CREATE TYPE "public"."gearSystem" AS ENUM('internal', 'external', 'fixie');--> statement-breakpoint
ALTER TYPE "public"."type" ADD VALUE 'fatbike';--> statement-breakpoint
ALTER TYPE "public"."type" ADD VALUE 'kids';--> statement-breakpoint
ALTER TYPE "public"."type" ADD VALUE 'cargo';--> statement-breakpoint
ALTER TABLE "bicycle" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."gender";--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unisex');--> statement-breakpoint
ALTER TABLE "bicycle" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "price_check1" CHECK ("listing"."price" > 0);