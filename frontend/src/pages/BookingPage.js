import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, ArrowRight, ArrowLeft, Loader2, Zap, AlertCircle, Timer, X, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_id: '',
    service_name: '',
    description: '',
    preferred_date: null,
    preferred_time: '',
    hours: null
  });

  // Get selected service details
  const selectedService = services.find(s => s.id === formData.service_id);
  const requiresHours = selectedService?.requires_hours || 
    ['Dubbing', 'Vocal Recording'].includes(selectedService?.name);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const serviceName = searchParams.get('service');
    if (serviceName && services.length > 0) {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        setFormData(prev => ({
          ...prev,
          service_id: service.id,
          service_name: service.name
        }));
      }
    }
  }, [searchParams, services]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        full_name: user.name || prev.full_name,
        email: user.email || prev.email
      }));
    }
  }, [user, isLoggedIn]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      service_name: service?.name || '',
      hours: null // Reset hours when changing service
    }));
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({ ...prev, preferred_date: date }));
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, preferred_time: time }));
  };

  const handleHoursSelect = (hours) => {
    setFormData(prev => ({ ...prev, hours: parseInt(hours) }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      return formData.full_name && formData.email && formData.phone;
    }
    if (currentStep === 2) {
      if (!formData.service_id || !formData.description) return false;
      if (requiresHours && !formData.hours) return false;
      return true;
    }
    if (currentStep === 3) {
      return formData.preferred_date && formData.preferred_time;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        preferred_date: formData.preferred_date.toISOString().split('T')[0],
        hours: requiresHours ? formData.hours : null
      };
      
      const response = await axios.post(`${API}/bookings`, payload);
      setBookingId(response.data.booking?.id);
      setSubmitted(true);
      toast.success('Booking confirmed! Check your email for details.');
      
      // Show signup prompt for non-logged in users
      if (!isLoggedIn) {
        setTimeout(() => setShowSignupPrompt(true), 1500);
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Signup Prompt Modal
  const SignupPromptModal = () => (
    <AnimatePresence>
      {showSignupPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowSignupPrompt(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-heavy rounded-3xl p-8 max-w-md w-full border border-cyan-500/30 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignupPrompt(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Track Your Booking</h3>
              <p className="text-white/50 text-sm">
                Create an account or login to track your booking status in real-time and manage future bookings easily.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold hover:scale-[1.02] transition-transform"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </Link>
              
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl glass border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Login to Existing Account
              </Link>
              
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="w-full text-center text-white/40 hover:text-white/60 text-sm py-2"
              >
                Maybe later
              </button>
            </div>

            {bookingId && (
              <div className="mt-6 p-4 glass rounded-xl border border-orange-500/20">
                <p className="text-xs text-white/40 mb-1">Your Booking ID</p>
                <p className="text-orange-400 font-mono text-sm break-all">{bookingId}</p>
                <p className="text-xs text-white/40 mt-2">Save this to track your booking without an account</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" data-testid="booking-success">
        <SignupPromptModal />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-heavy rounded-3xl p-12 md:p-16 max-w-lg text-center border border-teal-500/20 relative overflow-hidden"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-6 text-amber-400/40"
          >
            <Zap className="w-6 h-6 lightning-bolt" />
          </motion.div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-white/50 mb-8">
            We have sent a confirmation email to <strong className="text-white">{formData.email}</strong>. 
            Our team will contact you shortly to finalize the details.
          </p>
          <div className="glass rounded-2xl p-6 mb-8 text-left border border-cyan-500/20">
            <p className="text-sm text-white/40 mb-2">Booking Summary</p>
            <p className="font-semibold">{formData.service_name}</p>
            {formData.hours && (
              <p className="text-cyan-400 text-sm">{formData.hours} hour(s) booked</p>
            )}
            <p className="text-white/60 text-sm">
              {formData.preferred_date?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {formData.preferred_time}
            </p>
            <p className="text-orange-400/80 text-xs mt-3">Status: Pending Admin Approval</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-4 rounded-full glass border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Back to Home
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => setShowSignupPrompt(true)}
                className="flex-1 px-6 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold hover:scale-105 transition-transform"
              >
                Track Booking
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" data-testid="booking-page">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a1a1f] -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/15 via-transparent to-teal-900/10" />
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]" />
      </div>

      <div className="pt-40 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full glass border border-cyan-500/30 text-xs uppercase tracking-[0.2em] text-cyan-400 mb-6">
              Book a Session
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Schedule Your<br />
              <span className="text-gradient">Studio Session</span>
            </h1>
            <p className="text-white/50">No account required. Fill out the form and we will handle the rest.</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= s
                        ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-black'
                        : 'glass border border-white/10 text-white/40'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-heavy rounded-3xl p-8 md:p-12 border border-teal-500/20"
          >
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-cyan-400" />
                  Your Information
                </h2>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                    data-testid="input-full-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Service Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-400" />
                  Service Details
                </h2>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Select Service *</label>
                  <Select value={formData.service_id} onValueChange={handleServiceSelect}>
                    <SelectTrigger 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 h-auto text-white"
                      data-testid="select-service"
                    >
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d2229] border border-white/10">
                      {services.map((service) => (
                        <SelectItem 
                          key={service.id} 
                          value={service.id}
                          className="text-white hover:bg-white/10"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-cyan-400 text-sm ml-4">
                              {service.price || 'Project Based'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hours Selection for Dubbing/Vocal Recording */}
                {requiresHours && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <label className="block text-sm text-white/60 mb-2">
                      <Timer className="w-4 h-4 inline mr-2" />
                      Number of Hours *
                    </label>
                    <Select value={formData.hours?.toString() || ''} onValueChange={handleHoursSelect}>
                      <SelectTrigger 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 h-auto text-white"
                        data-testid="select-hours"
                      >
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d2229] border border-white/10">
                        {hourOptions.map((hour) => (
                          <SelectItem 
                            key={hour} 
                            value={hour.toString()}
                            className="text-white hover:bg-white/10"
                          >
                            {hour} hour{hour > 1 ? 's' : ''} 
                            {selectedService?.price && (
                              <span className="text-cyan-400 ml-2">
                                (₹{parseInt(selectedService.price.replace(/[^0-9]/g, '')) * hour})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Extra Hours Notice */}
                    <div className="flex items-start gap-3 p-4 glass rounded-xl border border-orange-500/20">
                      <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-orange-400 font-medium">Important Notice</p>
                        <p className="text-white/50 mt-1">
                          If extra hours are needed during the live session, additional charges will apply at the same hourly rate.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Project Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about your project, requirements, and any specific details..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors resize-none"
                    data-testid="input-description"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-teal-400" />
                  Select Date & Time
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm text-white/60 mb-4">Preferred Date *</label>
                    <div className="glass rounded-2xl p-4 border border-white/10">
                      <CalendarComponent
                        mode="single"
                        selected={formData.preferred_date}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-xl"
                        data-testid="calendar"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/60 mb-4">Preferred Time *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          data-testid={`time-slot-${time.replace(/\s+/g, '-').toLowerCase()}`}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            formData.preferred_time === time
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black'
                              : 'glass border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <Clock className="w-4 h-4 inline mr-2" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {formData.service_name && (
                  <div className="mt-6 p-4 glass rounded-xl border border-cyan-500/20">
                    <p className="text-sm text-white/40 mb-2">Booking Summary</p>
                    <p className="font-semibold text-white">{formData.service_name}</p>
                    {formData.hours && (
                      <p className="text-cyan-400 text-sm">{formData.hours} hour(s)</p>
                    )}
                    {formData.preferred_date && formData.preferred_time && (
                      <p className="text-white/60 text-sm">
                        {formData.preferred_date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {formData.preferred_time}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-8 border-t border-white/10">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full glass border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                  data-testid="btn-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <button
                  onClick={() => validateStep(step) ? setStep(step + 1) : toast.error('Please fill all required fields')}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-semibold hover:scale-105 transition-transform"
                  data-testid="btn-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold hover:scale-105 transition-transform disabled:opacity-50"
                  data-testid="btn-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
