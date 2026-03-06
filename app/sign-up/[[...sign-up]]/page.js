import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="w-full max-w-md">
        <SignUp 
          path="/sign-up" 
          routing="path"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-slate-900/80 backdrop-blur border border-slate-700 shadow-2xl',
            }
          }}
        />
      </div>
    </div>
  );
}
