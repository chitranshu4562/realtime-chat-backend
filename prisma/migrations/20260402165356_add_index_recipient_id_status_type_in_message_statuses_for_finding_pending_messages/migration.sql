-- CreateIndex
CREATE INDEX "message_statuses_recipient_id_status_type_idx" ON "message_statuses"("recipient_id", "status_type");
