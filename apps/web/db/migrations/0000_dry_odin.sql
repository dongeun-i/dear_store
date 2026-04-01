CREATE TYPE "public"."product_status" AS ENUM('raw', 'edited', 'uploaded');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'running', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."qc_result" AS ENUM('pass', 'fail', 'pending');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('pending', 'live', 'paused', 'failed');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('smartstore', 'coupang', '11st');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ali_product_id" text NOT NULL,
	"title_original" text NOT NULL,
	"title_ko" text,
	"description_original" text,
	"description_ko" text,
	"original_price" numeric(12, 2),
	"currency" text DEFAULT 'CNY',
	"images" jsonb DEFAULT '[]'::jsonb,
	"options" jsonb DEFAULT '{}'::jsonb,
	"category_ali" text,
	"category_ko" text,
	"status" "product_status" DEFAULT 'raw' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_ali_product_id_unique" UNIQUE("ali_product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scrape_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"product_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qc_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"barcode" text,
	"template_id" uuid,
	"result" "qc_result" DEFAULT 'pending' NOT NULL,
	"checklist_results" jsonb DEFAULT '{}'::jsonb,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"inspected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qc_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_code" text NOT NULL,
	"name" text NOT NULL,
	"checklist" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "platform" NOT NULL,
	"credentials" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_credentials_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"external_id" text,
	"status" "listing_status" DEFAULT 'pending' NOT NULL,
	"listed_price" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" text NOT NULL,
	"rate" numeric(12, 6) NOT NULL,
	"spread" numeric(5, 4) DEFAULT '0.03' NOT NULL,
	"source" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
