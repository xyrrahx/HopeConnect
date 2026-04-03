import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Bag as Briefcase, Gift, Group as Users, Phone, Heart, ArrowRight } from 'iconoir-react';

function Home() {
  const features = [
    {
      title: 'Find Resources',
      description: 'Locate nearby shelters, food banks, and healthcare services',
      icon: MapPin,
      color: '#FF9D8A',
      link: '/resources'
    },
    {
      title: 'Job Opportunities',
      description: 'Browse entry-level jobs and build your career',
      icon: Briefcase,
      color: '#A7E6D7',
      link: '/jobs'
    },
    {
      title: 'Get Benefits',
      description: 'Learn about government assistance programs',
      icon: Gift,
      color: '#FDE68A',
      link: '/benefits'
    },
    {
      title: 'Community Support',
      description: 'Connect with others and share experiences',
      icon: Users,
      color: '#BFDBFE',
      link: '/community'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FF9D8A] rounded-full border-2 border-slate-900 mb-6 shadow-brutal-lg">
              <Heart className="w-12 h-12 text-slate-900" strokeWidth={3} />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Welcome to HopeConnect
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-medium max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Figtree, sans-serif' }}>
              Your comprehensive resource hub for finding shelters, jobs, benefits, and community support. We're here to help you take the next step forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resources"
                data-testid="hero-find-resources-button"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
              >
                <span>Find Resources</span>
                <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </Link>
              <Link
                to="/emergency"
                data-testid="hero-emergency-button"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
              >
                <Phone className="w-5 h-5" strokeWidth={3} />
                <span>Emergency Help</span>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Link
                    to={feature.link}
                    data-testid={`feature-card-${feature.title.toLowerCase().replace(' ', '-')}`}
                    className="block p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: feature.color }}
                      >
                        <Icon className="w-8 h-8 text-slate-900" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          {feature.title}
                        </h3>
                        <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A]"
          >
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Need Immediate Help?
              </h2>
              <p className="text-base leading-relaxed text-slate-700 font-medium mb-6" style={{ fontFamily: 'Figtree, sans-serif' }}>
                If you're in crisis, emergency hotlines are available 24/7
              </p>
              <Link
                to="/emergency"
                data-testid="emergency-section-button"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
              >
                <Phone className="w-5 h-5" strokeWidth={3} />
                <span>View Emergency Contacts</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;