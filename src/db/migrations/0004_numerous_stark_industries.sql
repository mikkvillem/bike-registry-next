CREATE TABLE IF NOT EXISTS "theft" (
	"id" text PRIMARY KEY NOT NULL,
	"bicycle_id" text NOT NULL,
	"description" text,
	"contact" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active_until" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bicycle" RENAME COLUMN "deactive_from" TO "active_until";--> statement-breakpoint
ALTER TABLE "bicycle" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bicycle" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "theft" ADD CONSTRAINT "theft_bicycle_id_bicycle_id_fk" FOREIGN KEY ("bicycle_id") REFERENCES "public"."bicycle"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_idx" ON "user" USING btree ("email");