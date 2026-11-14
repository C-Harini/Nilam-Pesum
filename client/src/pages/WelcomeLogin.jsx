import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useTranslation } from 'react-i18next';
import { Sprout, Phone, Lock, User, Sparkles, Volume2, ArrowRight, Globe } from 'lucide-react';

export default function WelcomeLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const { speak } = useVoice();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ta' ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('nilam_pesum_lang', nextLang);
  };

  const handleDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      const { greeting } = await demoLogin();
      speak(greeting || (i18n.language === 'ta'
        ? "வணக்கம்! நிலம் பேசும் தளத்திற்கு நல்வரவு. தஞ்சாவூர் காவிரி டெல்டா வயல் நாசா நேரடித் தரவுகளுடன் தயாராக உள்ளது."
        : "Welcome to Nilam Pesum. Your Thanjavur Cauvery Delta Farm is loaded with NASA data."));
      navigate('/today');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !pin) {
      setError(i18n.language === 'ta' ? 'தயவுசெய்து கைபேசி எண் மற்றும் 4-இலக்க PIN உள்ளிடவும்.' : 'Please provide phone and 4-digit PIN.');
      return;
    }
    if (pin.length !== 4) {
      setError(i18n.language === 'ta' ? 'PIN சரியாக 4 இலக்கங்களாக இருக்க வேண்டும்.' : 'PIN must be exactly 4 digits.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isRegistering) {
        const { greeting } = await register(phone, pin, name);
        speak(greeting);
        navigate('/onboarding');
      } else {
        const { greeting } = await login(phone, pin);
        speak(greeting);
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
      {/* Top Language Toggle */}
      <div className="max-w-md w-full mx-auto flex justify-end mb-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-wheat-100 hover:bg-wheat-200 text-soil-900 text-xs font-bold border border-wheat-400 shadow-sm active:scale-95 transition"
        >
          <Globe className="w-4 h-4 text-wheat-700" />
          <span>{i18n.language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</span>
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
            {t('app.subtitle')}
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-wheat-100 border border-wheat-400 rounded-full text-[11px] font-bold text-soil-800">
            {t('app.challenge')}
          </div>
        </div>

        {/* Demo Login Button for Judges (High Prominence) */}
        <div className="mb-6 bg-gradient-to-br from-wheat-100 to-cream-50 border-2 border-wheat-500 rounded-3xl p-5 shadow-tactile text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-wheat-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-wheat-600" />
            {t('auth.btn_demo')}
          </div>
          <p className="text-xs text-soil-700 mb-3 font-medium">
            {t('auth.demo_hint')}
          </p>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="btn-gold w-full text-sm sm:text-base font-extrabold"
          >
            {loading ? t('common.loading') : (i18n.language === 'ta' ? 'முத்துவேல் பண்ணையில் நுழைக (தஞ்சாவூர் டெல்டா)' : 'Enter Demo as Muthuvel (Thanjavur Delta)')}
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Standard Phone/PIN Card */}
        <div className="card-heartland">
          <div className="flex justify-between items-center mb-5 border-b border-soil-200 pb-3">
            <h2 className="font-display font-bold text-base text-soil-900">
              {isRegistering ? t('auth.btn_register') : t('auth.btn_login')}
            </h2>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs font-bold text-field-700 hover:text-field-900"
            >
              {isRegistering ? (i18n.language === 'ta' ? 'உள்நுழைய மாறுக' : 'Switch to Sign In') : (i18n.language === 'ta' ? 'புதிய கணக்கு' : 'Create Account')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-soil-700 mb-1">
                  {i18n.language === 'ta' ? 'விவசாயி / பண்ணையின் பெயர்' : 'Farmer / Farm Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={i18n.language === 'ta' ? 'எ.கா. முத்துவேல்' : 'e.g. Muthuvel'}
                    className="w-full pl-9 pr-3 py-3 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {t('auth.phone_label')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 94433-12345"
                  className="w-full pl-9 pr-3 py-3 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                {t('auth.pin_label')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-9 pr-3 py-3 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-field-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base font-bold mt-2"
            >
              {loading ? t('common.loading') : isRegistering ? t('auth.btn_register') : t('auth.btn_login')}
            </button>
          </form>
        </div>

        {/* Footer Notes */}
        <div className="text-center text-[11px] text-soil-600 mt-6 space-y-1">
          <p>{i18n.language === 'ta' ? 'அதிகாரப்பூர்வ நாசா விண்வெளி & புவி கண்காணிப்புத் தரவுகள்' : 'Authentic Agroclimatology & Satellite Radiometry'}</p>
          <p>NASA POWER • MODIS Terra NDVI • USDA/TNAU Soil • NASA GIBS</p>
        </div>
      </div>
    </div>
  );
}
