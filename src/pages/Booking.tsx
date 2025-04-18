import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingCalendar from '../components/BookingCalendar';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function Booking() {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@elida.lt';
  const [showHours, setShowHours] = useState(false);

  const workingHours = [
    { day: 'Pirmadienis', hours: '9:00 - 20:00' },
    { day: 'Antradienis', hours: '9:00 - 20:00' },
    { day: 'Trečiadienis', hours: '9:00 - 20:00' },
    { day: 'Ketvirtadienis', hours: '9:00 - 20:00' },
    { day: 'Penktadienis', hours: '9:00 - 20:00' },
    { day: 'Šeštadienis', hours: '9:00 - 16:00' },
    { day: 'Sekmadienis', hours: '9:00 - 14:00' },
  ];

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-b from-elida-warm to-elida-cream py-24 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-playfair text-5xl md:text-6xl text-gray-900 mb-8 leading-tight">
              {isAdmin ? 'Booking Management' : 'Rezervuokite Savo Laiką'}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-elida-gold to-elida-accent mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {isAdmin
                ? 'Manage all bookings and view the calendar'
                : 'Pasirinkite jums patogų laiką ir kabiną'}
            </p>
            <a
              href="tel:064440596"
              className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-full font-medium text-lg shadow-gold hover:shadow-gold-lg transition-all duration-300 mb-6"
            >
              Registracija telefonu 064440596
            </a>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowHours(!showHours)}
                className="flex items-center gap-2 px-10 py-4 bg-white/10 text-gray-900 backdrop-blur-sm rounded-full font-medium text-lg hover:bg-white/20 transition-all duration-300 border border-gray-200"
              >
                <Clock className="h-5 w-5" />
                Darbo laikas
                {showHours ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <AnimatePresence>
                {showHours && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="grid gap-2">
                      {workingHours.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-gray-700"
                        >
                          <span className="font-medium">{item.day}</span>
                          <span>{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-elida-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isAdmin ? <AdminDashboard /> : <BookingCalendar />}
        </div>
      </section>
    </div>
  );
}