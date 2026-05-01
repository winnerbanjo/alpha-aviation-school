import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, BookOpen } from 'lucide-react'
import { COURSE_CATALOG } from '@/data/courseCatalog'

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
    
    const link = document.createElement('a')
    link.href = file.url
    link.download = `${file.name}.pdf`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold tracking-tighter text-slate-900">
        Course Resources
      </h3>
      
      {courseResources.map((course, courseIndex) => (
        <motion.div
          key={courseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: courseIndex * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0061FF]" />
            <h4 className="text-lg font-semibold text-slate-800">
              {course.courseTitle}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ml-7">
            {course.files.map((file, fileIndex) => (
              <motion.div
                key={fileIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (courseIndex * 0.1) + (fileIndex * 0.05) }}
              >
                <Card 
                  className="border-slate-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleDownload(file)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{file.type}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{file.size}</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-[#0061FF] group-hover:scale-110 transition-all flex-shrink-0" />
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
