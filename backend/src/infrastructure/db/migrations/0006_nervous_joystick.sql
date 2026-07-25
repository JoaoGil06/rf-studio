CREATE TYPE "public"."discount_reason" AS ENUM('loyalty', 'birthday');--> statement-breakpoint
CREATE TABLE "schedule_discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" "discount_reason" NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_discounts_schedule_id_unique" UNIQUE("schedule_id")
);
--> statement-breakpoint
ALTER TABLE "schedule_discounts" ADD CONSTRAINT "schedule_discounts_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_discounts" ADD CONSTRAINT "schedule_discounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;