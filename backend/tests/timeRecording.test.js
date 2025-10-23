import bcrypt from 'bcryptjs';
process.env.NODE_ENV = 'test';

const { sequelize, TimeRecording, User } = require('../models');

describe('TimeRecording Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  }, 10000);

  afterAll(async () => {
    await sequelize.close();
  }, 10000);

  describe('Validations', () => {
    let user;

    beforeAll(async () => {
      user = await User.create({
        name: 'Alice',
        surname: 'Smith',
        mobileNumber: '0123456789',
        email: 'alice.smith@example.com',
        password: await bcrypt.hash('Secure123@',12),
        role: 'manager',
        id_manager: null,
      });
    });

    it('should create a time recording with valid data', async () => {
      const timestamp = new Date();
      const timeRecording = await TimeRecording.create({
        timestamp,
        type: 'Arrival',
        id_user: user.id,
      });

      expect(timeRecording.timestamp).toEqual(timestamp);
      expect(timeRecording.type).toBe('Arrival');
      expect(timeRecording.id_user).toBe(user.id);
    });

    it('should not create a time recording without a timestamp', async () => {
      await expect(
        TimeRecording.create({
          type: 'Arrival',
          id_user: user.id,
        })
      ).rejects.toThrow('TimeRecording.timestamp cannot be null');
    });

    it('should not create a time recording without a type', async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          id_user: user.id,
        })
      ).rejects.toThrow('TimeRecording.type cannot be null');
    });

    it('should not create a time recording with an invalid type', async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          type: 'InvalidType',
          id_user: user.id,
        })
      ).rejects.toThrow('Type must be either "Arrival" or "Departure"!');
    });

    it('should not create a time recording without an id_user', async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          type: 'Arrival',
        })
      ).rejects.toThrow('TimeRecording.id_user cannot be null');
    });
  });

  describe('Associations', () => {
    let user, timeRecording;

    beforeAll(async () => {
      user = await User.create({
        name: 'Bob',
        surname: 'Johnson',
        mobileNumber: '0123456789',
        email: 'bob.johnson@example.com',
        password: await bcrypt.hash('Secure123@',10),
        role: 'employee',
        id_manager: null,
      });

      timeRecording = await TimeRecording.create({
        timestamp: new Date(),
        type: 'Arrival',
        id_user: user.id,
      });
    });

    it('should associate a time recording with a user', async () => {
      const foundTimeRecording = await TimeRecording.findByPk(timeRecording.id, {
        include: [{
          model: User,
          as: 'user'
        }]
      });

      expect(foundTimeRecording['user'].id).toBe(user.id);
    });
  });
});
