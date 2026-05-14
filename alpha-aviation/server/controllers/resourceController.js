const CourseResource = require("../models/CourseResource");
const User = require("../models/User");
const { COURSE_CATALOG } = require("../utils/courseCatalog");

const validCourseTitles = new Set(COURSE_CATALOG.map((course) => course.title));

const normalizeResource = (resource) => ({
  _id: resource._id,
  courseTitle: resource.courseTitle,
  title: resource.title,
  description: resource.description || "",
  type: resource.type || "other",
  size: resource.size || "",
  url: resource.url,
  isActive: resource.isActive,
  createdAt: resource.createdAt,
  updatedAt: resource.updatedAt,
});

exports.getAdminResources = async (req, res, next) => {
  try {
    const resources = await CourseResource.find()
      .sort({ courseTitle: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: { resources: resources.map(normalizeResource) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const { courseTitle, title, description, type, size, url } = req.body;

    if (!courseTitle || !title || !url) {
      return res.status(400).json({
        success: false,
        message: "Course, title, and file URL are required",
      });
    }

    if (!validCourseTitles.has(courseTitle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course selected",
      });
    }

    const resource = await CourseResource.create({
      courseTitle,
      title,
      description,
      type,
      size,
      url,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      data: { resource: normalizeResource(resource) },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await CourseResource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentResources = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.userId).lean();

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const selectedCourseTitles =
      Array.isArray(student.courseSelections) && student.courseSelections.length > 0
        ? student.courseSelections.map((course) => course.title).filter(Boolean)
        : student.selectedCourses || [];

    const resources = await CourseResource.find({
      courseTitle: { $in: selectedCourseTitles },
      isActive: true,
    })
      .sort({ courseTitle: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: {
        selectedCourseTitles,
        resources: resources.map(normalizeResource),
      },
    });
  } catch (error) {
    next(error);
  }
};
