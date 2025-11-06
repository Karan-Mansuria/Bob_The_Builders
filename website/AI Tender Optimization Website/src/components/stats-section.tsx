import { ImageWithFallback } from "./figma/ImageWithFallback";

export function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NjIyNDUyODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Professional Team"
              className="w-full h-auto"
            />
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of companies that have transformed their tender process with AI-powered optimization.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  70%
                </div>
                <p className="text-gray-600">Increase in win rate</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  10x
                </div>
                <p className="text-gray-600">Faster bid preparation</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-5xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  $2M+
                </div>
                <p className="text-gray-600">Average contract value won</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-5xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  500+
                </div>
                <p className="text-gray-600">Enterprise clients</p>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-sm">Trusted by 500+ companies</div>
                  <div className="text-sm text-gray-600">⭐⭐⭐⭐⭐ 4.9/5 average rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
