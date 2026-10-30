CREATE TABLE "heights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"height_cm" numeric(4, 1) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "heights_value_range" CHECK ("heights"."height_cm" between 20 and 150)
);
--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "birth_height_cm" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "heights" ADD CONSTRAINT "heights_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "heights_child_measured_idx" ON "heights" USING btree ("child_id","measured_at");--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_birth_height_range" CHECK ("children"."birth_height_cm" between 20 and 70);