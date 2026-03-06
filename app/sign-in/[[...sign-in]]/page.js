import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="w-full max-w-md">
        <SignIn 
          path="/sign-in" 
          routing="path"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-300',
              socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              formFieldLabel: 'text-white',
              formFieldInput: 'bg-slate-800 border-slate-600 text-white',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-blue-400',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
        />
      </div>
    </div>
  );
}
