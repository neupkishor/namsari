import React from 'react';

export type MenuIconValue = string;

export function MenuIcon({ icon, label, active = false, className = '' }: { icon?: MenuIconValue; label: string; active?: boolean; className?: string; }) {
    if (!icon) return null;

    const isAsset = icon.startsWith('/');
    const stateClassName = active ? 'opacity-100' : 'opacity-80';

    if (isAsset) {
        return (
            <img
                src={icon}
                alt=""
                aria-hidden="true"
                className={`${className} ${stateClassName} w-[1.1em] h-[1.1em] object-contain block [filter:brightness(0)_saturate(100%)_invert(11%)_sepia(100%)_saturate(2770%)_hue-rotate(353deg)_brightness(83%)_contrast(114%)]`}
            />
        );
    }

    return (
        <span className={`${className} ${stateClassName}`} aria-hidden="true">
            {icon}
        </span>
    );
}