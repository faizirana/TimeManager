const { User } = require('../models/index.cjs'); // Ajustez le chemin selon votre structure

async function testHook() {
  try {
    // D'abord, créer un employee (John)
    const employee = await User.create({
      name: 'John',
      surname: 'Doe',
      mobileNumber: '0123456789',
      email: 'john.doe@example.com',
      password: 'secure123',
      role: 'employee',
      id_manager: null,
    });
    console.log('✅ Employee créé avec succès :', employee.toJSON());

    // Ensuite, essayer de créer un manager avec l'ID de l'employee comme id_manager
    // Cela devrait déclencher une erreur grâce au hook
    const manager = await User.create({
      name: 'Alice',
      surname: 'Smith',
      mobileNumber: '0987654321',
      email: 'alice.smith@example.com',
      password: 'secure123',
      role: 'manager',
      id_manager: employee.id, // ID de l'employee, ce qui devrait déclencher une erreur
    });
    console.log('❌ Ce message ne devrait pas s\'afficher si le hook fonctionne correctement.');
  } catch (error) {
    console.log('✅ Erreur attendue :', error.message);
  }
}

testHook();
