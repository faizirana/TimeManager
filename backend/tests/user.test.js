import bcrypt from 'bcryptjs';
process.env.NODE_ENV = 'test';

const { sequelize, User } = require('../models');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  }, 10000);

  afterAll(async () => {
    await sequelize.close();
  }, 10000);

  describe('Validations', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create({
        name: 'Alice',
        surname: 'Smith',
        mobileNumber: '0123456789',
        email: 'alice.smith@example.com',
        password: 'Secure123@',
        role: 'manager',
        id_manager: null,
      });

      expect(user.name).toBe('Alice');
      expect(user.surname).toBe('Smith');
      expect(user.mobileNumber).toBe('0123456789');
      expect(user.email).toBe('alice.smith@example.com');
      expect(user.role).toBe('manager');
    });

    it('should not create a user without a name', async () => {
      await expect(
        User.create({
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Name must be filled and cannot be null !');
    });

    it('should not create a user without a surname', async () => {
      await expect(
        User.create({
          name: 'Alice',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Surname must be filled and cannot be null !');
    });

    it('should not create a user without a mobile number', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('MobileNumber must be filled and cannot be null !');
    });

    it('should not create a user with a non-numeric mobile number', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: 'non-numeric',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow("Mobile number must be numeric!");
    });

    it('should not create a user without an email', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Email must be filled and cannot be null !');
    });

    it('should not create a user with an invalid email', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'invalid-email',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Email must be valid !');
    });

    it('should not create a user without a password', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Password must be filled and cannot be null !');
    });

    it('should not create a user with a weak password', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          password: 'weak',
          role: 'manager',
          id_manager: null,
        })
      ).rejects.toThrow('Password must be at least 8 characters long, with 1 uppercase letter and 1 number.');
    });

    it('should not create a user without a role', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          id_manager: null,
        })
      ).rejects.toThrow('Role must be filled and cannot be null !');
    });

    it('should not create a user with an invalid role', async () => {
      await expect(
        User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith@example.com',
          password: 'Secure123@',
          role: 'invalid_role',
          id_manager: null,
        })
      ).rejects.toThrow('Role must be either "manager" or "employee" or "admin"!');
    });
  });

  describe('Hooks', () => {
    it('should create a user with a valid manager', async () => {
      let transaction;
      try {
        transaction = await sequelize.transaction();

        // Créer un manager
        const manager = await User.create({
          name: 'Alice',
          surname: 'Smith',
          mobileNumber: '0123456789',
          email: 'alice.smith.manager@example.com',
          password: 'Secure123@',
          role: 'manager',
          id_manager: null,
        }, { transaction });

        console.log('Manager created:', manager.toJSON());

        // Créer un employé avec un manager valide
        const employee = await User.create({
          name: 'John',
          surname: 'Doe',
          mobileNumber: '0123456789',
          email: 'john.doe.employee@example.com',
          password: 'Secure123@',
          role: 'employee',
          id_manager: manager.id,
        }, { transaction });

        console.log('Employee created:', employee.toJSON());

        await transaction.commit();
        expect(employee.id_manager).toBe(manager.id);
      } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error:', error);
        throw error;
      }
    });

    it('should not create a user with an invalid manager', async () => {
      // Créer un employé qui ne peut pas être manager
      const employee = await User.create({
        name: 'John',
        surname: 'Doe',
        mobileNumber: '0123456789',
        email: 'john.doe.employee1@example.com',
        password: 'Secure123@',
        role: 'employee',
        id_manager: null,
      });

      // Essayer de créer un autre employé avec un manager invalide (qui est un employé)
      await expect(
        User.create({
          name: 'Jane',
          surname: 'Doe',
          mobileNumber: '0123456789',
          email: 'jane.doe.employee1@example.com',
          password: 'Secure123@',
          role: 'employee',
          id_manager: employee.id,
        })
      ).rejects.toThrow('Only users with the role "manager" can be assigned as a manager.');
    });
  });
});
