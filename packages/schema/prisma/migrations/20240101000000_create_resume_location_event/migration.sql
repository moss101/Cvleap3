-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('view', 'download');

-- CreateTable
CREATE TABLE "resume_location_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resume_id" UUID NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "city" VARCHAR(64),
    "lat" DECIMAL(6,3) NOT NULL,
    "lon" DECIMAL(6,3) NOT NULL,
    "event_type" "EventType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_location_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_location_event_resume_id_created_at_idx" ON "resume_location_event"("resume_id", "created_at");

-- CreateIndex
CREATE INDEX "resume_location_event_country_code_idx" ON "resume_location_event"("country_code");

-- AddForeignKey (Optional, if you have a resumes table and want to enforce FK constraints)
-- ALTER TABLE "resume_location_event" ADD CONSTRAINT "resume_location_event_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Note: The above FK assumes a 'resumes' table with an 'id' column. Adjust if your resume table is named differently or you don't want an FK.
-- For the ENUM, if it's shared with other tables (like the existing resume_analytics),
-- it might already exist. Prisma would handle this, or the SQL would need an `IF NOT EXISTS` clause,
-- but for a migration script, defining it like this is usually fine; Prisma manages the schema state.
-- If 'EventType' enum is already defined by another migration (e.g. for resume_analytics),
-- the CREATE TYPE "EventType" line should be removed from this file.
-- I will assume it might be new or managed by Prisma's understanding of the schema.
-- The spec mentioned ENUM(view, download) for event_type.
-- Prisma typically handles enum creation. If you define it in your schema.prisma, `prisma migrate dev` generates this.
-- For a raw SQL migration like this, it's good to be explicit.
-- Let's assume EventType might be new for this table or should be explicitly part of this migration.
-- If it causes issues, it means it's already defined globally for the DB.
-- The problem statement implies this is a new table, so defining the ENUM is safer.
-- Re-checked the spec: event_type ENUM(view, download). This SQL reflects that.
-- Precision for lat/lon DECIMAL(6,3) means numbers like 123.456. Total 6 digits, 3 after decimal.
-- This seems reasonable for rounded coordinates. Max value would be 999.999. Min -999.999.
-- Standard lat (-90 to 90) and lon (-180 to 180) fit this.
-- Using TIMESTAMPTZ(6) for created_at for consistency with potential Prisma defaults.
-- gen_random_uuid() is a PostgreSQL function. If using another DB, this might need to change (e.g. UUID() for MySQL).
-- Assuming PostgreSQL based on TIMESTAMPTZ and gen_random_uuid().
