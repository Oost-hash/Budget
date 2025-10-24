import { describe, test, expect } from 'vitest';
import { Frequency } from './Frequency';

describe('Frequency', () => {
  describe('Creation', () => {
    test('should create monthly frequency', () => {
      // Act
      const frequency = Frequency.create('monthly');

      // Assert
      expect(frequency.getType()).toBe('monthly');
    });

    test('should create weekly frequency', () => {
      // Act
      const frequency = Frequency.create('weekly');

      // Assert
      expect(frequency.getType()).toBe('weekly');
    });

    test('should create yearly frequency', () => {
      // Act
      const frequency = Frequency.create('yearly');

      // Assert
      expect(frequency.getType()).toBe('yearly');
    });

    test('should throw error for invalid frequency type', () => {
      // Act & Assert
      expect(() => {
        Frequency.create('daily' as any);
      }).toThrow('Frequency must be monthly, weekly, or yearly');
    });
  });

  describe('Factory Methods', () => {
    test('should create monthly via factory method', () => {
      // Act
      const frequency = Frequency.monthly();

      // Assert
      expect(frequency.getType()).toBe('monthly');
    });

    test('should create weekly via factory method', () => {
      // Act
      const frequency = Frequency.weekly();

      // Assert
      expect(frequency.getType()).toBe('weekly');
    });

    test('should create yearly via factory method', () => {
      // Act
      const frequency = Frequency.yearly();

      // Assert
      expect(frequency.getType()).toBe('yearly');
    });
  });

  describe('getNextOccurrence - Weekly', () => {
    test('should add 7 days for weekly frequency', () => {
      // Arrange
      const frequency = Frequency.weekly();
      const fromDate = new Date(2025, 0, 15); // 15 januari 2025 (woensdag)

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(22);
      expect(nextDate.getMonth()).toBe(0); // Januari
      expect(nextDate.getFullYear()).toBe(2025);
      expect(nextDate.getDay()).toBe(fromDate.getDay()); // Zelfde dag van de week
    });

    test('should handle weekly across month boundary', () => {
      // Arrange
      const frequency = Frequency.weekly();
      const fromDate = new Date(2025, 0, 29); // 29 januari 2025

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(5);
      expect(nextDate.getMonth()).toBe(1); // Februari
    });
  });

  describe('getNextOccurrence - Monthly', () => {
    test('should add 1 month for monthly frequency', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const fromDate = new Date(2025, 0, 15); // 15 januari 2025

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(1); // Februari
      expect(nextDate.getFullYear()).toBe(2025);
    });

    test('should handle monthly across year boundary', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const fromDate = new Date(2025, 11, 15); // 15 december 2025

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(0); // Januari
      expect(nextDate.getFullYear()).toBe(2026);
    });

    test('should handle February edge case (31 Jan -> overflows to March)', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const fromDate = new Date(2025, 0, 31); // 31 januari 2025

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      // JavaScript date overflow: 31 Jan + 1 month = 31 Feb (doesn't exist) = 3 March
      expect(nextDate.getMonth()).toBe(2); // Maart (overflow)
      expect(nextDate.getDate()).toBe(3); // 3 maart
      expect(nextDate.getFullYear()).toBe(2025);
    });
  });

  describe('getNextOccurrence - Yearly', () => {
    test('should add 1 year for yearly frequency', () => {
      // Arrange
      const frequency = Frequency.yearly();
      const fromDate = new Date(2025, 0, 15); // 15 januari 2025

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(0); // Januari
      expect(nextDate.getFullYear()).toBe(2026);
    });

    test('should handle leap year correctly (29 Feb -> overflows to March)', () => {
      // Arrange
      const frequency = Frequency.yearly();
      const fromDate = new Date(2024, 1, 29); // 29 februari 2024 (leap year)

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      // 2025 is not a leap year, so 29 Feb 2025 doesn't exist -> overflows to 1 March
      expect(nextDate.getFullYear()).toBe(2025);
      expect(nextDate.getMonth()).toBe(2); // Maart (overflow)
      expect(nextDate.getDate()).toBe(1); // 1 maart
    });
  });

  describe('getOccurrencesBetween', () => {
    test('should return all weekly occurrences in a month', () => {
      // Arrange
      const frequency = Frequency.weekly();
      const startDate = new Date(2025, 0, 1); // 1 januari 2025
      const endDate = new Date(2025, 0, 31); // 31 januari 2025

      // Act
      const occurrences = frequency.getOccurrencesBetween(startDate, endDate);

      // Assert
      expect(occurrences).toHaveLength(5); // 5 weken in januari
      expect(occurrences[0]?.getDate()).toBe(1);
      expect(occurrences[1]?.getDate()).toBe(8);
      expect(occurrences[2]?.getDate()).toBe(15);
      expect(occurrences[3]?.getDate()).toBe(22);
      expect(occurrences[4]?.getDate()).toBe(29);
    });

    test('should return all monthly occurrences in a year', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const startDate = new Date(2025, 0, 15); // 15 januari 2025
      const endDate = new Date(2025, 11, 31); // 31 december 2025

      // Act
      const occurrences = frequency.getOccurrencesBetween(startDate, endDate);

      // Assert
      expect(occurrences).toHaveLength(12); // 12 maanden
      expect(occurrences[0]?.getMonth()).toBe(0); // Januari
      expect(occurrences[11]?.getMonth()).toBe(11); // December
    });

    test('should return all yearly occurrences', () => {
      // Arrange
      const frequency = Frequency.yearly();
      const startDate = new Date(2025, 0, 1); // 1 januari 2025
      const endDate = new Date(2027, 11, 31); // 31 december 2027

      // Act
      const occurrences = frequency.getOccurrencesBetween(startDate, endDate);

      // Assert
      expect(occurrences).toHaveLength(3); // 2025, 2026, 2027
      expect(occurrences[0]?.getFullYear()).toBe(2025);
      expect(occurrences[1]?.getFullYear()).toBe(2026);
      expect(occurrences[2]?.getFullYear()).toBe(2027);
    });

    test('should return single occurrence when start equals end', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const date = new Date(2025, 0, 15);

      // Act
      const occurrences = frequency.getOccurrencesBetween(date, date);

      // Assert
      expect(occurrences).toHaveLength(1);
      expect(occurrences[0]?.getTime()).toBe(date.getTime());
    });

    test('should throw error when start date is after end date', () => {
      // Arrange
      const frequency = Frequency.monthly();
      const startDate = new Date(2025, 11, 31);
      const endDate = new Date(2025, 0, 1);

      // Act & Assert
      expect(() => {
        frequency.getOccurrencesBetween(startDate, endDate);
      }).toThrow('Start date must be before end date');
    });
  });

  describe('Equality', () => {
    test('should return true for equal frequencies', () => {
      // Arrange
      const freq1 = Frequency.monthly();
      const freq2 = Frequency.monthly();

      // Act & Assert
      expect(freq1.equals(freq2)).toBe(true);
    });

    test('should return false for different frequencies', () => {
      // Arrange
      const freq1 = Frequency.monthly();
      const freq2 = Frequency.weekly();

      // Act & Assert
      expect(freq1.equals(freq2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return string representation', () => {
      // Arrange
      const frequency = Frequency.monthly();

      // Act
      const result = frequency.toString();

      // Assert
      expect(result).toBe('monthly');
    });
  });

  describe('Time Normalization', () => {
    test('should normalize time to midnight', () => {
      // Arrange
      const frequency = Frequency.weekly();
      const fromDate = new Date(2025, 0, 15, 14, 30, 45); // 15 jan 2025, 14:30:45

      // Act
      const nextDate = frequency.getNextOccurrence(fromDate);

      // Assert
      expect(nextDate.getHours()).toBe(0);
      expect(nextDate.getMinutes()).toBe(0);
      expect(nextDate.getSeconds()).toBe(0);
      expect(nextDate.getMilliseconds()).toBe(0);
    });
  });
});