// Primary nav — shown in the header bar
export const HEADER_NAV = [
  { path: '/home',            label: 'Home' },
  { path: '/verify-identity', label: 'Verify Identity' },
  { path: '/wallet',          label: 'Wallet' },
  { path: '/credentials',     label: 'Credentials' },
  { path: '/documents',       label: 'Documents' },
  { path: '/services',        label: 'Services' },
];

// Account nav — shown only in the profile dropdown
export const ACCOUNT_NAV = [
  { path: '/profile',        label: 'Profile' },
  { path: '/activity',       label: 'Activity' },
  { path: '/notifications',  label: 'Notifications' },
  { path: '/settings',       label: 'Settings' },
];

// All items combined (for any place that needs the full list)
export const NAV_ITEMS = [...HEADER_NAV, ...ACCOUNT_NAV];
