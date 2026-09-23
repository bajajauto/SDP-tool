ALTER TABLE "employees"
ADD COLUMN "job_level" TEXT,
ADD COLUMN "position_level" TEXT,
ADD COLUMN "company" TEXT,
ADD COLUMN "sector" TEXT,
ADD COLUMN "base_location" TEXT,
ADD COLUMN "circle" TEXT,
ADD COLUMN "ro" TEXT,
ADD COLUMN "hub" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "top_potential" BOOLEAN;

CREATE INDEX "employees_bu_head_employee_id_idx" ON "employees"("bu_head_employee_id");

ALTER TABLE "employees"
ADD CONSTRAINT "employees_bu_head_employee_id_fkey"
FOREIGN KEY ("bu_head_employee_id") REFERENCES "employees"("employee_id")
ON DELETE SET NULL ON UPDATE CASCADE;
