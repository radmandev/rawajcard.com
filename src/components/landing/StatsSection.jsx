import React, { useState, useEffect, useRef } from 'react';

const stats = [
  { value: 118410, label: "Users", suffix: "+" },
  { value: 592, label: "Companies", suffix: "+" },
  { value: 53, label: "Countries", suffix: "+" },
  { value: 29603, label: "Trees Planted", suffix: "+" }
];

function AnimatedCounter({ value, suffix, inView }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, inView]);
  
  return (
    <span>
      {count.toLocaleString()}
      <span className="text-teal-500">{suffix}</span>
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-4">
          <span className="text-teal-400 text-sm font-semibold tracking-wider uppercase">Why Rawajcard</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          The Future of Networking
        </h2>
        
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
              </div>
              <p className="text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Video placeholder */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 aspect-video bg-slate-800 group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=675&fit=crop"
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-teal-600 border-b-8 border-b-transparent ml-1" 
                  style={{ borderLeftWidth: '16px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}