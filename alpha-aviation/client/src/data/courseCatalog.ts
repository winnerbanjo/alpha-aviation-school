export const COURSE_CATALOG = [
  { title: 'Airline Cabin Crew Training', price: 350000 },
  { title: 'Airline Customer Service', price: 180000 },
  { title: 'Airport Operations Fundamental', price: 220000 },
  { title: 'Cargo Introductory Course', price: 200000 },
  { title: 'Foundation in Travel & Tourism with Galileo', price: 300000 },
  { title: 'Air Ticketing & Reservation Management', price: 250000 },
  { title: 'Customer Service & Communication in Aviation', price: 150000 },
  { title: 'Hospitality & Tourism Management', price: 210000 },
  { title: 'Travel Agency Operations', price: 190000 },
  { title: 'Visa Processing & Documentation', price: 160000 },
  { title: 'Hotel & Front Office Management', price: 175000 },
  { title: 'Tourism Marketing & Entrepreneurship', price: 195000 },
] as const

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount || 0)
