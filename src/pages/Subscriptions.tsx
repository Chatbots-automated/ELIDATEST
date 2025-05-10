import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Star, Clock, Shield, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useStore } from '../store/useStore';

interface Subscription {
  id: number;
  "Min kiekis": string;
  Kaina: string;
  imageurl: string;
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('abonomentai')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscriptionClick = (subscription: Subscription) => {
    navigate(`/products?subscription=${subscription.id}#subscriptions`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elida-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-elida-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-b from-elida-warm to-elida-cream py-20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="font-playfair text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
                Abonementai
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-elida-gold to-elida-accent mx-auto lg:mx-0 mb-8"></div>
              <div className="prose prose-lg text-gray-600 mb-8">
                <p>Įdegio minutės pigiau su ELIDA abonementais!</p>
                <p>Paslaugos mūsų, geros kainos Jūsų! Įsigiję abonomentą minutės kainą gaunate dar geresnę!</p>
                <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Įprasta minutės kaina : 0.70 € / min</h3>
                <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4"> Minutės kaina su abonementu:</h3>
                <ul className="space-y-2 list-none p-0">
                  <li>30 min – tik 0.66 € / min</li>
                  <li>50 min – tik 0.60 € / min</li>
                  <li>70 min – tik 0.57 € / min</li>
                  <li>100 min – tik 0.50 € / min</li>
                  <li>150 min – vos 0.46 € / min</li>
                </ul>

                <p className="mt-8"> Abonementai galioja neribotą laiką!</p>
                <p>Pirkite dabar ir naudokitės kada tik norite – be jokių terminų!</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="https://i.imgur.com/izJfzNy.png"
                alt="ÉLIDA Abonementai"
                className="rounded-2xl shadow-lg w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-elida-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subscriptions.map((subscription, index) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {subscription.imageurl && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={subscription.imageurl}
                      alt={`${subscription["Min kiekis"]} minučių abonementas`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-elida-gold/10 rounded-lg">
                      <CreditCard className="h-6 w-6 text-elida-gold" />
                    </div>
                    <h3 className="text-2xl font-playfair text-gray-900">
                      {subscription["Min kiekis"]} minučių
                    </h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-playfair text-gray-900">{subscription.Kaina}€</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubscriptionClick(subscription)}
                    className="block w-full py-3 text-center bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    Užsisakyti
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}