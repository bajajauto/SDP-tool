CREATE TABLE "cohort_configs" (
    "cohort_config_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dc_type" TEXT NOT NULL,
    "event_start" DATE NOT NULL,
    "event_end" DATE NOT NULL,
    "participant_file_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cohort_configs_pkey" PRIMARY KEY ("cohort_config_id")
);
CREATE UNIQUE INDEX "cohort_configs_cycle_id_bu_key" ON "cohort_configs"("cycle_id", "bu");
ALTER TABLE "cohort_configs" ADD CONSTRAINT "cohort_configs_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;
