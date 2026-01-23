import { Users, FileText, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  type: 'students' | 'resources' | 'modules'
  message?: string
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const configs = {
    students: {
      icon: Users,
      title: 'No Students Found',
      description: message || 'There are no students enrolled yet. Students will appear here once they register.',
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-100'
    },
    resources: {
      icon: FileText,
      title: 'No Resources Available',
      description: message || 'Resources will be available here once they are uploaded.',
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-100'
    },
    modules: {
      icon: BookOpen,
      title: 'No Modules Available',
      description: message || 'Course modules will be displayed here.',
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-100'
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className={`p-6 ${config.bgColor} rounded-full mb-4`}>
        <Icon className={`w-12 h-12 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-md">
        {config.description}
      </p>
    </motion.div>
  )
}
