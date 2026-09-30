CREATE TABLE "cohorts" (
  "cohort_id" TEXT NOT NULL,
  "cycle_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cohorts_pkey" PRIMARY KEY ("cohort_id")
);
CREATE UNIQUE INDEX "cohorts_cycle_id_name_key" ON "cohorts"("cycle_id", "name");
CREATE INDEX "cohorts_cycle_id_idx" ON "cohorts"("cycle_id");
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stage_deadlines" ADD COLUMN "cohort_id" TEXT;
INSERT INTO "cohorts" ("cohort_id", "cycle_id", "name")
SELECT CONCAT(SUBSTRING(MD5("cycle_id" || ':' || "cohort_name"),1,8),'-',SUBSTRING(MD5("cycle_id" || ':' || "cohort_name"),9,4),'-',SUBSTRING(MD5("cycle_id" || ':' || "cohort_name"),13,4),'-',SUBSTRING(MD5("cycle_id" || ':' || "cohort_name"),17,4),'-',SUBSTRING(MD5("cycle_id" || ':' || "cohort_name"),21,12)), "cycle_id", "cohort_name"
FROM "stage_deadlines" GROUP BY "cycle_id", "cohort_name";
UPDATE "stage_deadlines" sd SET "cohort_id" = c."cohort_id" FROM "cohorts" c WHERE c."cycle_id" = sd."cycle_id" AND c."name" = sd."cohort_name";
ALTER TABLE "stage_deadlines" ALTER COLUMN "cohort_id" SET NOT NULL;
CREATE INDEX "stage_deadlines_cohort_id_idx" ON "stage_deadlines"("cohort_id");
ALTER TABLE "stage_deadlines" ADD CONSTRAINT "stage_deadlines_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("cohort_id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cohort_assignments" (
  "cohort_assignment_id" TEXT NOT NULL,
  "cohort_id" TEXT NOT NULL,
  "cycle_id" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cohort_assignments_pkey" PRIMARY KEY ("cohort_assignment_id")
);
INSERT INTO "cohort_assignments" ("cohort_assignment_id", "cohort_id", "cycle_id", "employee_id")
SELECT CONCAT(SUBSTRING(MD5(e."employee_id" || ':' || sd."cycle_id"),1,8),'-',SUBSTRING(MD5(e."employee_id" || ':' || sd."cycle_id"),9,4),'-',SUBSTRING(MD5(e."employee_id" || ':' || sd."cycle_id"),13,4),'-',SUBSTRING(MD5(e."employee_id" || ':' || sd."cycle_id"),17,4),'-',SUBSTRING(MD5(e."employee_id" || ':' || sd."cycle_id"),21,12)), MIN(sd."cohort_id"), sd."cycle_id", e."employee_id"
FROM "employees" e JOIN "stage_deadlines" sd ON sd."bu" = e."bu" WHERE e."is_active" = true GROUP BY e."employee_id", sd."cycle_id";
CREATE UNIQUE INDEX "cohort_assignments_employee_id_cycle_id_key" ON "cohort_assignments"("employee_id", "cycle_id");
CREATE INDEX "cohort_assignments_cohort_id_idx" ON "cohort_assignments"("cohort_id");
ALTER TABLE "cohort_assignments" ADD CONSTRAINT "cohort_assignments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("cohort_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cohort_assignments" ADD CONSTRAINT "cohort_assignments_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cohort_assignments" ADD CONSTRAINT "cohort_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sdps" ADD COLUMN "cohort_id" TEXT;
UPDATE "sdps" s SET "cohort_id" = ca."cohort_id" FROM "cohort_assignments" ca WHERE ca."employee_id" = s."employee_id" AND ca."cycle_id" = s."cycle_id";
CREATE INDEX "sdps_cohort_id_idx" ON "sdps"("cohort_id");
ALTER TABLE "sdps" ADD CONSTRAINT "sdps_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("cohort_id") ON DELETE SET NULL ON UPDATE CASCADE;
