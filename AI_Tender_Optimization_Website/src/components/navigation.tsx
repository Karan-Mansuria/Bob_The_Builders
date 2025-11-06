import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md z-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">TenderAI Pro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hover:text-orange-600">Sign In</Button>
            <Button className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
