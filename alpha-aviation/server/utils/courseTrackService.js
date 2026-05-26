const CourseTrack = require("../models/CourseTrack");

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * Compute derived runtime fields for a single CourseTrack document.
 * These are never stored — they're attached at response-serialization time.
 */
function computeTrackMeta(track) {
  const now = new Date();
  const start = new Date(track.startDate);
  const end = new Date(track.endDate);

  const elapsedMs = Math.min(Math.max(now - start, 0), FOUR_WEEKS_MS);
  const daysRemaining = Math.max(0, Math.ceil((end - now) / 86400000));

  // currentWeek: 1–4 while active, 4 after expiry
  const rawWeek = Math.ceil(elapsedMs / (7 * 86400000));
  const currentWeek = Math.min(4, rawWeek || 1);

  // Auto time-progress: how much of the 28-day window has elapsed
  const timeProgress = Math.min(100, Math.round((elapsedMs / FOUR_WEEKS_MS) * 100));

  // Calculate each week's time-based progress (0 to 100)
  const msPerWeek = 7 * 86400000;
  const calcWeekTimeProgress = (weekIndex) => {
    const weekStartMs = weekIndex * msPerWeek;
    if (elapsedMs <= weekStartMs) return 0;
    if (elapsedMs >= weekStartMs + msPerWeek) return 100;
    return Math.round(((elapsedMs - weekStartMs) / msPerWeek) * 100);
  };

  const week1Progress = Math.max(track.week1Progress || 0, calcWeekTimeProgress(0));
  const week2Progress = Math.max(track.week2Progress || 0, calcWeekTimeProgress(1));
  const week3Progress = Math.max(track.week3Progress || 0, calcWeekTimeProgress(2));
  const week4Progress = Math.max(track.week4Progress || 0, calcWeekTimeProgress(3));

  const avgWeekProgress = Math.round((week1Progress + week2Progress + week3Progress + week4Progress) / 4);

  // Overall = the higher of: time elapsed (floor) vs entered average
  const overallProgress = Math.max(timeProgress, avgWeekProgress);

  return {
    daysRemaining,
    currentWeek,
    timeProgress,
    overallProgress,
    week1Progress,
    week2Progress,
    week3Progress,
    week4Progress,
  };
}

/**
 * Idempotent initialisation: create one CourseTrack per enrolled course.
 * Uses $setOnInsert — safe to call from any payment trigger point without
 * creating duplicates.
 *
 * Start date priority:
 *   1. student.paymentConfirmedAt  (new students — set at payment confirmation)
 *   2. student.createdAt           (legacy students — already Paid before tracking existed)
 *   3. new Date()                  (safety fallback)
 *
 * @param {import('../models/User')} student  - Full Mongoose User document
 */
async function initializeCourseTracks(student) {
  if (!Array.isArray(student.courseSelections) || student.courseSelections.length === 0) {
    return;
  }

  // Resolve the best available start date for the 4-week clock
  const startDate = student.paymentConfirmedAt
    ? new Date(student.paymentConfirmedAt)
    : student.createdAt
    ? new Date(student.createdAt)
    : new Date();

  const endDate = new Date(startDate.getTime() + FOUR_WEEKS_MS);

  const ops = student.courseSelections.map((course) => ({
    updateOne: {
      filter: { student: student._id, courseTitle: course.title },
      update: {
        $setOnInsert: {
          student: student._id,
          courseTitle: course.title,
          coursePrice: course.price || 0,
          startDate,
          endDate,
          week1Progress: 0,
          week2Progress: 0,
          week3Progress: 0,
          week4Progress: 0,
          overallProgress: 0,
          status: "active",
          completedAt: null,
        },
      },
      upsert: true,
    },
  }));

  await CourseTrack.bulkWrite(ops);
}

/**
 * Enrich an array of CourseTrack docs with computed meta fields.
 */
function enrichTracks(tracks) {
  return tracks.map((track) => {
    const plain = track.toObject ? track.toObject() : { ...track };
    const meta = computeTrackMeta(plain);
    return { ...plain, ...meta };
  });
}

module.exports = { initializeCourseTracks, computeTrackMeta, enrichTracks };
