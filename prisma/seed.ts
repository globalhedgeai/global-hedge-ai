import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function makeReferralCode(prefix = "GH") {
  return (
    prefix +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}

async function main() {
  // 1) إنشاء/تثبيت Admin افتراضي
  const adminEmail = "admin@global-hedge.ai";
  const rawPassword = "Admin@123!"; // غيّرها بعد أول دخول
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      referralCode: makeReferralCode("ADMIN"),
    },
  });

  // 2) سياسات افتراضية
  const policies: Array<[string, string]> = [
    ["minWithdrawDaysFirst", "45"],
    ["intervalWithdrawDaysWeekly", "7"],
    ["intervalWithdrawDaysMonthly", "30"],
    ["maxWithdrawPercent", "35"],
    ["depositFee", "2"],
    ["withdrawFeeWeekly", "5"],
    ["withdrawFeeMonthly", "3"],
    ["baseMonthly", "25"],
    ["tier5", "30"],
    ["tier10", "35"],
    ["bonusChance", "5"],
    ["bonusAmount", "0.2"],
    ["companyWalletAddress", "TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"],
    ["defaultNetwork", "TRC20"],
  ];

  for (const [key, value] of policies) {
    await prisma.policy.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("✅ Seed done: admin + policies");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
