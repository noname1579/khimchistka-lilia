import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currentServicePage, setCurrentServicePage] = useState(0);
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Состояния для формы обратной связи
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    serviceType: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    loadServices();
    loadReviews();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadServices = () => {
    const savedServices = JSON.parse(localStorage.getItem('services') || '[]');
    if (savedServices.length > 0) {
      setServices(savedServices);
    } else {
      setServices([
        { id: 1, name: 'Химчистка одежды', price: 'от 500₽', desc: 'Деликатная чистка любых тканей', icon: '👕', color: 'from-blue-500 to-cyan-500' },
        { id: 2, name: 'Стирка белья', price: 'от 300₽', desc: 'Профессиональная стирка', icon: '👔', color: 'from-green-500 to-teal-500' },
        { id: 3, name: 'Чистка обуви', price: 'от 700₽', desc: 'Восстановление обуви', icon: '👞', color: 'from-yellow-500 to-orange-500' },
        { id: 4, name: 'Химчистка мебели', price: 'от 2500₽', desc: 'Глубокая чистка мебели', icon: '🛋️', color: 'from-red-500 to-pink-500' },
        { id: 5, name: 'Чистка авто', price: 'от 3500₽', desc: 'Химчистка салона', icon: '🚗', color: 'from-purple-500 to-indigo-500' },
        { id: 6, name: 'Химчистка пуховиков', price: 'от 2000₽', desc: 'Особая забота о пухе', icon: '🧥', color: 'from-cyan-500 to-blue-500' },
      ]);
    }
  };

  const loadReviews = () => {
    const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    if (savedReviews.length > 0) {
      setReviews(savedReviews);
    } else {
      setReviews([
        { id: 1, name: 'Анна', text: 'Отличный сервис! Вернули куртку как новую. Очень довольна результатом.', rating: 5, date: '2 дня назад', avatar: '👩' },
        { id: 2, name: 'Михаил', text: 'Быстро и качественно, спасибо! Буду рекомендовать друзьям.', rating: 5, date: '5 дней назад', avatar: '👨' },
        { id: 3, name: 'Елена', text: 'Очень довольна результатом, вещи как новые. Спасибо мастерам!', rating: 4, date: 'неделю назад', avatar: '👩‍🦰' },
        { id: 4, name: 'Дмитрий', text: 'Профессиональный подход, всё сделали в срок. Рекомендую!', rating: 5, date: '2 недели назад', avatar: '👨‍🦱' },
        { id: 5, name: 'Ольга', text: 'Хорошие цены и качество. Буду обращаться ещё.', rating: 4, date: '3 недели назад', avatar: '👩‍🦳' },
      ]);
    }
  };

  // Получение минимальной даты (сегодня)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Получение максимальной даты (через 3 месяца)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  };

  // Валидация имени
  const validateName = (name) => {
    return name.trim().length >= 2 && /^[а-яА-Яa-zA-Z\s-]+$/.test(name);
  };

  // Валидация сообщения
  const validateMessage = (message) => {
    return message.trim().length >= 10 && message.trim().length <= 500;
  };

  // Валидация времени (только рабочее время 9:00 - 21:00)
  const validateTime = (time) => {
    if (!time) return true;
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 9 && hours <= 21;
  };

  // Валидация даты (нельзя выбрать прошедшую дату)
  const validateDate = (date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Обработка изменения полей формы
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку для этого поля
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Валидация всей формы
  const validateForm = () => {
    const errors = {};
    
    if (!validateName(feedbackForm.name)) {
      errors.name = 'Введите корректное имя (минимум 2 буквы)';
    }
    
    if (!validatePhone(feedbackForm.phone)) {
      errors.phone = 'Введите корректный номер телефона (10-11 цифр)';
    }
    
    if (feedbackForm.email && !validateEmail(feedbackForm.email)) {
      errors.email = 'Введите корректный email';
    }
    
    if (feedbackForm.message && !validateMessage(feedbackForm.message)) {
      errors.message = 'Сообщение должно содержать от 10 до 500 символов';
    }
    
    if (feedbackForm.preferredDate && !validateDate(feedbackForm.preferredDate)) {
      errors.preferredDate = 'Нельзя выбрать прошедшую дату';
    }
    
    if (feedbackForm.preferredTime && !validateTime(feedbackForm.preferredTime)) {
      errors.preferredTime = 'Выберите время с 9:00 до 21:00';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Отправка формы
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setIsSubmitting(true);
    
    // Имитация отправки на сервер
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Сохраняем заявку в localStorage
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const newFeedback = {
      id: Date.now(),
      ...feedbackForm,
      date: new Date().toISOString(),
      status: 'new'
    };
    feedbacks.push(newFeedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    toast.success('Спасибо! Мы свяжемся с вами в ближайшее время');
    
    // Очищаем форму
    setFeedbackForm({
      name: '',
      phone: '',
      email: '',
      message: '',
      preferredDate: '',
      preferredTime: '',
      serviceType: ''
    });
    
    setIsSubmitting(false);
  };

  // Функция для плавной прокрутки
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Пагинация для услуг
  const servicesPerPage = 5;
  const servicePagesCount = Math.ceil(services.length / servicesPerPage);
  const displayedServices = services.slice(
    currentServicePage * servicesPerPage,
    (currentServicePage + 1) * servicesPerPage
  );

  // Пагинация для отзывов
  const reviewsPerPage = 3;
  const reviewPagesCount = Math.ceil(reviews.length / reviewsPerPage);
  const displayedReviews = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  );

  const handleServicePageChange = (page) => {
    setCurrentServicePage(page);
    scrollToSection('services');
  };

  const handleReviewPageChange = (page) => {
    setCurrentReviewPage(page);
    scrollToSection('reviews');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/10 backdrop-blur-lg border-b border-white/20' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-float">🧼</div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Лилия
              </span>
              <span className="text-white/60 text-sm block">Премиум химчистка</span>
            </div>
          </div>

          <div className="hidden md:flex gap-6">
            {[
              { id: 'home', label: 'Главная' },
              { id: 'services', label: 'Услуги' },
              { id: 'features', label: 'Преимущества' },
              { id: 'reviews', label: 'Отзывы' },
              { id: 'feedback', label: 'Связь с нами' },
              { id: 'contacts', label: 'Контакты' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white/80 hover:text-white transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/login" className="px-5 py-2 text-white font-semibold hover:bg-white/10 rounded-xl transition-all">
              Войти
            </Link>
            <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all">
              Регистрация
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Доступно 24/7
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Идеальная</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  чистота
                </span>
                <br />
                <span className="text-white">для ваших вещей</span>
              </h1>
              <p className="text-white/70 text-lg mt-6 leading-relaxed max-w-lg">
                Профессиональная химчистка премиум-класса. Бережно относимся к каждой вещи.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => scrollToSection('services')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
                >
                  Наши услуги →
                </button>
                <button
                  onClick={() => scrollToSection('feedback')}
                  className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Свяжитесь с нами
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop"
                  alt="Химчистка"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-30 animate-float"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section with Pagination */}
      <section id="services" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">Наши</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">услуги</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Профессиональный подход к каждой вещи
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {displayedServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 border border-white/20">
                  <div className="text-5xl mb-3">{service.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {service.price}
                  </p>
                  <p className="text-white/50 text-sm mt-2">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination for Services */}
          {servicePagesCount > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleServicePageChange(currentServicePage - 1)}
                disabled={currentServicePage === 0}
                className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-all"
              >
                ← Назад
              </button>
              {[...Array(servicePagesCount)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleServicePageChange(idx)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    currentServicePage === idx
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handleServicePageChange(currentServicePage + 1)}
                disabled={currentServicePage === servicePagesCount - 1}
                className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-all"
              >
                Вперёд →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">Наши</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">преимущества</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '⚡', title: 'Мгновенный ответ', desc: 'Обработка заявок за 5 минут' },
              { icon: '🛡️', title: 'Гарантия качества', desc: '100% возврат при неудовлетворении' },
              { icon: '🎯', title: 'Точность до 99%', desc: 'Современное оборудование' },
              { icon: '💎', title: 'Премиум уход', desc: 'Деликатные средства' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:scale-105 transition-all duration-300"
              >
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section with Pagination */}
      <section id="reviews" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">Отзывы</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">клиентов</span>
            </h2>
            <p className="text-white/60 text-lg">Что говорят о нас</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{review.avatar}</div>
                  <div>
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-500'}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-white/80 mb-3">{review.text}</p>
                <p className="text-white/40 text-sm">{review.date}</p>
              </motion.div>
            ))}
          </div>

          {/* Pagination for Reviews */}
          {reviewPagesCount > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                disabled={currentReviewPage === 0}
                className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-all"
              >
                ← Назад
              </button>
              {[...Array(reviewPagesCount)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReviewPageChange(idx)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    currentReviewPage === idx
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                disabled={currentReviewPage === reviewPagesCount - 1}
                className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-30 hover:bg-white/20 transition-all"
              >
                Вперёд →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Feedback Form Section with Validation */}
      <section id="feedback" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-white">Свяжитесь</span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ml-3">с нами</span>
              </h2>
              <p className="text-white/60 text-lg">
                Оставьте заявку и мы перезвоним вам в течение 15 минут
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Имя */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Ваше имя <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={feedbackForm.name}
                      onChange={handleFeedbackChange}
                      placeholder="Иван Иванов"
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                        formErrors.name ? 'border-red-500' : 'border-white/20'
                      } text-white placeholder-white/30 focus:border-purple-400 focus:outline-none transition-all`}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Телефон */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Телефон <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={feedbackForm.phone}
                      onChange={handleFeedbackChange}
                      placeholder="+7 (999) 123-45-67"
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                        formErrors.phone ? 'border-red-500' : 'border-white/20'
                      } text-white placeholder-white/30 focus:border-purple-400 focus:outline-none transition-all`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email (опционально)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={feedbackForm.email}
                      onChange={handleFeedbackChange}
                      placeholder="ivan@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                        formErrors.email ? 'border-red-500' : 'border-white/20'
                      } text-white placeholder-white/30 focus:border-purple-400 focus:outline-none transition-all`}
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Тип услуги */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Интересующая услуга
                    </label>
                    <select
                      name="serviceType"
                      value={feedbackForm.serviceType}
                      onChange={handleFeedbackChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:outline-none transition-all"
                    >
                      <option value="">Выберите услугу</option>
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Предпочтительная дата */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Удобная дата
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={feedbackForm.preferredDate}
                      onChange={handleFeedbackChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                        formErrors.preferredDate ? 'border-red-500' : 'border-white/20'
                      } text-white focus:border-purple-400 focus:outline-none transition-all`}
                    />
                    {formErrors.preferredDate && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.preferredDate}</p>
                    )}
                    <p className="text-white/30 text-xs mt-1">Можно выбрать дату на ближайшие 3 месяца</p>
                  </div>

                  {/* Предпочтительное время */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Удобное время
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={feedbackForm.preferredTime}
                      onChange={handleFeedbackChange}
                      min="09:00"
                      max="21:00"
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                        formErrors.preferredTime ? 'border-red-500' : 'border-white/20'
                      } text-white focus:border-purple-400 focus:outline-none transition-all`}
                    />
                    {formErrors.preferredTime && (
                      <p className="text-red-400 text-xs mt-1">{formErrors.preferredTime}</p>
                    )}
                    <p className="text-white/30 text-xs mt-1">Рабочее время: 9:00 - 21:00</p>
                  </div>
                </div>

                {/* Сообщение */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Ваше сообщение
                  </label>
                  <textarea
                    name="message"
                    value={feedbackForm.message}
                    onChange={handleFeedbackChange}
                    rows="4"
                    placeholder="Опишите, какую услугу вы хотите заказать или задайте вопрос..."
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                      formErrors.message ? 'border-red-500' : 'border-white/20'
                    } text-white placeholder-white/30 focus:border-purple-400 focus:outline-none transition-all resize-none`}
                  />
                  {formErrors.message && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.message}</p>
                  )}
                  <p className="text-white/30 text-xs mt-1 text-right">
                    {feedbackForm.message.length}/500 символов
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? 'Отправка...' : '📨 Отправить заявку'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&h=400&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Готовы доверить нам свои вещи?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Оставьте заявку прямо сейчас и получите скидку 20% на первый заказ
              </p>
              <button
                onClick={() => scrollToSection('feedback')}
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                Оставить заявку →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="relative z-10 bg-black/50 backdrop-blur-lg py-12">
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
              <p className="text-white/40 text-sm">Профессиональная химчистка с 2010 года</p>
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
                <p className="text-green-400">Без перерыва</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Мы в соцсетях</h4>
              <div className="flex gap-3">
                {['📱', '💬', '📷', '🎵', '💙'].map((icon, i) => (
                  <div key={i} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl cursor-pointer hover:scale-110 hover:bg-white/20 transition-all">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/30 text-sm">
            © 2026 Химчистка «Лилия». Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;