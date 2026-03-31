/*
  Warnings:

  - You are about to drop the column `last_seen_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `conversation_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "message_statuses" DROP CONSTRAINT "message_statuses_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_statuses" DROP CONSTRAINT "message_statuses_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_reply_to_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "last_seen_at";

-- DropTable
DROP TABLE "conversation_members";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "message_statuses";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "ConversationType";

-- DropEnum
DROP TYPE "MemberRole";

-- DropEnum
DROP TYPE "MessageStatusEnum";
