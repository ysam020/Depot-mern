/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_user_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_address" TEXT;

-- DropTable
DROP TABLE "public"."addresses";
