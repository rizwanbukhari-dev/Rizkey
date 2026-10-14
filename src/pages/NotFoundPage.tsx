import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { HelpCircle, Home, Keyboard } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center text-center animate-fadeIn py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#272824] border border-[#353630] flex items-center justify-center text-[var(--accent-color)] mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono text-[var(--accent-color)] font-bold uppercase tracking-wider mb-1">
        404 &bull; Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] mb-2">
        Lost in Cyberspace?
      </h1>

      <p className="text-xs sm:text-sm text-[#989A92] leading-relaxed mb-6">
        The route you requested does not exist or has been reorganized into our clean new navigation structure.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center mb-8">
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/test" className="w-full sm:w-auto">
          <Button variant="secondary" size="md" leftIcon={<Keyboard className="w-4 h-4" />}>
            Take Typing Test
          </Button>
        </Link>
      </div>

      <div className="w-full pt-6 border-t border-[#353630] text-xs font-mono text-[#7E8079]">
        <span>Quick Navigation: </span>
        <Link to="/practice" className="text-[#ECEBE4] hover:underline mx-1">Practice</Link> &bull;
        <Link to="/learn" className="text-[#ECEBE4] hover:underline mx-1">Academy</Link> &bull;
        <Link to="/games" className="text-[#ECEBE4] hover:underline mx-1">Games</Link>
      </div>
    </div>
  );
};
