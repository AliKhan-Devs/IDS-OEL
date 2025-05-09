const mysql = require('mysql2/promise');

async function testDatabase() {
  console.log('Testing database operations...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookstore'
  });

  try {
    // Test CREATE operation
    console.log('\nTesting CREATE operation...');
    const [createResult] = await connection.execute(
      'INSERT INTO Authors (Name, Bio) VALUES (?, ?)',
      ['Test Author', 'Test Bio']
    );
    console.log('CREATE successful:', createResult);

    // Test READ operation
    console.log('\nTesting READ operation...');
    const [readResult] = await connection.execute(
      'SELECT * FROM Authors WHERE Name = ?',
      ['Test Author']
    );
    console.log('READ successful:', readResult);

    // Test UPDATE operation
    console.log('\nTesting UPDATE operation...');
    const [updateResult] = await connection.execute(
      'UPDATE Authors SET Bio = ? WHERE Name = ?',
      ['Updated Test Bio', 'Test Author']
    );
    console.log('UPDATE successful:', updateResult);

    // Test SEARCH operation
    console.log('\nTesting SEARCH operation...');
    const [searchResult] = await connection.execute(
      'SELECT * FROM Authors WHERE Name LIKE ?',
      ['%Test%']
    );
    console.log('SEARCH successful:', searchResult);

    // Test DELETE operation
    console.log('\nTesting DELETE operation...');
    const [deleteResult] = await connection.execute(
      'DELETE FROM Authors WHERE Name = ?',
      ['Test Author']
    );
    console.log('DELETE successful:', deleteResult);

    console.log('\nAll database operations tested successfully!');
  } catch (error) {
    console.error('Error testing database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

testDatabase(); 