-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "subscription_tier" TEXT NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "template_data" JSONB,
    "preview_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT,
    "title" TEXT,
    "content" JSONB,
    "settings" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAnalytics" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "visitor_ip" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_cache" (
    "id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "prompt" TEXT,
    "generated_content" TEXT,
    "content_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_content_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Resume_user_id_idx" ON "Resume"("user_id");

-- CreateIndex
CREATE INDEX "Resume_template_id_idx" ON "Resume"("template_id");

-- CreateIndex
CREATE INDEX "ResumeAnalytics_resume_id_idx" ON "ResumeAnalytics"("resume_id");

-- CreateIndex
CREATE INDEX "ResumeAnalytics_event_type_idx" ON "ResumeAnalytics"("event_type");

-- CreateIndex
CREATE INDEX "ResumeAnalytics_created_at_idx" ON "ResumeAnalytics"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_content_cache_content_hash_key" ON "ai_content_cache"("content_hash");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAnalytics" ADD CONSTRAINT "ResumeAnalytics_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
