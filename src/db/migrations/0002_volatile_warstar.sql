ALTER TABLE "bicycle" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "bicycle" ADD COLUMN "image_url" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bicycle" ADD CONSTRAINT "bicycle_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
