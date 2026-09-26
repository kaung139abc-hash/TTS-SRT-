import React from 'react';
import { 
  Globe, FileText, Calculator, Clock, Sparkles, Settings, CheckSquare,
  Youtube, Music2, Facebook, MessageCircle, Send, PhoneCall, MessageSquare,
  Instagram, MapPin, Camera, Headphones, PlusCircle, Smartphone, ShieldCheck,
  Phone, Contact, Play, Mail, HardDrive, Images, Radio,
  Wallet, Coins, CreditCard, Landmark, FolderOpen, Wifi, Swords,
  Crosshair, Gamepad2, Flame, Disc, Tv, Shield, Cloud, Scan, HelpCircle,
  Folder, Compass
} from 'lucide-react';

interface AppIconProps {
  name: string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    // Official Braden Farmer Taskbar Icon (Dual Window)
    case 'Taskbar':
    case 'TaskbarDualWindow':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="12" fill="#1e88e5" />
          <rect x="9" y="11" width="19" height="24" rx="2" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="9" y="11" width="19" height="5.5" rx="2" fill="#ffffff" fillOpacity="0.8" />
          <rect x="20" y="14" width="19" height="24" rx="2" fill="#1565c0" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="20" y="14" width="19" height="5.5" rx="2" fill="#ffffff" />
        </svg>
      );

    case 'Spotify':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <circle cx="24" cy="24" r="22" fill="#1DB954" />
          <path d="M14 18c6.5-2 15-1.5 20.5 2M15 24c5.5-1.8 12.5-1.2 17 1.5M16 29.5c4.5-1.5 10-1 14 1.2" stroke="#121212" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'Telegram':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <circle cx="24" cy="24" r="22" fill="#229ED9" />
          <path d="M11 23.5l23-9-3.5 22-8.5-6-4.5 4.5v-6l13-11.5-16.5 9.5z" fill="#ffffff" />
        </svg>
      );

    case 'TikTok':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#010101" />
          <path d="M28 12v15.5a6.5 6.5 0 11-5.5-6.4V25a3 3 0 102.5 3V12h3a6 6 0 005 5v-3a6 6 0 01-5-2z" fill="#25F4EE" />
          <path d="M29 13v15.5a6.5 6.5 0 11-5.5-6.4V26a3 3 0 102.5 3V13h3a6 6 0 005 5v-3a6 6 0 01-5-2z" fill="#FE2C55" opacity="0.8" />
        </svg>
      );

    case 'v2RayTun':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#181818" />
          <text x="24" y="32" fill="#ffffff" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">V2</text>
        </svg>
      );

    case 'Viber':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#7360F2" />
          <path d="M14 16c0-4 4-6 10-6s10 2 10 6v10c0 4-4 6-10 6l-5 4v-4c-3-1-5-3-5-6V16z" fill="#ffffff" />
          <path d="M20 20c1 0 2 1 2 2m-2-4c3 0 5 2 5 5" stroke="#7360F2" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 25c2 2 4 2 5 1l2 2c-1 1-3 1-5-1s-2-4-1-5l2 2z" fill="#7360F2" />
        </svg>
      );

    case 'VidMate':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#E62117" />
          <path d="M14 14l10 20 10-20h-6l-4 9-4-9z" fill="#ffffff" />
        </svg>
      );

    case 'Tonkeeper':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#141c28" />
          <path d="M24 10l12 11-12 17-12-17z" fill="#0088CC" />
          <path d="M24 10l-6 11 6 17 6-17z" fill="#39B0E5" />
        </svg>
      );

    case 'Security':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#2ECC71" />
          <path d="M24 10l11 5v8c0 8-5 13-11 15-6-2-11-7-11-15v-8l11-5z" fill="#27AE60" />
          <path d="M25 15l-6 10h5l-2 8 8-11h-5l2-7z" fill="#ffffff" />
        </svg>
      );

    case 'Safety':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#ffffff" />
          <circle cx="24" cy="24" r="18" fill="#F4F4F6" />
          <path d="M20 14h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#EA4335" />
          <path d="M24 17l4 4-4 4-4-4z" fill="#1A73E8" />
        </svg>
      );

    case 'Scanner':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#242B35" />
          <path d="M14 19v-5h5m10 0h5v5m0 10v5h-5m-10 0h-5v-5" stroke="#33A1FD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="12" y1="24" x2="36" y2="24" stroke="#00C9A7" strokeWidth="2.5" />
        </svg>
      );

    case 'ServicesFeedback':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#29B6F6" />
          <rect x="12" y="12" width="24" height="24" rx="4" fill="#ffffff" />
          <text x="24" y="29" fill="#29B6F6" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
        </svg>
      );

    case 'ShareMe':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#00B0FF" />
          <path d="M16 24a5 5 0 119 3l-2 2a5 5 0 00-7-5zm16 0a5 5 0 11-9-3l2-2a5 5 0 007 5z" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'Themes':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <defs>
            <linearGradient id="themeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FFA07A" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#themeGrad)" />
          <rect x="14" y="14" width="14" height="10" rx="3" fill="#ffffff" />
          <path d="M21 24v10a2 2 0 002 2h2" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'Weather':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#4FC3F7" />
          <path d="M18 32h14a6 6 0 001-12 8 8 0 00-15-3 6 6 0 000 15z" fill="#ffffff" />
        </svg>
      );

    case 'YouTube':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#FF0000" />
          <polygon points="20,16 32,24 20,32" fill="#ffffff" />
        </svg>
      );

    case 'YTMusic':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <circle cx="24" cy="24" r="22" fill="#FF0000" />
          <circle cx="24" cy="24" r="14" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          <polygon points="21,18 29,24 21,30" fill="#ffffff" />
        </svg>
      );

    case 'MServices':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#ffffff" stroke="#E0E0E0" strokeWidth="1" />
          <text x="24" y="24" fill="#D32F2F" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">M</text>
          <text x="24" y="34" fill="#424242" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Services</text>
        </svg>
      );

    case 'cctube3':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#CC181E" />
          <text x="24" y="30" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CC3</text>
        </svg>
      );

    case 'ProtonVPN':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="11" fill="#6D4AFF" />
          <polygon points="14,14 34,14 24,34" fill="#9D85FF" />
          <polygon points="14,14 24,24 24,34" fill="#ffffff" />
        </svg>
      );

    case 'Settings':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#90A4AE" />
          <circle cx="24" cy="24" r="7" stroke="#ffffff" strokeWidth="3" fill="none" />
          <path d="M24 10v4m0 20v4m-14-14h4m20 0h4m-5.8-9.8l-2.8 2.8m-11.4 11.4l-2.8 2.8m0-17l2.8 2.8m11.4 11.4l2.8 2.8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'FileManager':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#FFA000" />
          <path d="M12 16h8l4 4h12v14a2 2 0 01-2 2H12a2 2 0 01-2-2V18a2 2 0 012-2z" fill="#ffffff" />
        </svg>
      );

    case 'Chrome':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <circle cx="24" cy="24" r="22" fill="#ffffff" />
          <circle cx="24" cy="24" r="9" fill="#1A73E8" />
          <circle cx="24" cy="24" r="20" stroke="#EA4335" strokeWidth="4" strokeDasharray="42 90" fill="none" />
          <circle cx="24" cy="24" r="20" stroke="#FBBC04" strokeWidth="4" strokeDasharray="42 90" strokeDashoffset="-42" fill="none" />
          <circle cx="24" cy="24" r="20" stroke="#34A853" strokeWidth="4" strokeDasharray="42 90" strokeDashoffset="-84" fill="none" />
        </svg>
      );

    case 'PlayStore':
    case 'Play':
      return (
        <svg viewBox="0 0 48 48" className={className}>
          <rect width="48" height="48" rx="12" fill="#ffffff" />
          <path d="M13 11l15 13-15 13z" fill="#00C3FF" />
          <path d="M28 24l-6-6 13 8z" fill="#FFD400" />
          <path d="M28 24l7-4-13 17z" fill="#FF3333" />
          <path d="M13 11l9 13-9 13z" fill="#00E676" opacity="0.9" />
        </svg>
      );

    // Standard Fallbacks
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Phone': return <Phone className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Contact': return <Contact className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'HardDrive': return <HardDrive className={className} />;
    case 'Images': return <Images className={className} />;
    case 'Facebook': return <Facebook className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    case 'Music2': return <Music2 className={className} />;
    case 'Send': return <Send className={className} />;
    case 'PhoneCall': return <PhoneCall className={className} />;
    case 'Instagram': return <Instagram className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'Wallet': return <Wallet className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Headphones': return <Headphones className={className} />;
    case 'Disc': return <Disc className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Calculator': return <Calculator className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'FolderOpen': return <FolderOpen className={className} />;
    case 'Wifi': return <Wifi className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'Crosshair': return <Crosshair className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'PlusCircle': return <PlusCircle className={className} />;
    default: return <Smartphone className={className} />;
  }
};
