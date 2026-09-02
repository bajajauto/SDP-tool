-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "SdpStatus" AS ENUM ('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'CONVERSATION_CONFIRMED', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "SharingScope" AS ENUM ('FULL', 'GOALS_ONLY');

-- CreateEnum
CREATE TYPE "GoalDomain" AS ENUM ('FUNCTIONAL', 'BEHAVIOURAL', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "CheckInPeriod" AS ENUM ('Q1', 'MID_YEAR', 'Q2', 'YEAR_END');

-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'ACHIEVED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('PLAN', 'MID_YEAR', 'YEAR_END');

-- CreateEnum
CREATE TYPE "SupportNeedStatus" AS ENUM ('OPEN', 'ACTIONED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'MANAGER', 'BUHR', 'TD_ADMIN');

-- CreateEnum
CREATE TYPE "TemplateScope" AS ENUM ('SYSTEM_DEFAULT', 'TD_ADMIN', 'BUHR');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('STARTED', 'COMPLETED', 'FAILED', 'ABORTED');

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "manager_employee_id" TEXT,
    "manager_email" TEXT,
    "buhr_employee_id" TEXT,
    "buhr_email" TEXT,
    "bu" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bu_head_employee_id" TEXT,
    "hire_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sync_gaps" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "role_grants" (
    "employee_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "role_grants_pkey" PRIMARY KEY ("employee_id","role")
);

-- CreateTable
CREATE TABLE "cycles" (
    "cycle_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "hire_date_cutoff" DATE NOT NULL,
    "q1_window_start" DATE NOT NULL,
    "q1_window_end" DATE NOT NULL,
    "mid_year_cutoff" DATE NOT NULL,
    "q2_window_start" DATE NOT NULL,
    "q2_window_end" DATE NOT NULL,
    "year_end_cutoff" DATE NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'DRAFT',
    "is_reopened" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("cycle_id")
);

-- CreateTable
CREATE TABLE "sdps" (
    "sdp_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "status" "SdpStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "sharing_scope" "SharingScope",
    "submitted_at" TIMESTAMP(3),
    "conversation_confirmed_at" TIMESTAMP(3),
    "manager_employee_id_snapshot" TEXT,
    "last_saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sdps_pkey" PRIMARY KEY ("sdp_id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "sdp_id" TEXT NOT NULL,
    "q1_words" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "q1_text" TEXT,
    "q2_text" TEXT NOT NULL DEFAULT '',
    "q3_text" TEXT NOT NULL DEFAULT '',
    "q4_text" TEXT NOT NULL DEFAULT '',
    "q5_text" TEXT NOT NULL DEFAULT '',
    "q6_text" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("sdp_id")
);

-- CreateTable
CREATE TABLE "goals" (
    "goal_id" TEXT NOT NULL,
    "sdp_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "domain" "GoalDomain" NOT NULL DEFAULT 'FUNCTIONAL',
    "why_it_matters" TEXT NOT NULL DEFAULT '',
    "grown_when" TEXT NOT NULL DEFAULT '',
    "action_do" TEXT NOT NULL DEFAULT '',
    "action_learn" TEXT NOT NULL DEFAULT '',
    "action_connect" TEXT NOT NULL DEFAULT '',
    "support_needed" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "check_in_id" TEXT NOT NULL,
    "sdp_id" TEXT NOT NULL,
    "goal_id" TEXT,
    "period" "CheckInPeriod" NOT NULL,
    "progress_note" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("check_in_id")
);

-- CreateTable
CREATE TABLE "manager_feedback" (
    "feedback_id" TEXT NOT NULL,
    "sdp_id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "author_employee_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "shared_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "support_needs" (
    "support_need_id" TEXT NOT NULL,
    "sdp_id" TEXT NOT NULL,
    "goal_id" TEXT,
    "body" TEXT NOT NULL,
    "status" "SupportNeedStatus" NOT NULL DEFAULT 'OPEN',
    "actioned_by" TEXT,
    "actioned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_needs_pkey" PRIMARY KEY ("support_need_id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "entry_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "template_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" "TemplateScope" NOT NULL,
    "bu_id" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "email_log" (
    "email_id" TEXT NOT NULL,
    "template_key" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sdp_id" TEXT,
    "triggered_by" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "provider_message_id" TEXT,
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_log_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "audit_id" TEXT NOT NULL,
    "actor_employee_id" TEXT,
    "actor_role" "Role",
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "subject_employee_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "sync_runs" (
    "sync_run_id" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'STARTED',
    "source_count" INTEGER,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "deactivated_count" INTEGER NOT NULL DEFAULT 0,
    "flagged_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("sync_run_id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "announcement_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "leader_samples" (
    "sample_id" TEXT NOT NULL,
    "leader_name" TEXT NOT NULL,
    "leader_designation" TEXT NOT NULL,
    "bu" TEXT,
    "content_html" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "leader_samples_pkey" PRIMARY KEY ("sample_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_manager_employee_id_idx" ON "employees"("manager_employee_id");

-- CreateIndex
CREATE INDEX "employees_buhr_employee_id_bu_idx" ON "employees"("buhr_employee_id", "bu");

-- CreateIndex
CREATE INDEX "employees_is_active_bu_department_idx" ON "employees"("is_active", "bu", "department");

-- CreateIndex
CREATE UNIQUE INDEX "cycles_label_key" ON "cycles"("label");

-- CreateIndex
CREATE INDEX "cycles_status_idx" ON "cycles"("status");

-- CreateIndex
CREATE INDEX "sdps_cycle_id_status_idx" ON "sdps"("cycle_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sdps_employee_id_cycle_id_key" ON "sdps"("employee_id", "cycle_id");

-- CreateIndex
CREATE INDEX "goals_sdp_id_idx" ON "goals"("sdp_id");

-- CreateIndex
CREATE UNIQUE INDEX "goals_sdp_id_sort_order_key" ON "goals"("sdp_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_sdp_id_goal_id_period_key" ON "check_ins"("sdp_id", "goal_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "manager_feedback_sdp_id_type_key" ON "manager_feedback"("sdp_id", "type");

-- CreateIndex
CREATE INDEX "support_needs_sdp_id_status_idx" ON "support_needs"("sdp_id", "status");

-- CreateIndex
CREATE INDEX "journal_entries_employee_id_deleted_at_created_at_idx" ON "journal_entries"("employee_id", "deleted_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_key_scope_bu_id_key" ON "email_templates"("key", "scope", "bu_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_log_idempotency_key_key" ON "email_log"("idempotency_key");

-- CreateIndex
CREATE INDEX "email_log_status_created_at_idx" ON "email_log"("status", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_action_created_at_idx" ON "audit_log"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_subject_employee_id_created_at_idx" ON "audit_log"("subject_employee_id", "created_at");

-- CreateIndex
CREATE INDEX "sync_runs_started_at_idx" ON "sync_runs"("started_at");

-- CreateIndex
CREATE INDEX "leader_samples_bu_is_published_sort_order_idx" ON "leader_samples"("bu", "is_published", "sort_order");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_employee_id_fkey" FOREIGN KEY ("manager_employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_buhr_employee_id_fkey" FOREIGN KEY ("buhr_employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_grants" ADD CONSTRAINT "role_grants_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdps" ADD CONSTRAINT "sdps_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdps" ADD CONSTRAINT "sdps_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("cycle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("goal_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_feedback" ADD CONSTRAINT "manager_feedback_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_feedback" ADD CONSTRAINT "manager_feedback_author_employee_id_fkey" FOREIGN KEY ("author_employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_needs" ADD CONSTRAINT "support_needs_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_needs" ADD CONSTRAINT "support_needs_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("goal_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_needs" ADD CONSTRAINT "support_needs_actioned_by_fkey" FOREIGN KEY ("actioned_by") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_sdp_id_fkey" FOREIGN KEY ("sdp_id") REFERENCES "sdps"("sdp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_employee_id_fkey" FOREIGN KEY ("actor_employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_subject_employee_id_fkey" FOREIGN KEY ("subject_employee_id") REFERENCES "employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
