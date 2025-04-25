const {
  isVotingOpen,
  getTimeRemaining,
  getNextVotingWindow
} = require('../../utils/timeRestriction');

describe('Time Restriction Utility', () => {
  let originalDate;

  beforeAll(() => {
    // Save the original Date constructor
    originalDate = global.Date;
  });

  afterEach(() => {
    // Restore the original Date constructor after each test
    global.Date = originalDate;
  });

  describe('isVotingOpen', () => {
    it('should return true when voting is open (4:00 PM)', () => {
      // Mock date to 4:00 PM (voting just opened)
      const mockDate = new Date();
      mockDate.setHours(16, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Check if voting is open
      const result = isVotingOpen();
      expect(result).toBe(true);
    });

    it('should return true when voting is open (10:00 PM)', () => {
      // Mock date to 10:00 PM (middle of voting period)
      const mockDate = new Date();
      mockDate.setHours(22, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Check if voting is open
      const result = isVotingOpen();
      expect(result).toBe(true);
    });

    it('should return true when voting is open (10:00 AM)', () => {
      // Mock date to 10:00 AM (near end of voting period)
      const mockDate = new Date();
      mockDate.setHours(10, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Check if voting is open
      const result = isVotingOpen();
      expect(result).toBe(true);
    });

    it('should return false when voting is closed (11:00 AM)', () => {
      // Mock date to 11:00 AM (voting just closed)
      const mockDate = new Date();
      mockDate.setHours(11, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Check if voting is open
      const result = isVotingOpen();
      expect(result).toBe(false);
    });

    it('should return false when voting is closed (2:00 PM)', () => {
      // Mock date to 2:00 PM (middle of closed period)
      const mockDate = new Date();
      mockDate.setHours(14, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Check if voting is open
      const result = isVotingOpen();
      expect(result).toBe(false);
    });
  });

  describe('getTimeRemaining', () => {
    it('should return correct time remaining when voting is open (4:00 PM)', () => {
      // Mock date to 4:00 PM (voting just opened)
      const mockDate = new Date();
      mockDate.setHours(16, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Get time remaining
      const result = getTimeRemaining();
      
      // Check result
      expect(result.isOpen).toBe(true);
      expect(result.hoursRemaining).toBe(19);
      expect(result.minutesRemaining).toBe(0);
      expect(result.message).toContain('Voting is open');
      expect(result.message).toContain('19 hours');
    });

    it('should return correct time remaining when voting is open (10:30 AM)', () => {
      // Mock date to 10:30 AM (30 minutes before closing)
      const mockDate = new Date();
      mockDate.setHours(10, 30, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Get time remaining
      const result = getTimeRemaining();
      
      // Check result
      expect(result.isOpen).toBe(true);
      expect(result.hoursRemaining).toBe(0);
      expect(result.minutesRemaining).toBe(30);
      expect(result.message).toContain('Voting is open');
      expect(result.message).toContain('30 minutes');
    });

    it('should return correct time remaining when voting is closed (12:00 PM)', () => {
      // Mock date to 12:00 PM (1 hour after closing)
      const mockDate = new Date();
      mockDate.setHours(12, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Get time remaining
      const result = getTimeRemaining();
      
      // Check result
      expect(result.isOpen).toBe(false);
      expect(result.hoursRemaining).toBe(4);
      expect(result.minutesRemaining).toBe(0);
      expect(result.message).toContain('Voting is closed');
      expect(result.message).toContain('4 hours');
    });
  });

  describe('getNextVotingWindow', () => {
    it('should return correct next voting window when currently closed', () => {
      // Mock date to 12:00 PM (voting is closed)
      const mockDate = new Date();
      mockDate.setHours(12, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Get next voting window
      const result = getNextVotingWindow();
      
      // Check result
      expect(result).toBeDefined();
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      
      // Start time should be 4:00 PM today
      expect(result.startTime.getHours()).toBe(16);
      expect(result.startTime.getMinutes()).toBe(0);
      
      // End time should be 11:00 AM tomorrow
      expect(result.endTime.getHours()).toBe(11);
      expect(result.endTime.getMinutes()).toBe(0);
      
      // End time should be the next day
      expect(result.endTime.getDate()).toBe(mockDate.getDate() + 1);
    });

    it('should return correct next voting window when currently open', () => {
      // Mock date to 8:00 PM (voting is open)
      const mockDate = new Date();
      mockDate.setHours(20, 0, 0, 0);
      
      // Mock the Date constructor
      global.Date = class extends originalDate {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(mockDate);
          }
          return new originalDate(...arguments);
        }
      };
      
      // Get next voting window
      const result = getNextVotingWindow();
      
      // Check result
      expect(result).toBeDefined();
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      
      // Start time should be 4:00 PM tomorrow
      expect(result.startTime.getHours()).toBe(16);
      expect(result.startTime.getMinutes()).toBe(0);
      expect(result.startTime.getDate()).toBe(mockDate.getDate() + 1);
      
      // End time should be 11:00 AM the day after tomorrow
      expect(result.endTime.getHours()).toBe(11);
      expect(result.endTime.getMinutes()).toBe(0);
      expect(result.endTime.getDate()).toBe(mockDate.getDate() + 2);
    });
  });
});