import React from 'react';

interface SocialLinkItem {
  name: string;
  url: string;
  label: string;
  username: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/rizwanbukhari-dev',
    label: 'GitHub — rizwanbukhari-dev',
    username: 'rizwanbukhari-dev',
    icon: ({ className = 'w-4 h-4' }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/rizwan-bukahri-dev-9a9bba441/',
    label: 'LinkedIn — Rizwan Bukhari-dev',
    username: 'Rizwan Bukhari-dev',
    icon: ({ className = 'w-4 h-4' }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/rizwanbukhari.dev/',
    label: 'Instagram — @rizwanbukhari.dev',
    username: 'rizwanbukhari.dev',
    icon: ({ className = 'w-4 h-4' }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61594112017570',
    label: 'Facebook — Rizwan Bukhari Dev',
    username: 'Rizwan Bukhari Dev',
    icon: ({ className = 'w-4 h-4' }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

interface SocialLinksProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showHeading?: boolean;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  className = '',
  size = 'md',
  showHeading = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-9 h-9 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 ${className}`}>
      {showHeading && (
        <span className="text-[11px] font-mono text-[#989A92] uppercase tracking-wider font-semibold">
          Connect with me:
        </span>
      )}
      <div className="flex items-center gap-1.5 sm:gap-2" role="list" aria-label="Social media channels">
        {SOCIAL_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              title={`${item.name} (${item.username})`}
              className={`inline-flex items-center justify-center rounded-lg bg-[#272824] border border-[#353630] text-[#989A92] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] hover:bg-[#2E2F2A] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] active:scale-95 cursor-pointer shadow-xs ${sizeClasses[size]}`}
            >
              <Icon className={iconSizes[size]} />
            </a>
          );
        })}
      </div>
    </div>
  );
};
