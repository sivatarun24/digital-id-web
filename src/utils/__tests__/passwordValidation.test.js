import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validateChangePassword,
  getPasswordRuleStatus,
  PASSWORD_RULES,
  PASSWORD_HINT,
} from '../passwordValidation';

describe('passwordValidation', () => {
  describe('PASSWORD_RULES', () => {
    it('has six rules defined', () => {
      expect(PASSWORD_RULES).toHaveLength(6);
    });

    it('each rule has id, label, and test function', () => {
      PASSWORD_RULES.forEach((rule) => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('label');
        expect(typeof rule.test).toBe('function');
      });
    });
  });

  describe('PASSWORD_HINT', () => {
    it('is a non-empty string', () => {
      expect(typeof PASSWORD_HINT).toBe('string');
      expect(PASSWORD_HINT.length).toBeGreaterThan(0);
    });
  });

  describe('getPasswordRuleStatus', () => {
    it('returns status for all rules', () => {
      const statuses = getPasswordRuleStatus('Abc1@xyz');
      expect(statuses).toHaveLength(6);
      statuses.forEach((s) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('label');
        expect(typeof s.passed).toBe('boolean');
      });
    });

    it('marks all rules passed for a strong password', () => {
      const statuses = getPasswordRuleStatus('StrongP@ss1');
      statuses.forEach((s) => {
        expect(s.passed).toBe(true);
      });
    });

    it('handles non-string input gracefully', () => {
      const statuses = getPasswordRuleStatus(undefined);
      expect(statuses).toHaveLength(6);
      const minLen = statuses.find((s) => s.id === 'min-length');
      expect(minLen.passed).toBe(false);
    });

    it('flags missing uppercase', () => {
      const statuses = getPasswordRuleStatus('lowercase1@');
      const upper = statuses.find((s) => s.id === 'uppercase');
      expect(upper.passed).toBe(false);
    });

    it('flags missing lowercase', () => {
      const statuses = getPasswordRuleStatus('UPPERCASE1@');
      const lower = statuses.find((s) => s.id === 'lowercase');
      expect(lower.passed).toBe(false);
    });

    it('flags missing digit', () => {
      const statuses = getPasswordRuleStatus('NoDigit@Here');
      const digit = statuses.find((s) => s.id === 'digit');
      expect(digit.passed).toBe(false);
    });

    it('flags missing special character', () => {
      const statuses = getPasswordRuleStatus('NoSpecial1A');
      const special = statuses.find((s) => s.id === 'special');
      expect(special.passed).toBe(false);
    });

    it('flags too short password', () => {
      const statuses = getPasswordRuleStatus('Ab1@');
      const minLen = statuses.find((s) => s.id === 'min-length');
      expect(minLen.passed).toBe(false);
    });

    it('flags too long password (>64 chars)', () => {
      const long = 'A'.repeat(65) + 'a1@';
      const statuses = getPasswordRuleStatus(long);
      const maxLen = statuses.find((s) => s.id === 'max-length');
      expect(maxLen.passed).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns valid for a strong password', () => {
      const result = validatePassword('StrongP@ss1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid for empty string', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required.');
    });

    it('returns invalid for null/undefined', () => {
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });

    it('returns invalid for whitespace-only', () => {
      const result = validatePassword('   ');
      expect(result.valid).toBe(false);
    });

    it('collects all failing rule labels as errors', () => {
      const result = validatePassword('ab');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach((e) => {
        expect(typeof e).toBe('string');
      });
    });

    it('accepts password at exactly min length', () => {
      const result = validatePassword('Abcde1@x');
      expect(result.valid).toBe(true);
    });

    it('accepts password at exactly max length', () => {
      const base = 'Aa1@' + 'x'.repeat(60);
      expect(base.length).toBe(64);
      const result = validatePassword(base);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateChangePassword', () => {
    it('returns invalid if old password is empty', () => {
      const result = validateChangePassword('', 'NewP@ss1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Current password is required.');
    });

    it('returns invalid if new password is empty', () => {
      const result = validateChangePassword('OldP@ss1', '');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('New password is required.');
    });

    it('returns invalid if old and new are the same', () => {
      const result = validateChangePassword('SameP@ss1', 'SameP@ss1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('New password must differ from current password.');
    });

    it('validates new password rules when inputs differ', () => {
      const result = validateChangePassword('OldP@ss1', 'weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('returns valid for good change', () => {
      const result = validateChangePassword('OldP@ss1', 'NewP@ss2');
      expect(result.valid).toBe(true);
    });
  });
});
