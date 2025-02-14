
import { Settings as SettingsIcon, CreditCard, User } from "lucide-react";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-military-gold flex items-center gap-2">
                  <SettingsIcon className="h-8 w-8" />
                  Settings
                </h1>
                <p className="text-military-muted">
                  Manage your account settings and subscription
                </p>
              </div>
              <SidebarTrigger />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="military-glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Account Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Email Address</h3>
                      <p className="text-military-muted">user@example.com</p>
                    </div>
                    <button className="text-military-gold hover:text-military-gold/80 transition">
                      Change Email
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Password</h3>
                      <p className="text-military-muted">Last changed 30 days ago</p>
                    </div>
                    <button className="text-military-gold hover:text-military-gold/80 transition">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="military-glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-military-gold flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </h2>
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-military-dark/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-military-text">Current Plan</h3>
                      <p className="text-military-muted">Free Tier</p>
                    </div>
                    <span className="px-3 py-1 bg-military-accent/20 text-military-gold rounded-full text-sm">
                      Active
                    </span>
                  </div>
                </div>
                <SubscriptionTiers />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
