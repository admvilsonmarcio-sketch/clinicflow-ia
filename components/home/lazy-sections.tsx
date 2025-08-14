'use client'

import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Lazy load das seções não críticas
const TestimonialsSection = lazy(() => import('./testimonials-section'))
const BenefitsSection = lazy(() => import('./benefits-section'))
const UrgencyCTASection = lazy(() => import('./urgency-cta-section'))

// Skeleton para loading
const SectionSkeleton = () => (
  <div className="animate-pulse py-16">
    <div className="container mx-auto px-4">
      <div className="mx-auto mb-4 h-8 w-64 rounded bg-gray-200"></div>
      <div className="mx-auto mb-8 h-4 w-96 rounded bg-gray-200"></div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  </div>
)

export function LazySections() {
  return (
    <>
      {/* Benefits Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <BenefitsSection />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      {/* Urgency CTA Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <UrgencyCTASection />
      </Suspense>
    </>
  )
}

export default LazySections