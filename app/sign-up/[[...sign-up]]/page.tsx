import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-4 pb-12">
      <SignUp />
    </div>
  )
}
