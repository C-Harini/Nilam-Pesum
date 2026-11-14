import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, CalendarRange, CalendarCheck, MessageSquare, Clock } from 'lucide-react';
import VoiceMicPill from './VoiceMicPill';

export default function BottomNav() {
  const navItems = [
    { to: '/today', label: 'Field', icon: Sun },
    { to: '/plan', label: 'Plan', icon: CalendarRange },
    { to: '/timemachine', label: 'Time Machine', icon: Clock, special: true },
    { to: '/season', label: 'Season', icon: CalendarCheck },
    { to: '/talk', label: 'Talk', icon: MessageSquare }
  ];

  return (
    <>
      {/* Floating Voice Mic Pill */}
      <VoiceMicPill />

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/98 backdrop-blur border-t border-soil-200 px-2 py-2 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? item.special
                        ? 'text-wheat-700 font-bold bg-wheat-100 scale-105'
                        : 'text-field-800 font-bold bg-field-100 scale-105'
                      : 'text-soil-600 hover:text-soil-900 font-medium'
                  }`
                }
              >
                <Icon className={`w-5 h-5 mb-0.5 ${item.special ? 'text-wheat-600' : ''}`} />
                <span className="text-[10px] leading-tight text-center">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
