'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mountain, Camera, Sparkles, ArrowRight, Clock, Users, MapPin, Star, X } from 'lucide-react';

const tours = [
  {
    id: 'adventure',
    icon: Mountain,
    title: 'Adventure Tours',
    subtitle: 'For the Bold Explorer',
    shortDesc: 'Trek through dramatic highlands, descend into volcanic craters, and raft mighty rivers.',
    fullDesc: 'Ethiopia offers some of Africa\'s most dramatic adventure experiences. Trek the Simien Mountains alongside gelada baboons, descend into the otherworldly Danakil Depression with its active lava lakes, raft the Blue Nile through deep gorges, or climb Ras Dashen - Ethiopia\'s highest peak at 4,550 meters.',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200',
    highlights: ['Simien Mountains Trek (7-10 days)', 'Danakil Depression Expedition (5 days)', 'Bale Mountains Wildlife Safari', 'Blue Nile Rafting', 'Ras Dashen Summit Climb'],
    difficulty: 'Moderate to Challenging',
    duration: '3-14 days',
    groupSize: '2-15 people',
    color: 'from-red-500 to-orange-500',
    link: '/destinations?difficulty=hard',
  },
  {
    id: 'cultural',
    icon: Compass,
    title: 'Cultural Tours',
    subtitle: 'Immerse in Living Traditions',
    shortDesc: 'Meet ancient tribes, witness sacred ceremonies, and learn timeless crafts.',
    fullDesc: 'Dive deep into Ethiopia\'s extraordinary cultural diversity. Visit the Omo Valley tribes where body painting and bull jumping ceremonies continue as they have for centuries. Experience the coffee ceremony in a highland village. Learn pottery from Gurage artisans or weaving from Dorze masters. Every encounter opens a window into a way of life preserved for generations.',
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200',
    highlights: ['Omo Valley Tribes Tour', 'Coffee Ceremony Experience', 'Dorze Village Visit', 'Hamar Bull Jumping Festival', 'Harar Hyena Feeding'],
    difficulty: 'Easy to Moderate',
    duration: '5-14 days',
    groupSize: '2-12 people',
    color: 'from-purple-500 to-pink-500',
    link: '/destinations?difficulty=moderate',
  },
  {
    id: 'historical',
    icon: Camera,
    title: 'Historical Routes',
    subtitle: 'Walk Through 3,000 Years',
    shortDesc: 'Explore ancient kingdoms, rock-hewn wonders, and sacred sites.',
    fullDesc: 'Ethiopia boasts one of the world\'s oldest continuous civilizations. Stand before the towering stelae of Aksum, walk through the rock-hewn labyrinth of Lalibela\'s 11 monolithic churches, explore the Camelot of Africa at Gondar\'s castles, and discover the ancient walled city of Harar with its 82 mosques. History here is not in museums - it is alive in every stone.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=1200',
    highlights: ['Lalibela Churches (3-5 days)', 'Aksum & Yeha Ancient Sites', 'Gondar Castles & Debre Berhan', 'Harar Jugol Walled City', 'Tiya Stelae & Tiya Archaeological'],
    difficulty: 'Easy',
    duration: '2-7 days',
    groupSize: '2-20 people',
    color: 'from-amber-500 to-yellow-500',
    link: '/destinations?difficulty=easy',
  },
];

export default function ToursPage() {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-emerald-900/70 via-emerald-800/50 to-emerald-900/80" />
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600"
          alt="Ethiopia tours"
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
            <span className="text-sm">Handcrafted Experiences</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-4">Tours & Experiences</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            From mountain peaks to ancient streets - find your perfect Ethiopian journey
          </p>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcf9f4] to-transparent z-20" />
      </section>

      {/* Tour Categories */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute top-4 left-4 p-3 rounded-xl bg-gradient-to-br ${tour.color} shadow-lg`}>
                    <tour.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{tour.title}</h3>
                    <p className="text-white/80 text-sm">{tour.subtitle}</p>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{tour.shortDesc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" />{tour.duration}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Users className="h-3 w-3" />{tour.groupSize}
                    </span>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => setSelected(tour)}
                      className="flex-1 py-2.5 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors text-center"
                    >
                      View Details
                    </button>
                    <a
                      href={tour.link}
                      className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors text-center flex items-center justify-center gap-1"
                    >
                      Browse <ArrowRight className="h-3.5 w-3.5" />
                    </a>
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
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-52 overflow-hidden rounded-t-3xl">
                <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50">
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-6 text-white">
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${selected.color} mb-2`}>
                    <selected.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <p className="text-white/80 text-sm">{selected.subtitle}</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-gray-700 leading-relaxed">{selected.fullDesc}</p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <Clock className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selected.duration}</p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selected.groupSize}</p>
                    <p className="text-xs text-gray-500">Group Size</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selected.difficulty}</p>
                    <p className="text-xs text-gray-500">Difficulty</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Popular Experiences</h3>
                  <div className="space-y-2">
                    {selected.highlights.map((h: string) => (
                      <div key={h} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${selected.color}`} />
                        <span className="text-sm text-gray-700">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={selected.link}
                  className="block w-full text-center py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Browse {selected.title}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
