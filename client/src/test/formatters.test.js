import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../utils/formatters';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts with default $ currency', () => {
      expect(formatCurrency(1250)).toBe('$1,250.00');
    });

    it('should format negative amounts with negative sign', () => {
      expect(formatCurrency(-45.5)).toBe('-$45.50');
    });

    it('should support custom currencies like €, ₹, £', () => {
      expect(formatCurrency(500, '€')).toBe('€500.00');
      expect(formatCurrency(15000, '₹')).toBe('₹15,000.00');
    });

    it('should handle zero or invalid amounts gracefully', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('should format valid ISO date strings to human-readable month day year', () => {
      const formatted = formatDate('2026-05-15T12:00:00Z');
      expect(formatted).toMatch(/May 15, 2026/);
    });

    it('should return empty string if date is missing', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
    });
  });
});

