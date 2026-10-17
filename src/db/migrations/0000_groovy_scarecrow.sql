CREATE TYPE "public"."gearSystem" AS ENUM('internal', 'external', 'fixie');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unisex');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('city', 'gravel', 'electric', 'BMX', 'hybrid', 'mountain', 'road', 'fatbike', 'kids', 'cargo');--> statement-breakpoint
CREATE TYPE "public"."theft_status" AS ENUM('active', 'recovered', 'resolved');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bicycle" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"make" text NOT NULL,
	"model" text,
	"serial_number" text NOT NULL,
	"image_urls" text[],
	"type" "type",
	"wheel_size" varchar,
	"weight" integer,
	"gear_system" "gearSystem",
	"num_gears" integer,
	"gender" "gender",
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bicycle_id" text NOT NULL,
	"is_for_sale" boolean DEFAULT false,
	"price" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_at" timestamp with time zone,
	CONSTRAINT "price_check1" CHECK ("listing"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "theft" (
	"id" text PRIMARY KEY NOT NULL,
	"bicycle_id" text NOT NULL,
	"status" "theft_status" DEFAULT 'active' NOT NULL,
	"published_at" timestamp with time zone,
	"stolen_on" date,
	"location" text,
	"description" text,
	"contact" text,
	"contact_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bicycle" ADD CONSTRAINT "bicycle_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_bicycle_id_bicycle_id_fk" FOREIGN KEY ("bicycle_id") REFERENCES "public"."bicycle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theft" ADD CONSTRAINT "theft_bicycle_id_bicycle_id_fk" FOREIGN KEY ("bicycle_id") REFERENCES "public"."bicycle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bicycle_serial_make_model_idx" ON "bicycle" USING btree (lower(trim("serial_number")),lower(trim("make")),coalesce(lower(trim("model")), '')) WHERE "bicycle"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "theft_bicycle_active_idx" ON "theft" USING btree ("bicycle_id") WHERE "theft"."status" = 'active' and "theft"."deleted_at" is null;