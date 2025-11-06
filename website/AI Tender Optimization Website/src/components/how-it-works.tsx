import { Badge } from "./ui/badge";
import { Upload, Cpu, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Tender Documents",
    description: "Simply upload your tender documents or connect to tender portals. Our AI instantly processes all requirements.",
    number: "01",
  },
  {
    icon: Cpu,
    title: "AI Analysis & Optimization",
    description: "Our AI analyzes requirements, suggests optimal responses, and identifies winning strategies based on historical data.",
    number: "02",
  },
  {
    icon: CheckCircle2,
    title: "Submit Winning Bids",
    description: "Review AI-optimized bids, make final adjustments, and submit with confidence. Track all submissions in one dashboard.",
    number: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 mb-4">
            Simple Process
          </Badge>
          <h2 className="text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform your tender process
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" style={{ top: '80px' }}></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-purple-500 to-pink-500' :
                      'from-green-500 to-emerald-500'
                    }`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-5xl opacity-10">{step.number}</span>
                  </div>
                  <h3 className="text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
