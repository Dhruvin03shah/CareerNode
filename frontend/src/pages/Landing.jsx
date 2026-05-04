import HeroSection from "../components/landing/HeroSection"
import SocialProof from "../components/landing/SocialProof"
import Features from "../components/landing/Features"
import HowItWorks from "../components/landing/HowItWorks"
import DemoPreview from "../components/landing/DemoPreview"
import AnalyticsPreview from "../components/landing/AnalyticsPreview"
import Comparison from "../components/landing/Comparison"
import CTASection from "../components/landing/CTASection"
import LandingFooter from "../components/landing/Footer"

export default function Landing() {
  return (
    <div className="text-foreground selection:bg-blue-500/30">
      {/* 
        Scene3D and Sidebar already provided by AppLayout.
        This page only needs to compose the landing sections.
      */}
      <HeroSection />
      <SocialProof />
      <Features />
      <HowItWorks />
      <DemoPreview />
      <AnalyticsPreview />
      <Comparison />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
