// Mock data for local development only
// DO NOT use in production - these are for testing only

const mockStudents = [
  {
    _id: 'mock-student-1',
    email: 'student1@alpha.com',
    firstName: 'John',
    lastName: 'Doe',
    enrolledCourse: 'Aviation Fundamentals & Strategy',
    paymentStatus: 'Pending',
    amountDue: 5000,
    amountPaid: 0,
    enrollmentDate: new Date('2024-01-15'),
    phone: '+2341234567890'
  },
  {
    _id: 'mock-student-2',
    email: 'student2@alpha.com',
    firstName: 'Jane',
    lastName: 'Smith',
    enrolledCourse: 'Elite Cabin Crew & Safety Operations',
    paymentStatus: 'Pending',
    amountDue: 7500,
    amountPaid: 0,
    enrollmentDate: new Date('2024-01-20'),
    phone: '+2341234567891'
  },
  {
    _id: 'mock-student-3',
    email: 'student3@alpha.com',
    firstName: 'Michael',
    lastName: 'Johnson',
    enrolledCourse: 'Travel & Tourism Management',
    paymentStatus: 'Paid',
    amountDue: 0,
    amountPaid: 6000,
    enrollmentDate: new Date('2024-01-10'),
    phone: '+2341234567892'
  },
  {
    _id: 'mock-student-4',
    email: 'student4@alpha.com',
    firstName: 'Sarah',
    lastName: 'Williams',
    enrolledCourse: 'Airline Customer Service & Passenger Handling',
    paymentStatus: 'Pending',
    amountDue: 5500,
    amountPaid: 0,
    enrollmentDate: new Date('2024-01-25'),
    phone: '+2341234567893'
  },
  {
    _id: 'mock-student-5',
    email: 'student5@alpha.com',
    firstName: 'David',
    lastName: 'Brown',
    enrolledCourse: 'Aviation Safety & Security Awareness',
    paymentStatus: 'Paid',
    amountDue: 0,
    amountPaid: 7000,
    enrollmentDate: new Date('2024-01-05'),
    phone: '+2341234567894'
  }
];

// Mock admin - NOT used in production
// Mock admin credentials must be set via environment variables if mock mode is enabled
const getMockAdmin = () => ({
  _id: 'mock-admin',
  email: process.env.ADMIN_EMAIL || 'admin@localhost',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  paymentStatus: 'Paid',
  amountDue: 0,
  amountPaid: 0
});

const getMockFinancialStats = () => {
  const totalRevenue = mockStudents
    .filter((s) => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + s.amountPaid, 0);

  const revenuePending = mockStudents
    .filter((s) => s.paymentStatus === 'Pending')
    .reduce((sum, s) => sum + s.amountDue, 0);

  return { totalRevenue, revenuePending };
};

module.exports = {
  mockStudents,
  getMockAdmin,
  getMockFinancialStats
};