
import { Book, Search } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";

const Regulations = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Book className="h-6 w-6 text-military-gold" />
                <h1 className="text-3xl font-bold text-military-gold">
                  Army Regulations
                </h1>
              </div>
              <p className="text-military-muted">
                Browse through Army regulations or use the search to find specific topics.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <SearchBar />
              
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regulations.map((category) => (
                  <div
                    key={category.title}
                    className="p-4 rounded-lg border border-military-accent/20 hover:border-military-gold/50 transition-colors bg-white/5 backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-semibold text-military-gold mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-military-muted mb-4">
                      {category.description}
                    </p>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <a
                          key={item}
                          href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block text-sm text-military-text/80 hover:text-military-gold transition-colors"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const regulations = [
  {
    title: "Personnel",
    description: "Regulations governing personnel management and administration",
    items: [
      "AR 600-8-19 Promotions and Reductions",
      "AR 600-20 Army Command Policy",
      "AR 601-280 Army Retention Program",
    ],
  },
  {
    title: "Operations",
    description: "Regulations for military operations and training",
    items: [
      "AR 350-1 Army Training",
      "AR 385-10 Army Safety Program",
      "AR 525-13 Antiterrorism",
    ],
  },
  {
    title: "Supply & Logistics",
    description: "Regulations for logistics and supply chain management",
    items: [
      "AR 710-2 Supply Policy",
      "AR 735-5 Property Accountability",
      "AR 740-26 Physical Inventory Control",
    ],
  },
  {
    title: "Medical",
    description: "Healthcare and medical service regulations",
    items: [
      "AR 40-501 Medical Fitness Standards",
      "AR 40-562 Immunizations",
      "AR 40-66 Medical Record Administration",
    ],
  },
  {
    title: "Intelligence",
    description: "Intelligence operations and security regulations",
    items: [
      "AR 380-5 Information Security",
      "AR 381-12 Threat Awareness",
      "AR 381-20 Army CI Program",
    ],
  },
  {
    title: "Financial Management",
    description: "Regulations for financial operations and management",
    items: [
      "AR 37-47 Military Pay and Allowances",
      "AR 37-104-4 Military Pay",
      "AR 37-49 Budgeting Funds",
    ],
  },
];

export default Regulations;
