import { SignIn } from "@clerk/clerk-react";

export const LoginView = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Argyle <span className="text-healthcare-teal">CRM</span>
        </h1>
      </div>

      {/* Clerk Component with Premium Dark Mode styling */}
      <SignIn 
        appearance={{
          elements: {
            footer: "hidden", // Completely hides "Sign Up", "Secured by Clerk", and "Development Mode"
            card: "bg-[#131825] shadow-2xl border border-white/5",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border-white/10 text-white",
            socialButtonsBlockButtonText: "text-white font-medium",
            formButtonPrimary: "bg-healthcare-teal hover:bg-[#009b9b] text-white",
            formFieldLabel: "text-slate-300",
            formFieldInput: "bg-[#0B0F19] border-white/10 text-white focus:border-healthcare-teal",
            dividerLine: "bg-white/10",
            dividerText: "text-slate-500",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-healthcare-teal hover:text-[#009b9b]",
            formResendCodeLink: "text-healthcare-teal hover:text-[#009b9b]",
            socialButtonsProviderIcon: "invert grayscale transition-all hover:grayscale-0",
          },
          variables: {
            colorPrimary: '#00B5B5', // healthcare-teal
            colorBackground: '#131825',
            colorText: 'white',
            colorInputBackground: '#0B0F19',
            colorInputText: 'white',
          }
        }} 
      />
    </div>
  );
};
