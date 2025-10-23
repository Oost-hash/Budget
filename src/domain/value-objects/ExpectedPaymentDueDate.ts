export type ShiftDirection = 'before' | 'after' | 'none';

export class ExpectedPaymentDueDate {
  private constructor(
    private readonly dayOfMonth: number,
    private readonly shiftDirection: ShiftDirection
  ) {}

  static create(dayOfMonth: number, shiftDirection: ShiftDirection): ExpectedPaymentDueDate {
    if (!Number.isInteger(dayOfMonth)) {
      throw new Error('Payment due day must be an integer');
    }

    if (dayOfMonth < 1 || dayOfMonth > 28) {
      throw new Error('Payment due day must be between 1 and 28');
    }

    return new ExpectedPaymentDueDate(dayOfMonth, shiftDirection);
  }

  getDayOfMonth(): number {
    return this.dayOfMonth;
  }

  getShiftDirection(): ShiftDirection {
    return this.shiftDirection;
  }

  /**
   * Berekent de eerstvolgende betaaldatum vanaf een gegeven datum
   * Houdt rekening met TARGET2 closed days (weekends + EU bank holidays)
   */
  getNextDueDate(fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    result.setHours(0, 0, 0, 0);

    // Als we al NA de due day van deze maand zijn, ga naar volgende maand
    if (result.getDate() > this.dayOfMonth) {
      result.setMonth(result.getMonth() + 1);
    }

    // Zet de dag naar de payment due day
    result.setDate(this.dayOfMonth);

    // Shift als het een TARGET2 closed day is
    if (this.shiftDirection !== 'none') {
      return this.shiftToOpenDay(result);
    }

    return result;
  }

  equals(other: ExpectedPaymentDueDate): boolean {
    return (
      this.dayOfMonth === other.dayOfMonth &&
      this.shiftDirection === other.shiftDirection
    );
  }

  private shiftToOpenDay(date: Date): Date {
    const result = new Date(date);
    let attempts = 0;
    const maxAttempts = 10; // Veiligheid tegen infinite loop

    while (this.isTarget2ClosedDay(result) && attempts < maxAttempts) {
      if (this.shiftDirection === 'before') {
        result.setDate(result.getDate() - 1);
      } else {
        result.setDate(result.getDate() + 1);
      }
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Could not find an open TARGET2 day within 10 days');
    }

    return result;
  }

  /**
   * Check of een datum een TARGET2 closed day is
   * TARGET2 is gesloten op:
   * - Zaterdag & Zondag
   * - Nieuwjaarsdag (1 januari)
   * - Goede Vrijdag
   * - Paasmaandag
   * - Dag van de Arbeid (1 mei)
   * - Kerstmis (25 december)
   * - 2e Kerstdag (26 december)
   */
  private isTarget2ClosedDay(date: Date): boolean {
    const day = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // 0-indexed
    const year = date.getFullYear();

    // Weekend
    if (day === 0 || day === 6) {
      return true;
    }

    // Nieuwjaarsdag
    if (month === 1 && dayOfMonth === 1) {
      return true;
    }

    // Dag van de Arbeid
    if (month === 5 && dayOfMonth === 1) {
      return true;
    }

    // Kerstmis
    if (month === 12 && dayOfMonth === 25) {
      return true;
    }

    // 2e Kerstdag
    if (month === 12 && dayOfMonth === 26) {
      return true;
    }

    // Goede Vrijdag & Paasmaandag (complexe berekening)
    const easter = this.calculateEaster(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);

    if (this.isSameDay(date, goodFriday) || this.isSameDay(date, easterMonday)) {
      return true;
    }

    return false;
  }

  /**
   * Berekent Paaszondag voor een gegeven jaar (Computus algoritme)
   */
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}