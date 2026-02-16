import { ReactNode } from 'react';

// Menu Items Configuration

export interface MenuItem {
    label: string;
    href: string;
    icon?: string;
    requiresAuth?: boolean;
    hideIfAuth?: boolean;
}

export interface MenuGroup {
    title?: string;
    items: MenuItem[];
}

export const headerMenuItems: MenuItem[] = [
    // Currently header items are hardcoded in the component structure (Logo, Search, Profile)
    // Adding placeholder for future extensibility if needed
];

export const sidebarMenuGroups = (user: any): MenuGroup[] => [
    {
        title: 'Platform',
        items: [
            { label: 'Profile', icon: '👤', href: user ? `/@${user.username}` : '/auth/login' },
            { label: 'Houses', icon: '🏠', href: '/find/houses' },
            { label: 'Commercial Buildings', icon: '🏢', href: '/find/commercial-buildings' },
            { label: 'Agencies', icon: '🧑‍💼', href: '/agencies' },
            { label: 'Favourites', icon: '❤️', href: user ? `/@${user.username}/saved` : '/auth/login' },
            ...(user ? [{ label: 'Manage', icon: '⚙️', href: '/manage' }] : []),
        ]
    },
    {
        title: 'Insights',
        items: [
            { label: 'Market Trends', icon: '📈', href: '/market' },
            { label: 'Blogs/Guide', icon: '📰', href: '/blog' },
        ]
    },
    {
        title: 'Tools',
        items: [
            { label: 'Utilities', icon: '🛠️', href: '/utility' },
            { label: 'Unit Converter', icon: '🔄', href: '/utility/unit-converter' },
            { label: 'Date Converter', icon: '📅', href: '/utility/date-converter' },
            { label: 'EMI Calculator', icon: '💰', href: '/utility/emi-calculator' },
        ]
    },
    {
        title: 'Company',
        items: [
            { label: 'About Us', icon: 'ℹ️', href: '/about' },
            { label: 'Careers', icon: '💼', href: '/careers' },
            { label: 'Terms', icon: '📝', href: '/terms' },
            { label: 'Privacy', icon: '🛡️', href: '/terms/privacy' },
            { label: 'Help Center', icon: '❓', href: '/support' },
        ]
    }
];

export const managementMenuGroups = (user: any): MenuGroup[] => {
    const isUserAdmin = user?.type === 'admin' || user?.role?.name?.toLowerCase().includes('admin');
    const isAgency = user?.type === 'agency';
    const isAgent = user?.type === 'agent';
    const isBank = user?.type === 'bank';
    const isAdvertiser = user?.type === 'advertiser';
    const isSwitchedAccount = user?.operatingId != null; // Check if user has switched profile

    // Base menu for everyone who can access manage
    const groups: MenuGroup[] = [
        {
            title: 'Overview',
            items: [
                { label: 'Dashboard', icon: '📊', href: '/manage' },
                // Properties: Visible to Admin, Agency, Agent
                ...((isUserAdmin || isAgency || isAgent) ? [{ label: 'Properties', icon: '🏠', href: '/manage/properties' }] : []),
                // Requirements: Visible to Admin, Agency, Agent
                ...((isUserAdmin || isAgency || isAgent) ? [{ label: 'Requirements', icon: '📋', href: '/manage/requirements' }] : []),
                { label: 'Notifications', icon: '🔔', href: '/manage/notifications' },
            ]
        }
    ];

    // Content Management (Admin & Agency)
    if (isUserAdmin && !isSwitchedAccount) {
        groups.push({
            title: 'Content',
            items: [
                { label: 'Featured', icon: '⭐', href: '/manage/featured' },
                { label: 'Collections', icon: '📁', href: '/manage/collections' },
                { label: 'Advertisements', icon: '📢', href: '/manage/advertisements' },
                { label: 'Newsletter', icon: '📧', href: '/manage/newsletter' },
            ]
        });
    } else if (isAgency || isSwitchedAccount) {
        groups.push({
            title: 'Content',
            items: [
                { label: 'Featured', icon: '⭐', href: '/manage/featured' },
                { label: 'Collections', icon: '📁', href: '/manage/collections' },
                { label: 'Advertisements', icon: '📢', href: '/manage/advertisements' },
            ]
        });
    }

    // User Management
    const userManagementItems: MenuItem[] = [];
    if (isUserAdmin && !isSwitchedAccount) {
        userManagementItems.push(
            { label: 'Users', icon: '👥', href: '/manage/accounts' },
            { label: 'Agents', icon: '🕴️', href: '/manage/accounts/agents' },
            { label: 'Agencies', icon: '🏢', href: '/manage/accounts/agencies' },
            { label: 'Banks', icon: '🏦', href: '/manage/accounts/banks' },
            { label: 'Advertisers', icon: '📢', href: '/manage/accounts/advertisers' }
        );
    } else if (isAgency || isSwitchedAccount) {
        // Agency can manage their own agents
        userManagementItems.push(
            { label: 'My Agents', icon: '🕴️', href: '/manage/accounts/agents' }
        );
    }

    if (userManagementItems.length > 0) {
        groups.push({
            title: 'User Management',
            items: userManagementItems
        });
    }

    // System (Admin only)
    if (isUserAdmin && !isSwitchedAccount) {
        groups.push({
            title: 'System',
            items: [
                { label: 'About', icon: 'ℹ️', href: '/manage/about' },
                { label: 'Careers', icon: '💼', href: '/manage/careers' },
                { label: 'Support', icon: '🔧', href: '/manage/support' },
                { label: 'Blog', icon: '📝', href: '/manage/blog' },
            ]
        });
    }

    // Configuration
    const configItems: MenuItem[] = [];
    if (isUserAdmin && !isSwitchedAccount) {
        configItems.push({ label: 'Permissions', icon: '🛡️', href: '/manage/permissions' });
    }
    
    if (configItems.length > 0) {
        groups.push({
            title: 'Configuration',
            items: configItems
        });
    }

    // Account Section
    const accountItems: MenuItem[] = [
        { label: 'Subscriptions', icon: '💳', href: '/manage/subscriptions' },
    ];

    if (!isSwitchedAccount) {
        accountItems.push(
            { label: 'Logins', icon: '🔐', href: '/manage/logins' },
            { label: 'Activity', icon: '⚡', href: '/manage/activity' }
        );
    }

    accountItems.push({ label: 'LogOut', icon: '🚪', href: '/auth/logout' });

    groups.push({
        title: 'Account',
        items: accountItems
    });

    return groups;
};

export const bottomNavItems = (user: any): MenuItem[] => [
    { label: 'Home', icon: '🏠', href: '/' },
    { label: 'Explore', icon: '🧭', href: '/explore' },
    { label: 'Post', icon: '➕', href: '/sell' },
    { label: 'Saved', icon: '❤️', href: user ? `/@${user.username}/saved` : '/auth/login' },
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
