'use client'

// Subtle animated dot matrix background — reference: halftone dot pattern
// with a soft drifting mask that creates a wave/shimmer illusion.
// Used behind logo studio, processing, and brief pages.
export function DotGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Animated gradient mask creates the wave/drift effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #09090b 70%)',
          animation: 'dot-drift 12s ease-in-out infinite',
        }}
      />
    </div>
  )
}
