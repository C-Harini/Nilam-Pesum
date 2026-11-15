import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, Mail, Lock, User, Phone, Sparkles, Volume2, 
  VolumeX, Eye, EyeOff, ArrowRight, Globe, CheckCircle2, Shield
} from 'lucide-react';

export default function WelcomeLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const { speak, isSpeaking, stopSpeaking } = useVoice();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isTamil = i18n.language === 'ta';

  // Proactive Voice Welcome on mount
  useEffect(() => {
    const welcomeSpeech = isTamil
      ? "வணக்கம்! நிலம் பேசும் விவசாய ஆலோசனை தளத்திற்கு நல்வரவு. உள்நுழைய உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும், அல்லது புதிய கணக்கு தொடங்கவும்."
      : "Welcome to Nilam Pesum. Please enter your email and password to sign in or create a new farmer account.";
    speak(welcomeSpeech);
  }, [isTamil]);

  const toggleLanguage = () => {
    const nextLang = isTamil ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('nilam_pesum_lang', nextLang);
  };

  const handleSpeakInstructions = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = isRegistering
      ? (isTamil 
          ? "புதிய கணக்கு துவங்க: உங்கள் பெயர், மின்னஞ்சல் முகவரி மற்றும் கடவுச்சொல்லை உள்ளிட்டு 'கணக்கு உருவாக்கு' பட்டனை அழுத்தவும். தொடர்ந்து குரல் வழியில் உங்கள் நில விவரங்கள் கேட்கப்படும்."
          : "To create an account: enter your name, email, and password. Next, voice onboarding will guide you through your farm setup.")
      : (isTamil 
          ? "உள்நுழைய: பதிவு செய்யப்பட்ட மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும். அல்லது கீழே உள்ள மாதிரி பண்ணை பொத்தானை அழுத்தி உடனடியாக சோதிக்கலாம்."
          : "To sign in: enter your registered email and password. Or click the demo button below to test instantly.");
    speak(text);
  };

  const handleDemo = async (type = 'tn') => {
    try {
      setLoading(true);
      setError(null);
      const { greeting } = await demoLogin();
      speak(greeting || (isTamil
        ? "வணக்கம்! தஞ்சாவூர் காவிரி டெல்டா வயல் நாசா நேரடித் தரவுகளுடன் தயாராக உள்ளது."
        : "Welcome! Your Thanjavur Cauvery Delta Farm is loaded with authentic NASA data."));
      navigate('/today');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isTamil 
        ? 'தயவுசெய்து மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.' 
        : 'Please enter both email and password.');
      return;
    }

    if (password.length < 4) {
      setError(isTamil 
        ? 'கடவுச்சொல் குறைந்தது 4 எழுத்துகளாக இருக்க வேண்டும்.' 
        : 'Password must be at least 4 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isRegistering) {
        const { greeting } = await register({
          name: name || (isTamil ? 'விவசாயி' : 'Farmer'),
          email: email.trim().toLowerCase(),
          password,
          phone: phone ? phone.replace(/\D/g, '') : undefined
        });
        
        speak(greeting || (isTamil
          ? "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! இப்போது உங்கள் நில விவரங்களை பதிவு செய்வோம்."
          : "Account created successfully! Let's set up your farm details."));
        // First-time registering goes straight to Voice Guided Onboarding
        navigate('/onboarding');
      } else {
        const { greeting } = await login({
          identifier: email.trim().toLowerCase(),
          password
        });
        
        speak(greeting || (isTamil
          ? "வணக்கம்! வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள். உங்கள் பண்ணை விவரங்கள் தயாராக உள்ளன."
          : "Signed in successfully. Your farm details are ready."));
        navigate('/today');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center px-4 py-8">
      {/* Top Bar: Language & Voice Assistant */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <button
          onClick={handleSpeakInstructions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-field-100 hover:bg-field-200 text-field-900 text-xs font-bold border border-field-300 shadow-sm active:scale-95 transition"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-field-700 animate-pulse" /> : <Volume2 className="w-4 h-4 text-field-700" />}
          <span>{isTamil ? 'குரல் உதவி' : 'Voice Help'}</span>
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-wheat-100 hover:bg-wheat-200 text-soil-900 text-xs font-bold border border-wheat-400 shadow-sm active:scale-95 transition"
        >
          <Globe className="w-4 h-4 text-wheat-700" />
          <span>{isTamil ? 'தமிழ் (Tamil)' : 'English'}</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-field-600 text-wheat-400 mx-auto flex items-center justify-center shadow-tactile mb-3 border-2 border-wheat-500/30">
            <Sprout className="w-12 h-12" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-soil-900 tracking-tight">
            {t('app.name')}
          </h1>
          <p className="text-xs font-semibold text-field-700 mt-1">
            {isTamil ? 'நாசா செயற்கைக்கோள் தரவுகளுடன் கூடிய குரல் வழி விவசாய தளம்' : 'Voice-First Agricultural Advisory Powered by NASA Data'}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-wheat-100 border border-wheat-400 rounded-full text-[11px] font-bold text-soil-800">
            NASA Space Apps Challenge 2026
          </div>
        </div>

        {/* 1-Click Demo Login Box (For Instant Demonstration) */}
        <div className="mb-5 bg-gradient-to-br from-wheat-100 via-amber-50 to-cream-50 border-2 border-wheat-500 rounded-3xl p-4 shadow-tactile text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-wheat-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-wheat-600" />
            <span>{isTamil ? 'மாதிரி பண்ணை விரைவு உள்நுழைவு' : 'Instant 1-Click Demo Login'}</span>
          </div>
          <p className="text-[11px] text-soil-700 mb-2.5 font-medium">
            {isTamil ? 'பதிவு செய்யாமல் நேரடியாக தஞ்சாவூர் காவிரி டெல்டா பண்ணையை சோதிக்கலாம்:' : 'Test directly with preloaded Cauvery Delta NASA datasets:'}
          </p>
          <button
            onClick={() => handleDemo('tn')}
            disabled={loading}
            className="btn-gold w-full text-xs sm:text-sm font-extrabold py-2.5 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isTamil ? 'முத்துவேல் பண்ணை (தஞ்சாவூர் டெல்டா)' : 'Enter as Muthuvel (Thanjavur Delta)'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Standard Email & Password Card with Login/Register Tabs */}
        <div className="card-heartland">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-cream-200 rounded-2xl border border-soil-300">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                !isRegistering
                  ? 'bg-field-600 text-cream-50 shadow-sm'
                  : 'text-soil-700 hover:text-soil-900'
              }`}
            >
              {isTamil ? 'உள்நுழைவு (Login)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                isRegistering
                  ? 'bg-field-600 text-cream-50 shadow-sm'
                  : 'text-soil-700 hover:text-soil-900'
              }`}
            >
              {isTamil ? 'புதிய பதிவு (Register)' : 'Register'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl p-3 mb-4 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Input (Register Only) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-soil-700 mb-1">
                  {isTamil ? 'விவசாயி / பண்ணையின் பெயர்' : 'Farmer / Farm Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTamil ? 'எ.கா. முத்துவேல் அல்லது செல்வம் பண்ணை' : 'e.g. Muthuvel / Green Valley Farm'}
                    required={isRegistering}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'மின்னஞ்சல் முகவரி (Email Address)' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {isTamil ? 'கடவுச்சொல் (Password)' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-soil-400 hover:text-soil-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone (Optional for Register) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-soil-700 mb-1">
                  {isTamil ? 'கைபேசி எண் (விருப்பத்தேர்வு - Phone Optional)' : 'Mobile Phone (Optional)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="94433-12345"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm sm:text-base font-extrabold mt-2 py-3 shadow-tactile active:scale-95 transition"
            >
              {loading 
                ? (isTamil ? 'செயலாக்குகிறது...' : 'Processing...') 
                : isRegistering 
                  ? (isTamil ? 'கணக்கு உருவாக்கு ➔ நில விவரம் தொடங்கு' : 'Create Account ➔ Start Farm Setup') 
                  : (isTamil ? 'உள்நுழைக ➔ பண்ணையைக் காண்க' : 'Sign In ➔ View My Farm')}
            </button>
          </form>

          {/* Quick Switch Hint */}
          <div className="text-center mt-3 pt-3 border-t border-soil-200">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs font-bold text-field-700 hover:text-field-900 underline"
            >
              {isRegistering
                ? (isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Sign in')
                : (isTamil ? 'புதிய விவசாயியா? புதிய கணக்கு தொடங்குக' : 'New farmer? Create an account')}
            </button>
          </div>
        </div>

        {/* Security & Provenance Footer */}
        <div className="text-center text-[11px] text-soil-600 mt-5 space-y-1">
          <p className="flex items-center justify-center gap-1 font-semibold text-soil-700">
            <Shield className="w-3.5 h-3.5 text-field-600" />
            <span>{isTamil ? 'பாதுகாப்பான விவசாய தரவு மேலாண்மை' : 'Secure Agricultural Intelligence'}</span>
          </p>
          <p>NASA POWER • MODIS Terra NDVI • USDA/TNAU Soil Surveys • NASA GIBS</p>
        </div>
      </div>
    </div>
  );
}
