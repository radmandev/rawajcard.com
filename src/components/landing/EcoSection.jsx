import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Check, TreePine } from 'lucide-react';

const features = [
{
  title: "1 Rawajcard = 1 Tree",
  description: "Every digital card helps reforest the planet, one connection at a time."
},
{
  title: "Ditch the Waste",
  description: "No more reprints. Your info is always up to date, zero paper wasted."
},
{
  title: "Built for the Long Haul",
  description: "Designed to last. Save trees and money with a reusable, modern networking tool."
}];


export default function EcoSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              Networking That Plants Trees{' '}
              <span className="text-green-600">(Soon)</span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-8">
              Every Rawajcard replaces 1,000 paper ones. We believe every connection should leave a lasting impression - not a footprint. That's why we've partnered with Tree-Nation to plant one tree for every Rawajcard product sold.
            </p>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) =>
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3">

                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">{feature.title}</span>
                    <span className="text-slate-600"> – {feature.description}</span>
                  </div>
                </motion.li>
              )}
            </ul>

            <div className="flex items-center gap-4 bg-green-100 rounded-xl p-4 mb-8">
              <TreePine className="w-8 h-8 text-green-600" />
              <span className="text-green-800 font-semibold">
                🌳 50,000+ trees planted so far - and counting.
              </span>
            </div>
            
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">

              See Our Forest
            </Button>
          </motion.div>
          
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative">

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-3xl transform rotate-3 scale-105" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-green-900/20">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop"
                  alt="Eco-friendly networking"
                  className="w-full h-auto" />

                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <img
                        src="https://tree-nation.com/images/svg/logo-tree-nation-blue.svg"
                        alt="Tree-Nation"
                        className="h-8 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="font-bold text-green-600">Tree-Nation</span>';
                        }} />

                    </div>
                    <div className="text-white">
                      <p className="font-bold text-lg">Official Partner</p>
                      <p className="text-white/80 text-sm">Planting trees together</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}