import { Card } from "./ui/card";
import { Brain, FileSearch, TrendingUp, Target, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze tender requirements and match them with your capabilities.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileSearch,
    title: "Smart Document Scanning",
    description: "Automatically extract key requirements, deadlines, and evaluation criteria from tender documents.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Win Rate Optimization",
    description: "Get real-time recommendations to improve your bid quality and increase winning probability.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Target,
    title: "Precision Targeting",
    description: "Identify the most suitable tenders based on your company profile and historical success.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description: "Process hundreds of tender documents in seconds and never miss a deadline.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Compliance Assurance",
    description: "Ensure every bid meets regulatory requirements and tender specifications automatically.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Winning Bids
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to streamline your tender process and maximize success rates
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-gray-200">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
