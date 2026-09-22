import { ComplaintToResolution } from '@/components/home/ComplaintToResolution'
import { HeroSection } from '@/components/home/HeroSection'
import { Navbar } from '@/components/layout/Navbar'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <ComplaintToResolution />
    </div>
  )
}

export default HomePage