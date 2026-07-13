// ─────────────────────────────────────────────────────────────
// SurfRise — Icon set (Lucide-style, 1.8 stroke, currentColor)
// Kit icons + extras the new screens need.
// ─────────────────────────────────────────────────────────────
const Icon = ({ children, size = 22, strokeWidth = 1.8, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

// — from the kit —
const IconWave = (p) => (<Icon {...p}><path d="M2 14c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2"/><path d="M2 18c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2"/></Icon>);
const IconBoard = (p) => (<Icon {...p}><path d="M12 2C9 7 9 17 12 22 15 17 15 7 12 2Z"/></Icon>);
const IconSun = (p) => (<Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>);
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconProgress = (p) => <Icon {...p}><path d="M3 20l4-8 4 4 4-6 6 10"/></Icon>;
const IconVideo = (p) => <Icon {...p}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 10l5 2-5 2z" fill="currentColor"/></Icon>;
const IconImage = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="1.5"/><path d="M21 16l-5-5-9 9"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
const IconChevronDown = (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></Icon>;
const IconPin = (p) => <Icon {...p}><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Icon>;
const IconHome = (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></Icon>;
const IconBarbell = (p) => <Icon {...p}><path d="M3 9v6M21 9v6M6 7v10M18 7v10M6 12h12"/></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></Icon>;
const IconPlay = (p) => <Icon {...p}><path d="M7 4l13 8-13 8z" fill="currentColor"/></Icon>;
const IconSparkle = (p) => (<Icon {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.7 1.9L22 17.5l-2.3.6L19 20l-.7-1.9L16 17.5l2.3-.6z"/></Icon>);
const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>;

// — extras for the new screens —
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/></Icon>;
const IconPencil = (p) => <Icon {...p}><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></Icon>;
const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Icon>;
const IconUpload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>;
const IconX = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>;
const IconAlert = (p) => <Icon {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></Icon>;
const IconAlertCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></Icon>;
const IconMail = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>;
const IconInfo = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></Icon>;
const IconCloud = (p) => <Icon {...p}><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19z"/></Icon>;
const IconCompass = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor"/></Icon>;
const IconRuler = (p) => <Icon {...p}><path d="M3 16 16 3l5 5L8 21z"/><path d="M9 8l2 2M12 5l2 2M6 11l2 2"/></Icon>;
const IconWeight = (p) => <Icon {...p}><circle cx="12" cy="5" r="2.5"/><path d="M8 8h8l2.5 11a1 1 0 0 1-1 1.2H6.5a1 1 0 0 1-1-1.2z"/></Icon>;
const IconLayers = (p) => <Icon {...p}><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></Icon>;

Object.assign(window, {
  Icon,
  IconWave, IconBoard, IconSun, IconClock, IconProgress,
  IconVideo, IconImage, IconPlus, IconChevronLeft, IconChevronRight, IconChevronDown,
  IconCheck, IconCheckCircle, IconPin, IconCalendar, IconHome, IconBarbell, IconUser,
  IconPlay, IconSparkle, IconArrowRight,
  IconTrash, IconPencil, IconSettings, IconLogout, IconUpload, IconX, IconAlert,
  IconAlertCircle, IconMail, IconLock, IconEye, IconInfo, IconCloud, IconCompass,
  IconRuler, IconWeight, IconLayers,
});
