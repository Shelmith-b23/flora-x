import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Star, Award, Compass, ArrowRight } from 'lucide-react';
import { MOCK_FLORISTS } from '../data';

export function Florists() {
  return (
    <div className="pt-24 pb-16 bg-canvas min-h-screen" id="florists-page">
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Banner Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-secondary font-display block mb-1">
            Flora_X Guild Directory
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-text-primary tracking-tight">
            Meet Our Master Florist Guild
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2">
            Every florist on Flora_X is strictly verified, using locally sourced blooms from Naivasha and Mount Kenya.
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_FLORISTS.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              onClick={() => { window.location.hash = `#/florist/${f.id}`; }}
              className="group bg-white rounded-xl border border-utility-border overflow-hidden cursor-pointer shadow-xs hover:shadow-[0_12px_32px_rgba(45,90,39,0.06)] hover:border-brand-primary/20 transition-all duration-300 flex flex-col justify-between"
              id={`florist-card-${f.id}`}
            >
              <div>
                {/* Banner */}
                <div className="h-36 bg-canvas relative overflow-hidden">
                  <img src={f.banner} alt="" className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-700" />
                  {f.verified && (
                    <div className="absolute top-3 left-3 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Verified Partner
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex gap-4 -mt-8 relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white bg-white shadow-md shrink-0">
                    <img src={f.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-8">
                    <h3 className="font-display font-semibold text-text-primary text-sm group-hover:text-brand-primary transition-colors flex items-center gap-1">
                      {f.name}
                    </h3>
                    <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                      {f.location}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 space-y-3">
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {f.about}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-text-muted pt-2">
                    <div className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-brand-primary" />
                      <span>{f.deliveryRadiusKm}km Delivery Radius</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{f.rating} ({f.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-utility-border bg-canvas flex items-center justify-between">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                  Min. Order: KES {f.minOrderValue.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary group-hover:underline">
                  Enter Store
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
