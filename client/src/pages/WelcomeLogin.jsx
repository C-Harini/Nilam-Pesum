import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { Sprout, Phone, Lock, User, Sparkles, Volume2, ArrowRight } from 'lucide-react';

export default function WelcomeLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const { speak } = useVoice();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      const { greeting } = await demoLogin();
      speak(greeting || "Welcome to Nilam Pesum. Your Story County farm is loaded.");
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
      setError('Please provide your phone number and 4-digit PIN.');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
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
      <div className="max-w-md w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-field-700 text-wheat-400 mx-auto flex items-center justify-center shadow-tactile mb-4 border-2 border-wheat-500/30">
            <Sprout className="w-12 h-12" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-soil-900 tracking-tight">
            Nilam Pesum
          </h1>
          <p className="text-sm font-medium text-field-800 mt-1">
            Voice-First Farm Advisory • NASA Earth Observations
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-wheat-100 border border-wheat-400 rounded-full text-[11px] font-bold text-soil-800">
            NASA Space Apps Challenge 2026: Field Shift
          </div>
        </div>

        {/* Demo Login Button for Judges (High Prominence) */}
        <div className="mb-6 bg-gradient-to-br from-wheat-100 to-cream-50 border-2 border-wheat-500 rounded-3xl p-5 shadow-tactile text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-wheat-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-wheat-600" />
            Judges & Reviewers One-Click Demo
          </div>
          <p className="text-xs text-soil-700 mb-3 font-medium">
            Instantly enters the live application using verified NASA POWER & MODIS datasets for Story County, Iowa.
          </p>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="btn-gold w-full text-base font-extrabold"
          >
            {loading ? 'Activating Demo...' : 'Enter Demo as John Miller (PIN 1234)'}
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Standard Phone/PIN Card */}
        <div className="card-heartland">
          <div className="flex justify-between items-center mb-5 border-b border-soil-200 pb-3">
            <h2 className="font-display font-bold text-lg text-soil-900">
              {isRegistering ? 'Register New Farm' : 'Farmer Sign In'}
            </h2>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs font-bold text-field-700 hover:text-field-900"
            >
              {isRegistering ? 'Switch to Sign In' : 'Create Account'}
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
                  Farmer / Farm Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full pl-9 pr-3 py-3 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-soil-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 515-555-0199"
                  className="w-full pl-9 pr-3 py-3 text-sm bg-cream-50 border border-soil-300 rounded-xl text-soil-900 focus:outline-none focus:ring-2 focus:ring-field-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-soil-700 mb-1">
                4-Digit Security PIN
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
              {loading ? 'Authenticating...' : isRegistering ? 'Register Farm Profile' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer Notes */}
        <div className="text-center text-[11px] text-soil-600 mt-6 space-y-1">
          <p>Authentic Agroclimatology & Satellite Radiometry</p>
          <p>NASA POWER • MODIS Terra NDVI • USDA SSURGO • NASA GIBS</p>
        </div>
      </div>
    </div>
  );
}
