'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, CreditCard, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    { icon: UtensilsCrossed, text: '豐富菜單', color: 'from-orange-500 to-red-500' },
    { icon: Clock, text: '快速點餐', color: 'from-blue-500 to-cyan-500' },
    { icon: CreditCard, text: '多元支付', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e94560]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fbbf24]/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-[#e94560] to-[#ff6b6b] shadow-2xl shadow-[#e94560]/50 mb-6">
            <UtensilsCrossed className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-5xl md:text-6xl font-black mb-4"
        >
          自助點餐系統
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-white/60 mb-12"
        >
          輕觸螢幕，開始您的美食之旅
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center gap-8 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/order')}
          className="group relative px-16 py-6 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-2xl text-2xl font-bold text-white shadow-2xl shadow-[#e94560]/50 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            點擊開始點餐
            <Sparkles className="w-6 h-6" />
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 text-white/40 text-sm"
        >
          觸碰任意位置或點擊按鈕開始
        </motion.p>
      </motion.div>
    </div>
  );
}