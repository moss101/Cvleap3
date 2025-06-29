-- CreateTable
CREATE TABLE "resume_view_geo_data" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_view_geo_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_view_geo_data_resume_id_idx" ON "resume_view_geo_data"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_view_geo_data_resume_id_country_code_key" ON "resume_view_geo_data"("resume_id", "country_code");

-- AddForeignKey
ALTER TABLE "resume_view_geo_data" ADD CONSTRAINT "resume_view_geo_data_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
