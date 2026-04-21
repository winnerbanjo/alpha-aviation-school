const COURSE_CATALOG = [
  { title: "Air Ticketing & Reservation Management", price: 150000 },
  { title: "Customer Service & Communication in Aviation", price: 150000 },
  { title: "Hospitality & Tourism Management", price: 150000 },
  { title: "Travel Agency Operations", price: 150000 },
  { title: "Visa Processing & Documentation", price: 150000 },
  { title: "Hotel & Front Office Management", price: 150000 },
  { title: "Tourism Marketing & Entrepreneurship", price: 150000 },
];

const BUNDLE_4_PRICE = 538000;

const getCoursePriceMap = () =>
  COURSE_CATALOG.reduce((acc, course) => {
    acc[course.title] = course.price;
    return acc;
  }, {});

const buildCourseSelections = (selectedCourses = []) => {
  const coursePriceMap = getCoursePriceMap();
  return selectedCourses
    .filter((course) => typeof course === "string" && coursePriceMap[course])
    .map((course) => ({
      title: course,
      price: coursePriceMap[course],
    }));
};

const getTotalCoursePrice = (courseSelections = []) => {
  if (courseSelections.length === 4) return BUNDLE_4_PRICE;
  return courseSelections.reduce((sum, course) => sum + (course.price || 0), 0);
};

module.exports = {
  COURSE_CATALOG,
  BUNDLE_4_PRICE,
  buildCourseSelections,
  getTotalCoursePrice,
};
