-- CreateTable
CREATE TABLE "ats_score_snapshot" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ats_score_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ats_score_snapshot_resume_id_idx" ON "ats_score_snapshot"("resume_id");

-- CreateIndex
CREATE INDEX "ats_score_snapshot_created_at_idx" ON "ats_score_snapshot"("created_at");

-- AddForeignKey
ALTER TABLE "ats_score_snapshot" ADD CONSTRAINT "ats_score_snapshot_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
