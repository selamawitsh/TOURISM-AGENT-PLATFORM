'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, MapPin, Star, Shield, Compass, Clock, MessageCircle, X, Sparkles, Languages, Heart, ChevronRight } from 'lucide-react';

const guides = [
  {
    id: 1,
    name: 'Abebe Kebede',
    role: 'Historical Expert',
    specialty: 'Ancient Civilizations & Rock-Hewn Churches',
    experience: '15+ years',
    languages: ['Amharic', 'English', 'French'],
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    bio: 'A passionate historian with deep knowledge of Ethiopia\'s ancient kingdoms, from the Aksumite Empire to the rock-hewn churches of Lalibela. Abebe brings 2,000 years of history to life with captivating storytelling.',
    color: 'from-amber-500 to-orange-500',
    icon: Award,
    quotes: ['Ethiopia has 13 months of sunshine - each one reveals new history'],
    tours: ['Lalibela Pilgrimage', 'Aksum Expedition', 'Gondar Castles'],
  },
  {
    id: 2,
    name: 'Tigist Haile',
    role: 'Adventure Leader',
    specialty: 'Mountain Trekking & Wildlife Safaris',
    experience: '12+ years',
    languages: ['Amharic', 'English', 'Italian'],
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
    bio: 'An experienced mountaineer who has summited Ras Dashen multiple times. Tigist leads treks through the Simien and Bale Mountains, sharing her knowledge of endemic wildlife including the Ethiopian wolf and Gelada baboon.',
    color: 'from-emerald-500 to-teal-500',
    icon: Compass,
    quotes: ['The mountain doesn\'t care how experienced you are - it only respects those who respect it'],
    tours: ['Simien Mountains Trek', 'Bale Mountains Safari', 'Danakil Expedition'],
  },
  {
    id: 3,
    name: 'Mohammed Ali',
    role: 'Cultural Ambassador',
    specialty: 'Tribal Communities & Traditional Life',
    experience: '18+ years',
    languages: ['Amharic', 'English', 'Arabic', 'Mursi'],
    rating: 5.0,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600',
    bio: 'Born in the Omo Valley, Mohammed bridges visitors with Ethiopia\'s diverse tribal communities. His respectful approach has earned trust across Hamar, Mursi, Karo, and Dassanech villages, offering authentic cultural exchanges.',
    color: 'from-purple-500 to-pink-500',
    icon: Heart,
    quotes: ['Travel is not about seeing new places - it is about seeing with new eyes'],
    tours: ['Omo Valley Cultural Tour', 'Hamar Bull Jumping', 'Karo Body Painting'],
  },
  {
    id: 4,
    name: 'Sara Tesfaye',
    role: 'Heritage Specialist',
    specialty: 'Religious Sites & Pilgrimage Routes',
    experience: '10+ years',
    languages: ['Amharic', 'English', 'Hebrew'],
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=600',
    bio: 'A theology graduate who specializes in Ethiopia\'s deep Christian, Islamic, and Jewish heritage. Sara guides pilgrims through ancient monasteries, mosques, and the hidden sites of the Ark of the Covenant traditions.',
    color: 'from-blue-500 to-cyan-500',
    icon: Shield,
    quotes: ['Faith carved into stone lasts for millennia'],
    tours: ['Lalibela Churches', 'Harar Jugol', 'Lake Tana Monasteries'],
  },
];

export default function GuidesPage() {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-emerald-900/70 via-emerald-800/50 to-emerald-900/80" />
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600"
          alt="Ethiopian guide"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white px-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm">Your Journey Companions</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-4">Local Guides</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Travel with locals who know every hidden gem, every story, and every path
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { count: '50+', label: 'Expert Guides' },
              { count: '15+', label: 'Languages' },
              { count: '10K+', label: 'Happy Travelers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-amber-400">{stat.count}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcf9f4] to-transparent z-20" />
      </section>

      {/* Guides Grid */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelected(guide)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col sm:flex-row">
                  {/* Guide Image */}
                  <div className="relative sm:w-48 h-56 sm:h-auto overflow-hidden">
                    <img
                      src={guide.image}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute top-3 left-3 p-2 rounded-xl bg-gradient-to-br ${guide.color} shadow-lg`}>
                      <guide.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Guide Info */}
                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{guide.name}</h3>
                        <p className="text-sm text-emerald-600 font-medium">{guide.role}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-amber-700">{guide.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-3"><span className="font-medium text-gray-700">Specialty:</span> {guide.specialty}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{guide.experience}</span>
                      <span className="flex items-center gap-1"><Languages className="h-3.5 w-3.5" />{guide.languages.length} languages</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{guide.reviews} reviews</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-emerald-600 text-sm font-medium group-hover:text-emerald-700">
                      View Profile <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56 overflow-hidden rounded-t-3xl">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50">
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-white/80">{selected.role}</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-gray-700 leading-relaxed">{selected.bio}</p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-amber-50 rounded-xl p-3">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-700">{selected.rating}</p>
                    <p className="text-xs text-gray-500">{selected.reviews} reviews</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <Award className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-emerald-700">{selected.experience}</p>
                    <p className="text-xs text-gray-500">Experience</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <Languages className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-blue-700">{selected.languages.join(', ')}</p>
                    <p className="text-xs text-gray-500">Languages</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Popular Tours</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.tours.map((tour: string) => (
                      <span key={tour} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">{tour}</span>
                    ))}
                  </div>
                </div>

                {selected.quotes && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 italic text-gray-600 border-l-4 border-amber-400">
                    "{selected.quotes[0]}"
                  </div>
                )}

                <a href="/destinations" className="block w-full text-center py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                  Book with {selected.name.split(' ')[0]}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
