'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, Shield, Heart, Globe, Award, Sparkles, ArrowRight } from 'lucide-react';

const stats = [
  { number: '50+', label: 'Expert Guides', icon: Users },
  { number: '100+', label: 'Destinations', icon: MapPin },
  { number: '10K+', label: 'Happy Travelers', icon: Heart },
  { number: '15+', label: 'Languages', icon: Globe },
];

const values = [
  {
    icon: MapPin,
    title: 'Local Expertise',
    desc: 'Our guides are born and raised in the communities they serve. They know every hidden church, every scenic viewpoint, and every family recipe. When you travel with us, you are not just visiting Ethiopia - you are welcomed into it.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01ef0?w=800',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Community First',
    desc: 'Tourism should benefit those who preserve the heritage. We reinvest 15% of every booking directly into local communities through education, healthcare, and cultural preservation projects. Your journey creates lasting impact.',
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Safe & Sustainable',
    desc: 'Safety is non-negotiable. Every guide is certified in first aid, every vehicle is regularly inspected, and every route is carefully planned. We also practice responsible tourism - minimizing environmental impact and respecting local customs.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    color: 'from-blue-500 to-cyan-500',
  },
];

const timeline = [
  { year: '2020', title: 'The Vision', desc: 'A group of passionate Ethiopian guides dream of sharing their homeland with the world in an authentic, respectful way.' },
  { year: '2022', title: 'First Steps', desc: 'Ethiopia Tours is founded with just 5 guides and 3 destinations. The first travelers arrive and are amazed.' },
  { year: '2024', title: 'Growing Community', desc: '50+ guides join the platform. We expand to cover all major Ethiopian regions and cultural sites.' },
  { year: '2025', title: 'Award Winning', desc: 'Recognized as Ethiopia\'s leading cultural tourism platform. 10,000+ travelers served.' },
  { year: '2026', title: 'Looking Ahead', desc: 'Expanding into sustainable tourism initiatives and deeper community partnerships across Ethiopia.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f4] via-white to-[#f5ede1]">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-emerald-900/80 via-emerald-800/60 to-emerald-900/70" />
        <img
          src="https://i.pinimg.com/736x/8b/7e/d9/8b7ed9b487371f177146cc83d75e9303.jpg"
          alt="Ethiopia landscape"
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
            <span className="text-sm">Since 2022</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">About Ethiopia Tours</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Connecting travelers with authentic Ethiopian experiences - crafted by local guides and communities who call this magnificent land home.
          </p>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcf9f4] to-transparent z-20" />
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 -mt-20 relative z-20 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <stat.icon className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">{stat.number}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Born from a deep love for Ethiopia - its landscapes, its people, and its 3,000-year-old civilization. We believe travel should be a bridge between cultures, not just a checklist of sights.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-emerald-200">
          {timeline.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:ml-0' : 'md:pl-12 md:ml-auto'}`}
            >
              <div className="absolute left-0 md:left-auto md:right-[-8px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow" 
                style={i % 2 === 0 ? { left: '-8px' } : {}} />
              <div className={`absolute left-0 md:left-auto top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow ${i % 2 === 0 ? 'md:right-[-8px]' : 'md:left-[-8px]'}`} />
              <div className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
                <span className="text-sm font-bold text-emerald-600">{item.year}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-b from-white to-emerald-50/30 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Travel With Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three principles that guide everything we do
            </p>
          </motion.div>

          <div className="space-y-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center`}
              >
                <div className="flex-1">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${value.color} mb-4`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={value.image} alt={value.title} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <Award className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Ethiopia?</h2>
          <p className="text-white/80 mb-8">Join thousands of travelers who have discovered the magic of Ethiopia with local guides who feel like family.</p>
          <a href="/destinations" className="inline-flex items-center gap-2 bg-amber-400 text-gray-900 px-8 py-3.5 rounded-full font-bold hover:bg-amber-300 transition-colors">
            Explore Destinations <ArrowRight className="h-5 w-5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
