CREATE TYPE "public"."breast_side" AS ENUM('left', 'right', 'both');--> statement-breakpoint
CREATE TYPE "public"."feeding_type" AS ENUM('breast', 'formula', 'pumped');--> statement-breakpoint
CREATE TYPE "public"."temperature_site" AS ENUM('armpit', 'rectal', 'ear', 'forehead', 'mouth');--> statement-breakpoint
CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"birth_date" timestamp with time zone NOT NULL,
	"birth_weight_grams" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "children_birth_weight_positive" CHECK ("children"."birth_weight_grams" > 0)
);
--> statement-breakpoint
CREATE TABLE "feedings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"type" "feeding_type" NOT NULL,
	"breast_side" "breast_side",
	"volume_ml" integer,
	"duration_min" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedings_breast_side_only_for_breast" CHECK (("feedings"."type" = 'breast') = ("feedings"."breast_side" is not null)),
	CONSTRAINT "feedings_volume_positive" CHECK ("feedings"."volume_ml" > 0),
	CONSTRAINT "feedings_duration_positive" CHECK ("feedings"."duration_min" > 0)
);
--> statement-breakpoint
CREATE TABLE "temperatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"value_celsius" numeric(3, 1) NOT NULL,
	"site" "temperature_site" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "temperatures_value_range" CHECK ("temperatures"."value_celsius" between 30 and 45)
);
--> statement-breakpoint
CREATE TABLE "weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"weight_grams" integer NOT NULL,
	"before_feeding" boolean DEFAULT false NOT NULL,
	"after_feeding" boolean DEFAULT false NOT NULL,
	"fresh_diaper" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weights_not_before_and_after" CHECK (not ("weights"."before_feeding" and "weights"."after_feeding")),
	CONSTRAINT "weights_positive" CHECK ("weights"."weight_grams" > 0)
);
--> statement-breakpoint
ALTER TABLE "feedings" ADD CONSTRAINT "feedings_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temperatures" ADD CONSTRAINT "temperatures_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weights" ADD CONSTRAINT "weights_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedings_child_started_idx" ON "feedings" USING btree ("child_id","started_at");--> statement-breakpoint
CREATE INDEX "temperatures_child_measured_idx" ON "temperatures" USING btree ("child_id","measured_at");--> statement-breakpoint
CREATE INDEX "weights_child_measured_idx" ON "weights" USING btree ("child_id","measured_at");