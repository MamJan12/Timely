import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SCHOOLS = [
  { name: 'School of Engineering and Technology', abbreviation: 'SET' },
  { name: 'School of Health Science',            abbreviation: 'HS'  },
  { name: 'School of Management Science',        abbreviation: 'MGT' },
  { name: 'School of Agriculture',               abbreviation: 'AGT' },
  { name: 'School of Education',                 abbreviation: 'EDC' },
];

async function main() {
  console.log('Seeding database...');

  // ── Schools ────────────────────────────────────────────────────────────────
  for (const s of SCHOOLS) {
    await prisma.school.upsert({
      where: { abbreviation: s.abbreviation },
      update: {},
      create: s,
    });
  }
  console.log(`Created ${SCHOOLS.length} schools`);

  const setSchool = await prisma.school.findUnique({ where: { abbreviation: 'SET' } });

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@timely.edu' },
    update: {},
    create: {
      email:    'admin@timely.edu',
      password: adminPassword,
      role:     'ADMIN',
      admin: {
        create: {
          firstName: 'Super',
          lastName:  'Admin',
        },
      },
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // ── Demo Department ────────────────────────────────────────────────────────
  const dept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: { schoolId: setSchool?.id },
    create: {
      name:        'Computer Science',
      code:        'CS',
      schoolId:    setSchool?.id,
      programType: 'UNDERGRADUATE',
    },
  });
  console.log(`Department: ${dept.name}`);

  // ── Demo Lecturer ──────────────────────────────────────────────────────────
  const lecPassword = await bcrypt.hash('lecturer123', 10);
  const lec = await prisma.user.upsert({
    where: { email: 'lecturer@timely.edu' },
    update: {},
    create: {
      email:    'lecturer@timely.edu',
      password: lecPassword,
      role:     'LECTURER',
      lecturer: {
        create: {
          firstName:    'James',
          lastName:     'Brown',
          staffId:      'STF001',
          departmentId: dept.id,
        },
      },
    },
  });
  console.log(`Lecturer created: ${lec.email}`);

  // ── Demo Student ───────────────────────────────────────────────────────────
  const stuPassword = await bcrypt.hash('student123', 10);
  const stu = await prisma.user.upsert({
    where: { email: 'student@timely.edu' },
    update: {},
    create: {
      email:    'student@timely.edu',
      password: stuPassword,
      role:     'STUDENT',
      student: {
        create: {
          firstName:    'Alice',
          lastName:     'Smith',
          studentId:    'STU001',
          departmentId: dept.id,
          level:        'L300',
        },
      },
    },
  });
  console.log(`Student created: ${stu.email}`);

  console.log('\nSeed complete. Login credentials:');
  console.log('  Admin:    admin@timely.edu    / admin123');
  console.log('  Lecturer: lecturer@timely.edu / lecturer123');
  console.log('  Student:  student@timely.edu  / student123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
