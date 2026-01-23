import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { CheckCircle2, ArrowRight, CreditCard } from 'lucide-react'

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TopBar />
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-slate-200/50 text-center p-8 sm:p-12 bg-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-slate-900 mb-4">
              Welcome to Alpha Step Links!
            </h1>
            
            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
              Your registration was successful. You're one step away from starting your aviation journey.
            </p>

            <div className="space-y-6 text-left bg-slate-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold tracking-tighter text-slate-900 mb-4">
                Next Steps:
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0061FF] text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Complete Your Payment</p>
                    <p className="text-sm text-slate-500">
                      Review your billing information and complete the payment to unlock all course materials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0061FF] text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Upload Your ID/Passport</p>
                    <p className="text-sm text-slate-500">
                      Submit a photo of your ID or Passport for school records verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0061FF] text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Access Your Dashboard</p>
                    <p className="text-sm text-slate-500">
                      Once payment is confirmed, you'll have full access to your training materials and curriculum.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white px-8">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-slate-200/50 px-8"
                onClick={() => {
                  alert('Payment instructions will be shown in your dashboard')
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Payment Info
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
