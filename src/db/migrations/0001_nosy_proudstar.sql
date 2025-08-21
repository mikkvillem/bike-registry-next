DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unisex');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('city', 'gravel', 'electric', 'BMX', 'hybrid', 'mountain', 'road');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bicycle" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "type",
	"wheel_size" varchar,
	"weight" integer,
	"num_gears" integer,
	"gender" "gender",
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"deactive_from" timestamp with time zone,
	"stolen_at" timestamp with time zone,
	"for_sale_from" timestamp with time zone
);
