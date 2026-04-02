-- CreateEnum
CREATE TYPE "MessageStatusType" AS ENUM ('PENDING', 'DELIVERED', 'READ');

-- CreateTable
CREATE TABLE "message_statuses" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "status_type" "MessageStatusType" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_statuses_message_id_recipient_id_key" ON "message_statuses"("message_id", "recipient_id");

-- AddForeignKey
ALTER TABLE "message_statuses" ADD CONSTRAINT "message_statuses_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_statuses" ADD CONSTRAINT "message_statuses_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
