interface LogoProps {
    className?: string;
}

/**
 * Golden Bite mark: a bitten apple (the "bite") with a moss-green leaf accent.
 * The apple body uses currentColor so it can sit on any badge background;
 * the bite is a true cutout via mask so it shows whatever is behind it.
 */
export default function Logo({ className = "h-5 w-5" }: LogoProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
            <mask id="golden-bite-mask">
                <rect width="24" height="24" fill="white" />
                <circle cx="18.3" cy="11.3" r="3.4" fill="black" />
            </mask>
            <g mask="url(#golden-bite-mask)">
                <circle cx="12" cy="13.3" r="7.3" fill="currentColor" />
            </g>
            <path
                d="M12 6.1c.1-1.5.7-2.8 1.8-3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            <ellipse
                cx="10.3"
                cy="3"
                rx="2.1"
                ry="1.05"
                transform="rotate(20 10.3 3)"
                fill="#4F7350"
            />
        </svg>
    );
}
