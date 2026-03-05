/**
 * Shared password validation for register, change-password, and reset-password.
 * Rules: min 8, max 64, at least 1 upper, 1 lower, 1 digit, 1 special (@#$%^&+=!)
 */

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const SPECIAL_CHARS = '@#$%^&+=!';
const SPECIAL_CLASS = SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const PASSWORD_RULES = [
  {
    id: 'min-length',
    label: `At least ${MIN_LENGTH} characters`,
    test: (p) => p.length >= MIN_LENGTH,
  },
  {
    id: 'max-length',
    label: `At most ${MAX_LENGTH} characters`,
    test: (p) => p.length <= MAX_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'At least 1 uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'At least 1 lowercase letter',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'digit',
    label: 'At least 1 digit',
    test: (p) => /\d/.test(p),
  },
  {
    id: 'special',
    label: `At least 1 special character (${SPECIAL_CHARS})`,
    test: (p) => new RegExp(`[${SPECIAL_CLASS}]`).test(p),
  },
];

export function getPasswordRuleStatus(password) {
  const p = typeof password === 'string' ? password : '';
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(p),
  }));
}

export function validatePassword(password) {
  const errors = [];
  const p = typeof password === 'string' ? password : '';

  if (!p || !p.trim()) {
    return { valid: false, errors: ['Password is required.'] };
  }

  const statuses = getPasswordRuleStatus(p);
  statuses.forEach((rule) => {
    if (!rule.passed) {
      errors.push(rule.label);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** For change-password: validates new password and ensures it differs from old. */
export function validateChangePassword(oldPassword, newPassword) {
  const pOld = typeof oldPassword === 'string' ? oldPassword.trim() : '';
  const pNew = typeof newPassword === 'string' ? newPassword.trim() : '';

  if (!pOld) {
    return { valid: false, errors: ['Current password is required.'] };
  }
  if (!pNew) {
    return { valid: false, errors: ['New password is required.'] };
  }
  if (pOld === pNew) {
    return { valid: false, errors: ['New password must differ from current password.'] };
  }

  return validatePassword(newPassword);
}

export const PASSWORD_HINT = `Min ${MIN_LENGTH}, max ${MAX_LENGTH} characters; include 1 uppercase, 1 lowercase, 1 digit, 1 special (${SPECIAL_CHARS}).`;
