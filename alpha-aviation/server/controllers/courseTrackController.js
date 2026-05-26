const CourseTrack = require("../models/CourseTrack");
const User = require("../models/User");
const { enrichTracks, initializeCourseTracks } = require("../utils/courseTrackService");

// ─── Student: get own course tracks ───────────────────────────────────────────

exports.getMyCourseTracks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let tracks = await CourseTrack.find({ student: userId }).sort({ startDate: 1 });

    // ——— Legacy backfill: Paid student with no tracks yet ———
    // Covers students who were already Paid before this tracking system existed.
    if (tracks.length === 0) {
      const student = await User.findById(userId);
      if (student && student.paymentStatus === "Paid" && student.courseSelections?.length > 0) {
        await initializeCourseTracks(student);
        tracks = await CourseTrack.find({ student: userId }).sort({ startDate: 1 });
      }
    }

    const enriched = enrichTracks(tracks);

    // Auto-expire tracks where endDate has passed
    const now = new Date();
    const expiredIds = tracks
      .filter((t) => t.status === "active" && new Date(t.endDate) < now)
      .map((t) => t._id);
    if (expiredIds.length > 0) {
      await CourseTrack.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "expired" } },
      );
    }

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: { tracks: enriched },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: get one student's course tracks ────────────────────────────────────

exports.getStudentCourseTracks = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select(
      "_id role paymentStatus courseSelections paymentConfirmedAt createdAt",
    );
    if (!student || student.role !== "student") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    let tracks = await CourseTrack.find({ student: studentId }).sort({ startDate: 1 });

    // ——— Legacy backfill: Paid student with no tracks yet ———
    if (tracks.length === 0 && student.paymentStatus === "Paid" && student.courseSelections?.length > 0) {
      await initializeCourseTracks(student);
      tracks = await CourseTrack.find({ student: studentId }).sort({ startDate: 1 });
    }
    const enriched = enrichTracks(tracks);

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: { tracks: enriched },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: update weekly progress for a single track ─────────────────────────

exports.updateWeekProgress = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const { week1Progress, week2Progress, week3Progress, week4Progress } =
      req.body;

    const track = await CourseTrack.findById(trackId);
    if (!track) {
      return res
        .status(404)
        .json({ success: false, message: "Course track not found" });
    }

    // Only update the fields that were supplied
    if (week1Progress !== undefined)
      track.week1Progress = Math.min(100, Math.max(0, Number(week1Progress)));
    if (week2Progress !== undefined)
      track.week2Progress = Math.min(100, Math.max(0, Number(week2Progress)));
    if (week3Progress !== undefined)
      track.week3Progress = Math.min(100, Math.max(0, Number(week3Progress)));
    if (week4Progress !== undefined)
      track.week4Progress = Math.min(100, Math.max(0, Number(week4Progress)));

    // Recompute overall
    const avg = Math.round(
      (track.week1Progress +
        track.week2Progress +
        track.week3Progress +
        track.week4Progress) /
        4,
    );
    track.overallProgress = avg;

    // Auto-complete when all weeks hit 100
    if (avg >= 100 && track.status === "active") {
      track.status = "completed";
      track.completedAt = new Date();
    }

    await track.save();

    const [enriched] = enrichTracks([track]);

    res.status(200).json({
      success: true,
      message: "Progress updated",
      data: { track: enriched },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: aggregate course tracking stats for dashboard ─────────────────────

exports.getCourseTrackStats = async (req, res, next) => {
  try {
    if (global.useMockData) {
      return res.status(200).json({
        success: true,
        data: {
          activeTracks: 0,
          completedTracks: 0,
          expiringThisWeek: 0,
          avgProgressAll: 0,
        },
      });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [activeTracks, completedTracks, expiringThisWeek, progressAgg] =
      await Promise.all([
        CourseTrack.countDocuments({ status: "active" }),
        CourseTrack.countDocuments({ status: "completed" }),
        CourseTrack.countDocuments({
          status: "active",
          endDate: { $gte: now, $lte: sevenDaysFromNow },
        }),
        CourseTrack.aggregate([
          { $match: { status: "active" } },
          { $group: { _id: null, avg: { $avg: "$overallProgress" } } },
        ]),
      ]);

    const avgProgressAll = progressAgg.length
      ? Math.round(progressAgg[0].avg)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        activeTracks,
        completedTracks,
        expiringThisWeek,
        avgProgressAll,
      },
    });
  } catch (error) {
    next(error);
  }
};
