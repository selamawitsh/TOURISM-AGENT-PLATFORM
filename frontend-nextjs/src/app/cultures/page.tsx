'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Music, Palette, X, ArrowRight, Sparkles, MapPin } from 'lucide-react';

const cultures = [
  {
    id: 'cuisine',
    icon: Coffee,
    title: 'Ethiopian Cuisine',
    subtitle: 'A Feast for the Senses',
    shortDesc: 'From injera to wat, taste authentic regional dishes with local hosts.',
    fullDesc: 'Ethiopian cuisine is one of the most unique and flavorful in Africa. The cornerstone is injera, a spongy sourdough flatbread made from teff flour, which serves as both plate and utensil. Topped with colorful wats (stews) like Doro Wat (spicy chicken), Misir Wat (red lentils), and Shiro (chickpea stew), every meal is a communal experience. The traditional coffee ceremony is an essential part of Ethiopian hospitality, where green coffee beans are roasted, ground, and brewed in a ritual that can last hours.',
    image: 'https://i.pinimg.com/1200x/d1/3d/87/d13d8750a19b98efe27e0fd2a342ae3f.jpg',
    highlights: ['Injera & Wat', 'Coffee Ceremony', 'Tej (Honey Wine)', 'Tibs (Sautéed Meat)', 'Kitfo (Raw Beef)'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'festivals',
    icon: Music,
    title: 'Festivals & Celebrations',
    subtitle: 'Color, Music, and Ritual',
    shortDesc: 'Timket, Meskel and regional celebrations with color, music and ritual.',
    fullDesc: 'Ethiopia\'s festival calendar is filled with vibrant celebrations that blend ancient traditions with Christian and Islamic heritage. Timket (Epiphany) features colorful processions with priests carrying sacred Tabots. Meskel (Finding of the True Cross) lights up the night with massive bonfires. Fichee-Chambalaalla, the Sidama New Year, was recognized by UNESCO as Intangible Cultural Heritage. Each festival offers a window into the deep spiritual and communal bonds of Ethiopian society.',
    image: 'https://i.pinimg.com/1200x/94/1b/6b/941b6b50ba99f80a059048abff545fb7.jpg',
    highlights: ['Timket (Epiphany)', 'Meskel (True Cross)', 'Enkutatash (New Year)', 'Fichee-Chambalaalla', 'Genna (Christmas)'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'arts',
    icon: Palette,
    title: 'Arts & Crafts',
    subtitle: 'Centuries of Mastery',
    shortDesc: 'Traditional weaving, pottery and instruments crafted by local artisans.',
    fullDesc: 'Ethiopia has a rich artistic heritage spanning millennia. From the intricate illuminated manuscripts of the Ethiopian Orthodox Church to the distinctive crosses and icons, religious art forms a cornerstone of visual culture. Handwoven cotton garments like the Habesha Kemis feature elaborate tibeb (border patterns). In the highlands, potters create functional vessels using techniques passed down through generations. Silver and gold smiths craft elaborate jewelry that signifies status and identity across different ethnic groups.',
    image: 'https://i.pinimg.com/736x/95/39/03/953903aea9108d470b6c10c4dc9d6cb4.jpg',
    highlights: ['Handwoven Textiles', 'Pottery & Ceramics', 'Silver/Gold Jewelry', 'Illuminated Manuscripts', 'Basket Weaving'],
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function CulturesPage() {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-emerald-900/70 via-emerald-800/60 to-emerald-900/70" />
        <img
          src="https://i.pinimg.com/736x/03/a5/39/03a53987e64aeee4916d9c49e791fa80.jpg"
          alt="Ethiopian culture"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center text-white px-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm">Living Heritage</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-4">Cultures of Ethiopia</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Rich traditions, music, cuisine, and living heritage spanning over 3,000 years
          </p>
        </motion.div>
      </section>

      {/* Culture Cards */}
      <section className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {cultures.map((culture, index) => (
            <motion.div
              key={culture.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              onClick={() => setSelected(culture)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={culture.image}
                    alt={culture.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:opacity-80 transition-opacity`} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{culture.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{culture.subtitle}</p>
                  </div>
                  <div className={`absolute top-3 right-3 p-3 rounded-xl bg-gradient-to-br ${culture.color} shadow-lg`}>
                    <culture.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{culture.shortDesc}</p>
                  <div className="flex items-center gap-2 mt-4 text-emerald-600 text-sm font-medium group-hover:text-emerald-700">
                    Explore Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Image */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl">
                <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent`} />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${selected.color} mb-3`}>
                    <selected.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold">{selected.title}</h2>
                  <p className="text-white/80 mt-1">{selected.subtitle}</p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 lg:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About {selected.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{selected.fullDesc}</p>
                </div>

                {/* Highlights */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Key Highlights</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selected.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${selected.color}`} />
                        <span className="text-sm text-gray-700">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 text-center">
                  <p className="text-emerald-800 font-medium">
                    Experience {selected.title.toLowerCase()} firsthand on our curated tours.
                  </p>
                  <a
                    href="/destinations"
                    className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 bg-emerald-700 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <MapPin className="h-4 w-4" /> Explore Destinations
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
