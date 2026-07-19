import { SignIn } from "@clerk/clerk-react";

export const LoginView = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Argyle <span className="text-healthcare-teal">CRM</span>
        </h1>
        <p className="text-slate-400">Authorized Personnel Only</p>
      </div>

      {/* Clerk Component with Dark Mode styling */}
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: '#00B5B5', // healthcare-teal
            colorBackground: '#131825', // slate-900
            colorText: 'white',
            colorInputBackground: '#0B0F19',
            colorInputText: 'white',
          }
        }} 
      />
    </div>
  );
};
