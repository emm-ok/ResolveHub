
import { seedCompanyRoles } from "../src/services/company-role.service.ts"
import { seedCompanySLAPolicies } from "../src/services/sla-policy.service.ts"

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "../src/config/env.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: env.DATABASE_URL,
    }),
    log: ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// const companies = [
//     {
//         name: "Acme Support Services",
//         slug: "acme-support",
//         email: "support@acme.example",
//         phone: "+2348011111111",
//         website: "https://acme.example",
//         description: "General customer support and complaint resolution.",
//         city: "Lagos",
//         state: "Lagos",
//         country: "Nigeria",
//         timezone: "Africa/Lagos",
//         publicIntakeEnabled: true,
//     },
//     {
//         name: "NovaTech Solutions",
//         slug: "novatech",
//         email: "help@novatech.example",
//         phone: "+2348022222222",
//         website: "https://novatech.example",
//         description: "Technology product and service support.",
//         city: "Abuja",
//         state: "FCT",
//         country: "Nigeria",
//         timezone: "Africa/Lagos",
//         publicIntakeEnabled: true,
//     },
//     {
//         name: "FreshMart Retail",
//         slug: "freshmart",
//         email: "care@freshmart.example",
//         phone: "+2348033333333",
//         website: "https://freshmart.example",
//         description: "Retail orders, billing, and refund requests.",
//         city: "Port Harcourt",
//         state: "Rivers",
//         country: "Nigeria",
//         timezone: "Africa/Lagos",
//         publicIntakeEnabled: true,
//     },
//     {
//         name: "Swift Logistics",
//         slug: "swift-logistics",
//         email: "support@swiftlogistics.example",
//         phone: "+2348044444444",
//         website: "https://swiftlogistics.example",
//         description: "Delivery, shipment, and logistics complaints.",
//         city: "Ibadan",
//         state: "Oyo",
//         country: "Nigeria",
//         timezone: "Africa/Lagos",
//         publicIntakeEnabled: true,
//     },
//     {
//         name: "Bright Finance",
//         slug: "bright-finance",
//         email: "help@brightfinance.example",
//         phone: "+2348055555555",
//         website: "https://brightfinance.example",
//         description: "Account, billing, and financial service enquiries.",
//         city: "Enugu",
//         state: "Enugu",
//         country: "Nigeria",
//         timezone: "Africa/Lagos",
//         publicIntakeEnabled: true,
//     },
// ];

// async function main() {
//     const permissionCount = await prisma.permission.count();

//     if (permissionCount === 0) {
//         throw new Error(
//             "No permissions found. Run the existing permission seed first.",
//         );
//     }

//     const creator = await prisma.user.findFirst();
//     if (!creator) {
//         throw new Error("No users found. Run the user seed before seeding companies.");
//     }

//     for (const data of companies) {
//         const company = await prisma.company.upsert({
//             where: { slug: data.slug },
//             update: {
//                 name: data.name,
//                 email: data.email,
//                 phone: data.phone,
//                 website: data.website,
//                 description: data.description,
//                 city: data.city,
//                 state: data.state,
//                 country: data.country,
//                 timezone: data.timezone,
//                 publicIntakeEnabled: data.publicIntakeEnabled,
//             },
//             create: {
//                 ...data,
//                 createdBy: { connect: { id: creator.id } },
//             },
//         });

//         await seedCompanyRoles(company.id);
//         await seedCompanySLAPolicies(company.id);

//         console.log(
//             `Seeded company: ${company.name} | slug=${company.slug} | id=${company.id}`,
//         );
//     }

//     console.log("ResolveHub company seeding completed.");
// }

// main()
//     .catch((error) => {
//         console.error("Company seeding failed:", error);
//         process.exitCode = 1;
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });



const seedCompanyMember = async() => {
    const member = await prisma.companyMember.create({
        data: {
            companyId: "6f9f0cdd-54f0-48c1-88db-ec46f9483b93",
            userId: "3c0d5845-065d-404a-8ca4-072998aac9c6",
            roleId: "17d9f2b8-c7f7-4331-b0cd-d361a45a536d"
        }
    })

    console.log("Comapny member created successfully")
}

seedCompanyMember()
    .catch((error) => {
        console.error("CompanyMember seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
