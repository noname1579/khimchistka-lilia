import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { icon: '👕', name: 'Химчистка одежды', price: 'от 500₽', desc: 'Деликатная чистка любых тканей', color: 'from-blue-500 to-cyan-500', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: '👔', name: 'Стирка белья', price: 'от 300₽', desc: 'Профессиональная стирка', color: 'from-green-500 to-teal-500', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { icon: '👞', name: 'Чистка обуви', price: 'от 700₽', desc: 'Восстановление обуви', color: 'from-yellow-500 to-orange-500', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { icon: '🛋️', name: 'Химчистка мебели', price: 'от 2500₽', desc: 'Глубокая чистка мебели', color: 'from-red-500 to-pink-500', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { icon: '🚗', name: 'Чистка авто', price: 'от 3500₽', desc: 'Химчистка салона', color: 'from-purple-500 to-indigo-500', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  ];

  const features = [
    { icon: '⚡', title: 'Мгновенный ответ', desc: 'Обработка заявок за 5 минут', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: '🛡️', title: 'Гарантия качества', desc: '100% возврат при неудовлетворении', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { icon: '🎯', title: 'Точность до 99%', desc: 'Современное оборудование', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { icon: '💎', title: 'Премиум уход', desc: 'Деликатные средства', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900 opacity-95"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-morphism' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🧼
              </motion.div>
              <div className="absolute inset-0 bg-white rounded-full filter blur-md opacity-50"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent neon-text">
                Лилия
              </span>
              <span className="text-white/60 text-sm block">Премиум химчистка</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex gap-8"
          >
            {['Главная', 'Услуги', 'Преимущества', 'Отзывы'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/80 hover:text-white transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Link to="/login" className="px-6 py-2.5 text-white font-semibold hover:bg-white/10 rounded-xl transition-all duration-300">
              Войти
            </Link>
            <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group">
              <span className="relative z-10">Регистрация</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </motion.div>
        </div>
      </nav>

      <section id="Главная" className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 glass-morphism px-4 py-2 rounded-full text-white text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Доступно 24/7
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Идеальная</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  чистота
                </span>
                <br />
                <span className="text-white">для ваших вещей</span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed max-w-lg">
                Профессиональная химчистка премиум-класса. Бережно относимся к каждой вещи. 
                Гарантируем 100% результат или возврат средств.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl overflow-hidden hover:shadow-2xl transition-all">
                  <span className="relative z-10 flex items-center gap-2">
                    Оставить заявку
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm">
                  Услуги и цены
                </button>
              </div>

              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-white">5000+</div>
                  <div className="text-white/50 text-sm">Довольных клиентов</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold text-white">15000+</div>
                  <div className="text-white/50 text-sm">Выполненных заказов</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-white/50 text-sm">Положительных отзывов</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop"
                  alt="Химчистка"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
              
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 glass-morphism rounded-2xl p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⭐</div>
                  <div>
                    <div className="text-white font-bold">4.9 / 5.0</div>
                    <div className="text-white/50 text-sm">Рейтинг</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 glass-morphism rounded-2xl p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <div className="text-white font-bold">24/7</div>
                    <div className="text-white/50 text-sm">Поддержка</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="Услуги" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">Наши</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">услуги</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Профессиональный подход к каждой вещи с использованием премиальных средств
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group cursor-pointer"
              >
                <div className="glass-morphism rounded-2xl p-8 text-center backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {service.price}
                  </p>
                  <p className="text-white/50 text-sm">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="Преимущества" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Почему выбирают
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">нас</span>
              </h2>
              
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-morphism rounded-2xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{feature.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                        <p className="text-white/60">{feature.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="glass-morphism rounded-3xl p-8 backdrop-blur-xl">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">🏆</div>
                  <h3 className="text-2xl font-bold text-white">Лучшая химчистка 2024</h3>
                  <p className="text-white/60">По версии профессионального сообщества</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Качество', value: 99, color: 'from-purple-500 to-pink-500' },
                    { label: 'Скорость', value: 95, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Доверие', value: 98, color: 'from-green-500 to-teal-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-white mb-1">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=400&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
            
            <div className="relative p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Готовы доверить нам свои вещи?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Оставьте заявку прямо сейчас и получите скидку 20% на первый заказ + бесплатную доставку
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="group relative px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl overflow-hidden hover:shadow-2xl transition-all">
                  <span className="relative z-10 flex items-center gap-2">
                    Записаться сейчас →
                  </span>
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                  Получить консультацию
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 bg-black/50 backdrop-blur-xl py-12 mt-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl">🧼</div>
                <div>
                  <div className="text-white font-bold text-lg">Химчистка «Лилия»</div>
                  <div className="text-white/50 text-sm">Премиум класс</div>
                </div>
              </div>
              <p className="text-white/40 text-sm">Профессиональная химчистка с 2026 года</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-white/40 text-sm">
                <p className="hover:text-white transition-colors">📞 8 (951) 500-65-20</p>
                <p className="hover:text-white transition-colors">✉️ info@lilia.ru</p>
                <p className="hover:text-white transition-colors">📍 г. Ростов-на-Дону, ул. Красноармейская, 11</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Режим работы</h4>
              <div className="space-y-1 text-white/40 text-sm">
                <p>Пн-Пт: 9:00 - 21:00</p>
                <p>Сб-Вс: 10:00 - 18:00</p>
                <p className="text-green-400">🚀 Без перерыва</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Мы в соцсетях</h4>
              <div className="flex gap-3">
                {['📱', '💬', '📷', '🎵', '💙'].map((icon, i) => (
                  <div key={i} className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-all">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/30 text-sm">
            © 2026 Химчистка «Лилия». Все права защищены.Ц
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;