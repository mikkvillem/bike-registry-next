ALTER TYPE "gender" ADD VALUE 'kids';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bicycle_id" text NOT NULL,
	"is_for_sale" boolean DEFAULT false,
	"price" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bicycle" RENAME COLUMN "active_until" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "theft" RENAME COLUMN "active_until" TO "deleted_at";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing" ADD CONSTRAINT "listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing" ADD CONSTRAINT "listing_bicycle_id_bicycle_id_fk" FOREIGN KEY ("bicycle_id") REFERENCES "public"."bicycle"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bicycle" DROP COLUMN IF EXISTS "stolen_at";--> statement-breakpoint
ALTER TABLE "bicycle" DROP COLUMN IF EXISTS "for_sale_from";