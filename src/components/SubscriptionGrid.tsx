import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Subscription {
  id: number;
  "Min kiekis": string;
  Kaina: string;
}

export default function SubscriptionGrid() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightedSubscriptionId = searchParams.get('subscription');

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

  useEffect(() => {
    // Scroll to subscriptions section if there's a highlighted subscription
    if (highlightedSubscriptionId && location.hash === '#subscriptions') {
      const element = document.getElementById('subscriptions');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [highlightedSubscriptionId]);

  const handleAddToCart = (subscription: Subscription) => {
    addToCart({
      id: subscription.id.toString(),
      name: `${subscription["Min kiekis"]} minučių abonementas`,
      description: `Soliariumo abonementas ${subscription["Min kiekis"]} minučių`,
      price: parseFloat(subscription.Kaina),
      imageurl: 'https://i.imgur.com/izJfzNy.png',
      quantity: 1,
      category: 'Abonementai',
      sku: `ABO-${subscription.id}`
    }, user?.uid);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-elida-gold animate-spin" />
      </div>
    );
  }

  return (
    <div id="subscriptions" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {subscriptions.map((subscription, index) => {
        const isHighlighted = highlightedSubscriptionId === subscription.id.toString();
        
        return (
          <motion.div
            key={subscription.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: isHighlighted ? 1.05 : 1,
            }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
              isHighlighted ? 'ring-4 ring-elida-gold ring-opacity-50' : ''
            }`}
          >
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

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Galioja neribotą laiką</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Profesionalios konsultacijos</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Galimybė dalintis su draugais</span>
                </li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddToCart(subscription)}
                className="w-full py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl font-medium 
                         hover:shadow-lg transition-all duration-300"
              >
                Į krepšelį
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}