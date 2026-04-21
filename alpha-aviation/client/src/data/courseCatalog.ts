export const COURSE_CATALOG = [
  { title: "Air Ticketing & Reservation Management", price: 150000 },
  { title: "Customer Service & Communication in Aviation", price: 150000 },
  { title: "Hospitality & Tourism Management", price: 150000 },
  { title: "Travel Agency Operations", price: 150000 },
  { title: "Visa Processing & Documentation", price: 150000 },
  { title: "Hotel & Front Office Management", price: 150000 },
  { title: "Tourism Marketing & Entrepreneurship", price: 150000 },
] as const;

/** 4-course international internship bundle price */
export const BUNDLE_4_PRICE = 538000;

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Compute the actual price due based on selection count */
export const computeEnrollmentPrice = (count: number): number => {
  if (count === 4) return BUNDLE_4_PRICE;
  return count * 150000;
};
