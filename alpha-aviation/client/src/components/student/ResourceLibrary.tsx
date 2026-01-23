import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'

interface Resource {
  name: string
  type: string
  size: string
}

const resources: Resource[] = [
  { name: 'Student Handbook 2024', type: 'PDF', size: '2.4 MB' },
  { name: 'Orientation Guide', type: 'PDF', size: '1.8 MB' },
  { name: 'Aviation Safety Guidelines', type: 'PDF', size: '3.1 MB' },
  { name: 'Flight Operations Manual', type: 'PDF', size: '4.2 MB' },
  { name: 'Emergency Procedures Handbook', type: 'PDF', size: '2.9 MB' },
  { name: 'Course Curriculum Overview', type: 'PDF', size: '1.2 MB' },
]

export function ResourceLibrary() {
  const handleDownload = (resource: Resource) => {
    // Create a download link (in production, this would point to actual file URLs)
    const link = document.createElement('a')
    link.href = `#` // Placeholder - in production, use actual file URL
    link.download = `${resource.name}.pdf`
    link.click()
    
    // Show feedback
    console.log(`Downloading ${resource.name}...`)
    // In production, you could show a toast notification here
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold tracking-tighter text-slate-900">
        Resource Library
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="border-slate-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => handleDownload(resource)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {resource.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{resource.type}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{resource.size}</span>
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
  )
}
