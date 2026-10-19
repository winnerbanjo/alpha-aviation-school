import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, BookOpen } from 'lucide-react'
import { COURSE_CATALOG } from '@/data/courseCatalog'
import { openResourceInBrowser } from '@/lib/openResource'

interface CourseResource {
  courseTitle: string
  files: {
    name: string
    type: string
    size: string
    url: string
  }[]
}

// Configure your PDF URLs here - point to any external storage (S3, Cloudinary, Google Drive, etc.)
const courseResources: CourseResource[] = COURSE_CATALOG.map(course => ({
  courseTitle: course.title,
  files: [
    {
      name: `${course.title} - Course Outline`,
      type: 'PDF',
      size: '1.5 MB',
      url: `https://storage.yourdomain.com/courses/${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/course-outline.pdf`
    },
    {
      name: `${course.title} - Module 1`,
      type: 'PDF',
      size: '2.3 MB',
      url: `https://storage.yourdomain.com/courses/${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/module-1.pdf`
    },
    {
      name: `${course.title} - Module 2`,
      type: 'PDF',
      size: '2.1 MB',
      url: `https://storage.yourdomain.com/courses/${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/module-2.pdf`
    },
    {
      name: `${course.title} - Study Guide`,
      type: 'PDF',
      size: '3.2 MB',
      url: `https://storage.yourdomain.com/courses/${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/study-guide.pdf`
    }
  ]
}))

export function ResourceLibrary() {
  const handleDownload = (file: { name: string; url: string }) => {
    if (!file.url || file.url.includes('yourdomain.com')) {
      console.log(`PDF not yet uploaded: ${file.name}`)
      alert(`PDF for "${file.name}" is not yet available. Please check back later.`)
      return
    }

    openResourceInBrowser(file.url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-8"
    >
      <div>
        <span className="eyebrow text-[#1246C8]">Library</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          Resource Library
        </h1>
        <p className="mt-2 text-[#53647C]">
          Access course materials, study guides, and external resources.
        </p>
      </div>

      {courseResources.map((course, courseIndex) => (
        <motion.div
          key={courseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: courseIndex * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-lg font-bold tracking-tight text-[#10264B]">
              {course.courseTitle}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:ml-12">
            {course.files.map((file, fileIndex) => (
              <motion.div
                key={fileIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (courseIndex * 0.1) + (fileIndex * 0.05) }}
              >
                <Card
                  className="cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
                  onClick={() => handleDownload(file)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#1246C8] ring-1 ring-[#DCE2EB]">
                        <FileText className="w-[18px] h-[18px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[#10264B]">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#1246C8]">{file.type}</span>
                          <span className="text-xs text-[#8C9AB0]">•</span>
                          <span className="text-xs text-[#53647C] tabular-nums">{file.size}</span>
                        </div>
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#10264B]/15 text-[#10264B] transition-colors group-hover:border-[#1246C8] group-hover:text-[#1246C8]">
                        <Download className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
