/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_created_by_id_fkey";

-- DropTable
DROP TABLE "Conversation";

-- DropEnum
DROP TYPE "ConversationType";
