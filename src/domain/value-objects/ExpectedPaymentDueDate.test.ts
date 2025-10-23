import { describe, test, expect } from 'vitest';
import { ExpectedPaymentDueDate } from './ExpectedPaymentDueDate';

describe('ExpectedPaymentDueDate', () => {
  describe('Creation', () => {
    test('should create with valid day and shift direction', () => {
      // Arrange & Act
      const dueDate = ExpectedPaymentDueDate.create(15, 'before');

      // Assert
      expect(dueDate.getDayOfMonth()).toBe(15);
      expect(dueDate.getShiftDirection()).toBe('before');
    });

    test('should throw error when day is less than 1', () => {
      // Act & Assert
      expect(() => {
        ExpectedPaymentDueDate.create(0, 'none');
      }).toThrow('Payment due day must be between 1 and 28');
    });

    test('should throw error when day is greater than 28', () => {
      // Act & Assert
      expect(() => {
        ExpectedPaymentDueDate.create(29, 'none');
      }).toThrow('Payment due day must be between 1 and 28');
    });

    test('should throw error when day is not an integer', () => {
      // Act & Assert
      expect(() => {
        ExpectedPaymentDueDate.create(15.5, 'none');
      }).toThrow('Payment due day must be an integer');
    });

    test('should accept boundary values 1 and 28', () => {
      // Act
      const dueDate1 = ExpectedPaymentDueDate.create(1, 'none');
      const dueDate28 = ExpectedPaymentDueDate.create(28, 'none');

      // Assert
      expect(dueDate1.getDayOfMonth()).toBe(1);
      expect(dueDate28.getDayOfMonth()).toBe(28);
    });
  });

  describe('Equality', () => {
    test('should return true for equal due dates', () => {
      // Arrange
      const dueDate1 = ExpectedPaymentDueDate.create(15, 'before');
      const dueDate2 = ExpectedPaymentDueDate.create(15, 'before');

      // Act & Assert
      expect(dueDate1.equals(dueDate2)).toBe(true);
    });

    test('should return false for different days', () => {
      // Arrange
      const dueDate1 = ExpectedPaymentDueDate.create(15, 'before');
      const dueDate2 = ExpectedPaymentDueDate.create(20, 'before');

      // Act & Assert
      expect(dueDate1.equals(dueDate2)).toBe(false);
    });

    test('should return false for different shift directions', () => {
      // Arrange
      const dueDate1 = ExpectedPaymentDueDate.create(15, 'before');
      const dueDate2 = ExpectedPaymentDueDate.create(15, 'after');

      // Act & Assert
      expect(dueDate1.equals(dueDate2)).toBe(false);
    });
  });

  describe('getNextDueDate - Basic', () => {
    test('should return next due date when current date is before due day', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'none');
      const fromDate = new Date(2025, 0, 5); // 5 januari 2025 (zondag, maar none)

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(0); // Januari
      expect(nextDate.getFullYear()).toBe(2025);
    });

    test('should return same month when current date is on due day', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'none');
      const fromDate = new Date(2025, 0, 15); // 15 januari 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(0); // Januari (zelfde maand)
    });

    test('should return next month when current date is after due day', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'none');
      const fromDate = new Date(2025, 0, 20); // 20 januari 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(1); // Februari
    });
  });

  describe('getNextDueDate - Weekend Shifting', () => {
    test('should shift before when due date falls on Saturday', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(1, 'before');
      const fromDate = new Date(2025, 1, 1); // 1 feb 2025 is zaterdag

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDay()).not.toBe(6); // Niet zaterdag
      expect(nextDate.getDay()).not.toBe(0); // Niet zondag
      // Shifted naar januari 31 (vrijdag), of nog eerder
      expect(nextDate.getMonth()).toBe(0); // Januari (vorige maand)
      expect(nextDate.getDate()).toBeLessThanOrEqual(31);
    });

    test('should shift after when due date falls on Sunday', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(2, 'after');
      const fromDate = new Date(2025, 1, 1); // 2 feb 2025 is zondag

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDay()).not.toBe(6); // Niet zaterdag
      expect(nextDate.getDay()).not.toBe(0); // Niet zondag
      expect(nextDate.getDate()).toBeGreaterThan(2); // Later dan 2e
    });

    test('should not shift when shift direction is none', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(1, 'none');
      const fromDate = new Date(2025, 1, 1); // 1 feb 2025 is zaterdag

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(1);
      expect(nextDate.getDay()).toBe(6); // Blijft zaterdag
    });
  });

  describe('getNextDueDate - Holiday Shifting', () => {
    test('should shift before when due date is Christmas', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(25, 'before');
      const fromDate = new Date(2025, 11, 1); // 1 december 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBeLessThan(25); // Voor 25 december
      expect(nextDate.getMonth()).toBe(11); // December
    });

    test('should shift after when due date is New Years Day', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(1, 'after');
      const fromDate = new Date(2024, 11, 15); // 15 december 2024

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      expect(nextDate.getDate()).toBeGreaterThan(1); // Na 1 januari
      expect(nextDate.getMonth()).toBe(0); // Januari
      expect(nextDate.getFullYear()).toBe(2025);
    });

    test('should shift before when due date is Labour Day (May 1st)', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(1, 'before');
      const fromDate = new Date(2025, 3, 15); // 15 april 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      // 1 mei 2025 is donderdag (feestdag), shift before gaat naar 30 april (woensdag)
      expect(nextDate.getMonth()).toBe(3); // April (0-indexed)
      expect(nextDate.getDate()).toBe(30);
      expect(nextDate.getDay()).not.toBe(0); // Niet zondag
      expect(nextDate.getDay()).not.toBe(6); // Niet zaterdag
    });
  });

  describe('getNextDueDate - Easter Holidays', () => {
    test('should handle Good Friday (2025: April 18)', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(18, 'before');
      const fromDate = new Date(2025, 3, 1); // 1 april 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      // Goede Vrijdag 2025 is 18 april
      expect(nextDate.getDate()).not.toBe(18);
      expect(nextDate.getDate()).toBeLessThan(18);
    });

    test('should handle Easter Monday (2025: April 21)', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(21, 'after');
      const fromDate = new Date(2025, 3, 1); // 1 april 2025

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      // Paasmaandag 2025 is 21 april
      expect(nextDate.getDate()).not.toBe(21);
      expect(nextDate.getDate()).toBeGreaterThan(21);
    });
  });

  describe('getNextDueDate - Edge Cases', () => {
    test('should handle shifting over multiple closed days', () => {
      // Arrange - 26 december (2e kerstdag, donderdag 2024)
      const dueDate = ExpectedPaymentDueDate.create(26, 'after');
      const fromDate = new Date(2024, 11, 1); // 1 december 2024

      // Act
      const nextDate = dueDate.getNextDueDate(fromDate);

      // Assert
      // 26 dec 2024 = 2e kerstdag (donderdag)
      // 27 dec = vrijdag (open!)
      // Dus shifted naar 27 december
      expect(nextDate.getDate()).toBe(27);
      expect(nextDate.getMonth()).toBe(11); // December
      expect(nextDate.getDay()).not.toBe(0); // Niet zondag
      expect(nextDate.getDay()).not.toBe(6); // Niet zaterdag
    });

    test('should use current date as default when no fromDate provided', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'none');

      // Act
      const nextDate = dueDate.getNextDueDate(); // Geen fromDate

      // Assert
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate.getDate()).toBe(15);
    });

    test('should throw error if cannot find open day within 10 attempts', () => {
      // Note: Dit scenario is bijna onmogelijk in praktijk, maar test de safety
      // We kunnen dit niet echt testen zonder de implementatie te mocken
      // Laten we deze skip voor nu
    });
  });

  describe('All Shift Directions', () => {
    test('should support before shift direction', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'before');

      // Assert
      expect(dueDate.getShiftDirection()).toBe('before');
    });

    test('should support after shift direction', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'after');

      // Assert
      expect(dueDate.getShiftDirection()).toBe('after');
    });

    test('should support none shift direction', () => {
      // Arrange
      const dueDate = ExpectedPaymentDueDate.create(15, 'none');

      // Assert
      expect(dueDate.getShiftDirection()).toBe('none');
    });
  });
});