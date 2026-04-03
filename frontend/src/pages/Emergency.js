import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Phone, WarningTriangle } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/emergency`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-[#FF9D8A] rounded-full border-2 border-slate-900 flex items-center justify-center shadow-brutal-lg">
              <WarningTriangle className="w-8 h-8 text-slate-900" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Emergency Help
              </h1>
              <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                24/7 crisis support hotlines
              </p>
            </div>
          </div>

          <div className="p-6 bg-[#FF9D8A] rounded-3xl border-2 border-slate-900 shadow-brutal-lg mb-8">
            <p className="text-slate-900 font-bold text-lg mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              🆘 If you're in immediate danger, call 911
            </p>
            <p className="text-slate-900 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
              For crisis support and resources, use the hotlines below
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`emergency-contact-${contact.id}`}
                className="p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {contact.name}
                      </h3>
                      {contact.available_24_7 && (
                        <span className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#A7E6D7] text-xs font-bold uppercase tracking-wider">
                          24/7
                        </span>
                      )}
                    </div>
                    <p className="text-base leading-relaxed text-slate-700 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                      {contact.description}
                    </p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    data-testid={`call-button-${contact.id}`}
                    className="inline-flex items-center space-x-3 px-8 py-4 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-black text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all text-2xl"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    <Phone className="w-6 h-6" strokeWidth={3} />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-[#BFDBFE] rounded-3xl border-2 border-slate-900 shadow-brutal-lg"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            You're Not Alone
          </h3>
          <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
            These services are confidential and free. Trained counselors are available to help you through difficult times.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Emergency;