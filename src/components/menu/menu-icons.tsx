import type { ReactNode, SVGProps } from 'react';

export type MenuIconProps = SVGProps<SVGSVGElement>;

function createIcon(path: ReactNode) {
    return function Icon(props: MenuIconProps) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                {...props}
            >
                {path}
            </svg>
        );
    };
}

export const UserCircleIcon = createIcon(
    <>
        <path d="M18 20a6 6 0 0 0-12 0" />
        <circle cx="12" cy="10" r="4" />
    </>
);

export const HomeIcon = createIcon(
    <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
    </>
);

export const BuildingIcon = createIcon(
    <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
    </>
);

export const UsersIcon = createIcon(
    <>
        <path d="M16 20a4 4 0 0 0-8 0" />
        <circle cx="12" cy="11" r="3.5" />
        <path d="M20 19a3.5 3.5 0 0 0-3-3.4" />
        <path d="M4 19a3.5 3.5 0 0 1 3-3.4" />
    </>
);

export const HeartIcon = createIcon(
    <path d="m12 20-1.2-1.1C5.4 14 2 10.9 2 7.2A4.2 4.2 0 0 1 6.3 3 4.8 4.8 0 0 1 12 6.1 4.8 4.8 0 0 1 17.7 3 4.2 4.2 0 0 1 22 7.2c0 3.7-3.4 6.8-8.8 11.7Z" />
);

export const SettingsIcon = createIcon(
    <>
        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
    </>
);

export const TrendingUpIcon = createIcon(
    <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M14 6h7v7" />
    </>
);

export const NewspaperIcon = createIcon(
    <>
        <path d="M5 5.5A2.5 2.5 0 0 0 2.5 8v9A3 3 0 0 0 5.5 20H18" />
        <path d="M5 4h12a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3" />
        <path d="M7.5 9h7" />
        <path d="M7.5 12.5h7" />
        <path d="M7.5 16h4" />
    </>
);

export const ToolsIcon = createIcon(
    <>
        <path d="m14 7 3-3 3 3-3 3" />
        <path d="M17 7 7 17" />
        <path d="m4 14 6 6" />
        <path d="M3 21h6" />
    </>
);

export const ArrowLeftRightIcon = createIcon(
    <>
        <path d="M8 7H3" />
        <path d="m5 4-3 3 3 3" />
        <path d="M16 17h5" />
        <path d="m19 14 3 3-3 3" />
        <path d="M6 17h12" />
        <path d="M18 7H6" />
    </>
);

export const CalendarIcon = createIcon(
    <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
    </>
);

export const CalculatorIcon = createIcon(
    <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 11h2M14 11h2M8 15h2M14 15h2" />
    </>
);

export const InfoIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v5" />
        <path d="M12 7h.01" />
    </>
);

export const BriefcaseIcon = createIcon(
    <>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
        <path d="M3 12h18" />
    </>
);

export const FileTextIcon = createIcon(
    <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6M9 9h2" />
    </>
);

export const ShieldIcon = createIcon(
    <>
        <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6Z" />
        <path d="m9.5 12 1.7 1.7 3.8-4" />
    </>
);

export const HelpCircleIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-2.9 2.1-2.9 4" />
        <path d="M12 17h.01" />
    </>
);

export const LayoutDashboardIcon = createIcon(
    <>
        <rect x="3" y="3" width="7" height="8" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="11" width="7" height="10" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
);

export const ClipboardIcon = createIcon(
    <>
        <rect x="6" y="4" width="12" height="17" rx="2" />
        <path d="M9 4.5h6a1 1 0 0 0 1-1V3h-8v.5a1 1 0 0 0 1 1Z" />
        <path d="M9 10h6M9 14h6M9 18h4" />
    </>
);

export const BellIcon = createIcon(
    <>
        <path d="M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
        <path d="M10 20a2 2 0 0 0 4 0" />
    </>
);

export const StarIcon = createIcon(
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z" />
);

export const FolderIcon = createIcon(
    <>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </>
);

export const MegaphoneIcon = createIcon(
    <>
        <path d="M4 11v2a2 2 0 0 0 2 2h1l2 4h2l-1.5-4H12l7 3V6l-7 3H6a2 2 0 0 0-2 2Z" />
    </>
);

export const MailIcon = createIcon(
    <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
    </>
);

export const UserSquareIcon = createIcon(
    <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M8 17a4.5 4.5 0 0 1 8 0" />
    </>
);

export const LandmarkIcon = createIcon(
    <>
        <path d="M3 10h18" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
        <path d="M2 21h20" />
        <path d="m12 3 9 4H3Z" />
    </>
);

export const PenSquareIcon = createIcon(
    <>
        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        <path d="M21 12.5V19a2 2 0 0 1-2 2h-6.5" />
        <path d="M3 11.5V5a2 2 0 0 1 2-2h6.5" />
        <path d="m20.2 6.8-8.6 8.6L8 16l.6-3.6 8.6-8.6a1.9 1.9 0 1 1 3 3Z" />
    </>
);

export const CreditCardIcon = createIcon(
    <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
    </>
);

export const KeyIcon = createIcon(
    <>
        <circle cx="8" cy="15" r="4" />
        <path d="M12 15h9" />
        <path d="M18 12v6M21 13.5v3" />
    </>
);

export const ActivityIcon = createIcon(
    <path d="M3 12h4l2.5-5 4 10 2.5-5H21" />
);

export const LogOutIcon = createIcon(
    <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </>
);

export const CompassIcon = createIcon(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 6-6 2 2-6 6-2Z" />
    </>
);

export const MapIcon = createIcon(
    <>
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15M15 6v15" />
    </>
);

export const PlusIcon = createIcon(
    <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </>
);

export const MenuIcon = createIcon(
    <>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </>
);
