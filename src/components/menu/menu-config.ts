import { ReactNode } from 'react';

// Menu Items Configuration

export interface MenuItem {
    label: string;
    href: string;
    icon?: string;
    requiresAuth?: boolean;
    hideIfAuth?: boolean;
}

export const headerMenuItems: MenuItem[] = [
    // Currently header items are hardcoded in the component structure (Logo, Search, Profile)
    // Adding placeholder for future extensibility if needed
];

export const sidebarMainItems = (user: any): MenuItem[] => [
    { label: 'Profile', icon: '👤', href: user ? `/@${user.username}` : '/login' },
    { label: 'Houses', icon: '🏠', href: '/find/houses' },
    { label: 'Commercial Buildings', icon: '🏢', href: '/find/commercial-buildings' },
    { label: 'Agencies', icon: '🧑‍💼', href: '/agencies' },
    { label: 'Favourites', icon: '❤️', href: user ? `/@${user.username}/saved` : '/login' },
    { label: 'Market Trends', icon: '📈', href: '/market' },
    { label: 'Blogs/Guide', icon: '📰', href: '/blog' },
    { label: 'Utilities', icon: '🛠️', href: '/utility' },
    { label: 'Unit Converter', icon: '🔄', href: '/utility/unit-converter' },
    { label: 'Date Converter', icon: '📅', href: '/utility/date-converter' },
    { label: 'EMI Calculator', icon: '💰', href: '/utility/emi-calculator' },
    ...(user ? [{ label: 'Manage About', icon: '📝', href: '/manage/about' }] : []),
];

export const sidebarSecondaryItems: MenuItem[] = [
    { label: 'About Us', icon: 'ℹ️', href: '/about' },
    { label: 'Careers', icon: '💼', href: '/careers' },
    { label: 'Terms', icon: '📝', href: '/terms' },
    { label: 'Privacy', icon: '🛡️', href: '/terms/privacy' },
    { label: 'Help Center', icon: '❓', href: '/support' },
    { label: 'Settings', icon: '⚙️', href: '/manage/settings' },
];

export const bottomNavItems = (user: any): MenuItem[] => [
    { label: 'Home', icon: '🏠', href: '/' },
    { label: 'Explore', icon: '🧭', href: '/explore' },
    { label: 'Post', icon: '➕', href: '/sell' },
    { label: 'Saved', icon: '❤️', href: user ? `/@${user.username}/saved` : '/login' },
    { label: 'Menu', icon: '☰', href: '#menu' }
];

export const footerPlatformItems: MenuItem[] = [
    { label: 'Browse Properties', href: '/explore' },
    { label: 'Partner Agencies', href: '/agencies' },
    { label: 'Listing Plans', href: '/pricing' },
    { label: 'Post Property', href: '/sell' },
    { label: 'Post Requirements', href: '/requirements' },
    { label: 'Platinum Club', href: '/membership' },
];

export const footerResourceItems: MenuItem[] = [
    { label: 'Market Reports', href: '/blog' },
    { label: 'Buying Guide', href: '/guide' },
    { label: 'Concierge Support', href: '/contact' },
    { label: 'Help Center', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
];
