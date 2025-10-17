import { describe, test, expect } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
  describe('Creation', () => {
    test('should create money with valid amount and currency', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('EUR');
    });

    test('should default to EUR if currency not provided', () => {
      const money = Money.fromAmount(100);
      
      expect(money.currency).toBe('EUR');
    });

    test('should uppercase currency code', () => {
      const money = Money.fromAmount(100, 'usd');
      
      expect(money.currency).toBe('USD');
    });

    test('should throw error for non-finite amount', () => {
      expect(() => Money.fromAmount(Infinity, 'EUR'))
        .toThrow('Amount must be a finite number');
      
      expect(() => Money.fromAmount(NaN, 'EUR'))
        .toThrow('Amount must be a finite number');
    });

    test('should throw error for invalid currency code', () => {
      expect(() => Money.fromAmount(100, 'EU'))
        .toThrow('Currency must be a 3-letter ISO 4217 code');
      
      expect(() => Money.fromAmount(100, 'EURO'))
        .toThrow('Currency must be a 3-letter ISO 4217 code');
    });
  });

  describe('Addition', () => {
    test('should add two money amounts with same currency', () => {
      const money1 = Money.fromAmount(100, 'EUR');
      const money2 = Money.fromAmount(50, 'EUR');
      
      const result = money1.add(money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('EUR');
    });

    test('should throw error when adding different currencies', () => {
      const euros = Money.fromAmount(100, 'EUR');
      const dollars = Money.fromAmount(100, 'USD');
      
      expect(() => euros.add(dollars))
        .toThrow('Cannot operate on different currencies: EUR and USD');
    });
  });

  describe('Subtraction', () => {
    test('should subtract two money amounts with same currency', () => {
      const money1 = Money.fromAmount(100, 'EUR');
      const money2 = Money.fromAmount(30, 'EUR');
      
      const result = money1.subtract(money2);
      
      expect(result.amount).toBe(70);
      expect(result.currency).toBe('EUR');
    });

    test('should allow negative result', () => {
      const money1 = Money.fromAmount(50, 'USD');
      const money2 = Money.fromAmount(100, 'USD');
      
      const result = money1.subtract(money2);
      
      expect(result.amount).toBe(-50);
    });
  });

  describe('Multiplication', () => {
    test('should multiply money by factor', () => {
      const money = Money.fromAmount(50, 'EUR');
      
      const result = money.multiply(3);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('EUR');
    });

    test('should handle decimal factors', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      const result = money.multiply(0.5);
      
      expect(result.amount).toBe(50);
    });

    test('should throw error for non-finite factor', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      expect(() => money.multiply(Infinity))
        .toThrow('Factor must be a finite number');
    });
  });

  describe('Division', () => {
    test('should divide money by divisor', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      const result = money.divide(4);
      
      expect(result.amount).toBe(25);
      expect(result.currency).toBe('EUR');
    });

    test('should throw error when dividing by zero', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      expect(() => money.divide(0))
        .toThrow('Divisor must be a non-zero finite number');
    });
  });

  describe('Negation', () => {
    test('should negate positive amount', () => {
      const money = Money.fromAmount(100, 'EUR');
      
      const result = money.negate();
      
      expect(result.amount).toBe(-100);
      expect(result.currency).toBe('EUR');
    });

    test('should negate negative amount', () => {
      const money = Money.fromAmount(-50, 'USD');
      
      const result = money.negate();
      
      expect(result.amount).toBe(50);
    });
  });

  describe('Predicates', () => {
    test('should check if amount is positive', () => {
      expect(Money.fromAmount(100, 'EUR').isPositive()).toBe(true);
      expect(Money.fromAmount(-100, 'EUR').isPositive()).toBe(false);
      expect(Money.fromAmount(0, 'EUR').isPositive()).toBe(false);
    });

    test('should check if amount is negative', () => {
      expect(Money.fromAmount(-100, 'EUR').isNegative()).toBe(true);
      expect(Money.fromAmount(100, 'EUR').isNegative()).toBe(false);
      expect(Money.fromAmount(0, 'EUR').isNegative()).toBe(false);
    });

    test('should check if amount is zero', () => {
      expect(Money.fromAmount(0, 'EUR').isZero()).toBe(true);
      expect(Money.fromAmount(0.001, 'EUR').isZero()).toBe(true); // Within tolerance
      expect(Money.fromAmount(0.02, 'EUR').isZero()).toBe(false);
    });
  });

  describe('Equality', () => {
    test('should return true for equal amounts and currency', () => {
      const money1 = Money.fromAmount(100, 'EUR');
      const money2 = Money.fromAmount(100, 'EUR');
      
      expect(money1.equals(money2)).toBe(true);
    });

    test('should return false for different amounts', () => {
      const money1 = Money.fromAmount(100, 'EUR');
      const money2 = Money.fromAmount(200, 'EUR');
      
      expect(money1.equals(money2)).toBe(false);
    });

    test('should return false for different currencies', () => {
      const money1 = Money.fromAmount(100, 'EUR');
      const money2 = Money.fromAmount(100, 'USD');
      
      expect(money1.equals(money2)).toBe(false);
    });

    test('should handle floating point precision', () => {
      const money1 = Money.fromAmount(0.1 + 0.2, 'EUR'); // 0.30000000000000004
      const money2 = Money.fromAmount(0.3, 'EUR');
      
      expect(money1.equals(money2)).toBe(true);
    });
  });

  describe('Multiple Currencies', () => {
    test('should work with USD', () => {
      const dollars = Money.fromAmount(100, 'USD');
      
      expect(dollars.currency).toBe('USD');
    });

    test('should work with GBP', () => {
      const pounds = Money.fromAmount(100, 'GBP');
      
      expect(pounds.currency).toBe('GBP');
    });

    test('should work with JPY', () => {
      const yen = Money.fromAmount(10000, 'JPY');
      
      expect(yen.currency).toBe('JPY');
    });
  });
});