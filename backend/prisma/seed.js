const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@haqms.com' },
    update: {},
    create: {
      email: 'admin@haqms.com',
      password: passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const receptionistUser = await prisma.user.upsert({
    where: { email: 'reception1@haqms.com' },
    update: {},
    create: {
      email: 'reception1@haqms.com',
      password: passwordHash,
      name: 'Front Desk Reception',
      role: 'RECEPTIONIST',
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor1@haqms.com' },
    update: {},
    create: {
      email: 'doctor1@haqms.com',
      password: passwordHash,
      name: 'Dr. John Smith',
      role: 'DOCTOR',
    },
  });

  // Doctor Profile
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      name: 'Dr. John Smith',
      specialization: 'Cardiology',
      department: 'Cardiology',
      availableFrom: '09:00',
      availableTo: '17:00',
      consultationFee: 150.0,
      experience: 15,
    }
  });

  // Dummy Patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      phoneNumber: '555-0199',
      age: 35,
      gender: 'Male',
    }
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phoneNumber: '555-0200',
      age: 33,
      gender: 'Male',
      medicalHistory: 'Mild kryptonite allergy'
    }
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
