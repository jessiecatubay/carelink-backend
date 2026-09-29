import { prisma } from "../src/lib/prisma";

async function main() {
  const action = process.argv[2]; // 'list', 'delete', 'wipe'
  const email = process.argv[3];

  if (!action || action === "list") {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n📋 Found ${users.length} user(s):`);
    console.table(users);
    return;
  }

  if (action === "delete") {
    if (!email) {
      console.error("❌ Please provide the email of the user to delete. Example:");
      console.error("   npx tsx scripts/manage-users.ts delete user@example.com");
      return;
    }

    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }

    // Delete related profile records
    await prisma.emergencyContact.deleteMany({
      where: { patientProfileId: user.id },
    });
    await prisma.patientProfile.deleteMany({
      where: { userId: user.id },
    });
    await prisma.nonPatientProfile.deleteMany({
      where: { userId: user.id },
    });
    await prisma.pillReminder.deleteMany({
      where: { OR: [{ patientId: user.id }, { createdById: user.id }] },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`✅ Successfully deleted user: ${email} (${user.id})`);
    return;
  }

  if (action === "wipe" || action === "delete-all") {
    await prisma.emergencyContact.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.nonPatientProfile.deleteMany();
    await prisma.pillReminder.deleteMany();
    await prisma.commands.deleteMany();
    await prisma.patientNonPatient.deleteMany();
    await prisma.pushToken.deleteMany();
    await prisma.token.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ All users and related data have been wiped from the database.");
    return;
  }

  console.log("Usage:");
  console.log("  npx tsx scripts/manage-users.ts list");
  console.log("  npx tsx scripts/manage-users.ts delete <email>");
  console.log("  npx tsx scripts/manage-users.ts wipe");
}

main()
  .catch((err) => {
    console.error("Error managing users:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
