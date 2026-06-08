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
            { label: 'Profile', icon: '/icons/info.svg', href: user ? `/@${user.username}` : '/auth/login' },
            { label: 'Houses', icon: '/icons/house-chimney.svg', href: '/find/houses' },
            { label: 'Commercial Buildings', icon: '/icons/apartment.svg', href: '/find/commercial-buildings' },
            { label: 'Agencies', icon: '/icons/land-location.svg', href: '/agencies' },
            { label: 'Chat', icon: '/icons/note.svg', href: user ? '/chat' : '/auth/login' },
            { label: 'Favourites', icon: '/icons/note.svg', href: user ? `/@${user.username}/saved` : '/auth/login' },
            ...(user ? [{ label: 'Manage', icon: '/icons/info.svg', href: '/manage' }] : []),
        ]
    },
    {
        title: 'Insights',
        items: [
            { label: 'Market Trends', icon: '/icons/growth-chart-invest.svg', href: '/market' },
            { label: 'Blogs/Guide', icon: '/icons/note.svg', href: '/blog' },
        ]
    },
    {
        title: 'Tools',
        items: [
            { label: 'Utilities', icon: '/icons/convert-shapes.svg', href: '/utility' },
            { label: 'Unit Converter', icon: '/icons/convert-shapes.svg', href: '/utility/unit-converter' },
            { label: 'Date Converter', icon: '/icons/calendar.svg', href: '/utility/date-converter' },
            { label: 'EMI Calculator', icon: '/icons/sack-dollar.svg', href: '/utility/emi-calculator' },
        ]
    },
    {
        title: 'Company',
        items: [
            { label: 'About Us', icon: '/icons/info.svg', href: '/about' },
            { label: 'Careers', icon: '/icons/info.svg', href: '/careers' },
            { label: 'Terms', icon: '/icons/note.svg', href: '/terms' },
            { label: 'Privacy', icon: '/icons/info.svg', href: '/terms/privacy' },
            { label: 'Help Center', icon: '/icons/info.svg', href: '/support' },
        ]
    }
];

export const managementMenuGroups = (user: any): MenuGroup[] => {
    const roleName = user?.role?.role || user?.role?.name || '';
    const isUserAdmin = user?.type === 'admin' || roleName.toLowerCase().includes('admin');
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
                { label: 'Dashboard', icon: '/icons/growth-chart-invest.svg', href: '/manage' },
                // Properties: Visible to Admin, Agency, Agent
                ...((isUserAdmin || isAgency || isAgent) ? [{ label: 'Properties', icon: '/icons/house-chimney.svg', href: '/manage/properties' }] : []),
                // Requirements: Visible to Admin, Agency, Agent
                ...((isUserAdmin || isAgency || isAgent) ? [{ label: 'Requirements', icon: '/icons/note.svg', href: '/manage/requirements' }] : []),
                { label: 'Chat', icon: '/icons/note.svg', href: '/chat' },
                { label: 'Notifications', icon: '/icons/info.svg', href: '/manage/notifications' },
            ]
        }
    ];

    // Content Management (Admin & Agency)
    if (isUserAdmin && !isSwitchedAccount) {
        groups.push({
            title: 'Content',
            items: [
                { label: 'Featured', icon: '/icons/growth-chart-invest.svg', href: '/manage/featured' },
                { label: 'Collections', icon: '/icons/note.svg', href: '/manage/collections' },
                { label: 'Advertisements', icon: '/icons/info.svg', href: '/manage/advertisements' },
                { label: 'Newsletter', icon: '/icons/note.svg', href: '/manage/newsletter' },
            ]
        });
    } else if (isAgency || isSwitchedAccount) {
        groups.push({
            title: 'Content',
            items: [
                { label: 'Featured', icon: '/icons/growth-chart-invest.svg', href: '/manage/featured' },
                { label: 'Collections', icon: '/icons/note.svg', href: '/manage/collections' },
                { label: 'Advertisements', icon: '/icons/info.svg', href: '/manage/advertisements' },
            ]
        });
    }

    // User Management
    const userManagementItems: MenuItem[] = [];
    if (isUserAdmin && !isSwitchedAccount) {
        userManagementItems.push(
            { label: 'Users', icon: '/icons/info.svg', href: '/manage/accounts' },
            { label: 'Agents', icon: '/icons/info.svg', href: '/manage/accounts/agents' },
            { label: 'Agencies', icon: '/icons/apartment.svg', href: '/manage/accounts/agencies' },
            { label: 'Banks', icon: '/icons/sack-dollar.svg', href: '/manage/accounts/banks' },
            { label: 'Advertisers', icon: '/icons/info.svg', href: '/manage/accounts/advertisers' }
        );
    } else if (isAgency || isSwitchedAccount) {
        // Agency can manage their own agents
        userManagementItems.push(
            { label: 'My Agents', icon: '/icons/info.svg', href: '/manage/accounts/agents' }
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
                { label: 'Site', icon: '/icons/info.svg', href: '/manage/site' },
                { label: 'About', icon: '/icons/info.svg', href: '/manage/about' },
                { label: 'Careers', icon: '/icons/info.svg', href: '/manage/careers' },
                { label: 'Support', icon: '/icons/info.svg', href: '/manage/support' },
                { label: 'Blog', icon: '/icons/note.svg', href: '/manage/blog' },
                { label: 'Files', icon: '/icons/note.svg', href: '/manage/files' },
                { label: 'Errors', icon: '/icons/info.svg', href: '/manage/errors' },
            ]
        });
    }

    // Configuration
    const configItems: MenuItem[] = [];
    if (isUserAdmin && !isSwitchedAccount) {
        configItems.push({ label: 'Permissions', icon: '/icons/info.svg', href: '/manage/permissions' });
    }
    if (isAgency || isSwitchedAccount) {
        configItems.push({ label: 'Agency Config', icon: '/icons/info.svg', href: '/manage/config' });
    }
    
    if (configItems.length > 0) {
        groups.push({
            title: 'Configuration',
            items: configItems
        });
    }

    // Account Section
    const accountItems: MenuItem[] = [
        { label: 'Subscriptions', icon: '/icons/sack-dollar.svg', href: '/manage/subscriptions' },
    ];

    if (!isSwitchedAccount) {
        accountItems.push(
            { label: 'Logins', icon: '/icons/info.svg', href: '/manage/logins' },
            { label: 'Activity', icon: '/icons/growth-chart-invest.svg', href: '/manage/activity' }
        );
    }

    accountItems.push({ label: 'LogOut', icon: '/icons/info.svg', href: '/auth/logout' });

    groups.push({
        title: 'Account',
        items: accountItems
    });

    return groups;
};

export const bottomNavItems = (user: any): MenuItem[] => [
    { label: 'Home', icon: '/icons/house-chimney.svg', href: '/' },
    { label: 'Search', icon: '/icons/land-layer-location.svg', href: '/search' },
    { label: 'Post', icon: '/icons/note.svg', href: '/post' },
    { label: 'Saved', icon: '/icons/note.svg', href: user ? `/@${user.username}/saved` : '/auth/login' },
    { label: 'Menu', icon: '/icons/info.svg', href: '#menu' }
];

export const footerPlatformItems: MenuItem[] = [
    { label: 'Browse Properties', href: '/search' },
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
