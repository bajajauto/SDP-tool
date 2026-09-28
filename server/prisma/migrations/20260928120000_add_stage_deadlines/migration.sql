CREATE TABLE "stage_deadlines" (
    "stage_deadline_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deadline" DATE NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "stage_deadlines_pkey" PRIMARY KEY ("stage_deadline_id")
);

CREATE UNIQUE INDEX "stage_deadlines_cycle_id_bu_sort_order_key" ON "stage_deadlines"("cycle_id", "bu", "sort_order");
CREATE INDEX "stage_deadlines_cycle_id_bu_idx" ON "stage_deadlines"("cycle_id", "bu");
ALTER TABLE "stage_deadlines" ADD CONSTRAINT "stage_deadlines_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;
