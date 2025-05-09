import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookstore',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Flag to track initialization status
let isInitialized = false;

export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Helper function to create tables if they don't exist
export async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  if (isInitialized) {
    console.log('Database already initialized, skipping...');
    return;
  }

  try {
    console.log('Creating temporary connection...');
    // Create a connection without database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log('Creating database if not exists...');
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConnection.end();
    console.log('Database created/verified successfully');

    console.log('Creating tables...');
    // Create Authors table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Authors (
        AuthorID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Bio TEXT
      )
    `);
    console.log('Authors table created/verified');

    // Create Categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Categories (
        CategoryID INT AUTO_INCREMENT PRIMARY KEY,
        CategoryName VARCHAR(50) NOT NULL
      )
    `);
    console.log('Categories table created/verified');

    // Create Books table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Books (
        BookID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(200) NOT NULL,
        AuthorID INT,
        CategoryID INT,
        Price DECIMAL(10, 2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0,
        FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID) ON DELETE SET NULL,
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL
      )
    `);
    console.log('Books table created/verified');

    // Create Customers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Customers (
        CustomerID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(100) NOT NULL UNIQUE,
        Phone VARCHAR(20)
      )
    `);
    console.log('Customers table created/verified');

    // Create Orders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Orders (
        OrderID INT AUTO_INCREMENT PRIMARY KEY,
        CustomerID INT,
        BookID INT,
        Quantity INT NOT NULL,
        OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE SET NULL,
        FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE SET NULL
      )
    `);
    console.log('Orders table created/verified');

    console.log('Inserting initial data...');
    // Insert initial data if tables are empty
    await insertInitialData();
    console.log('Initial data inserted successfully');

    isInitialized = true;
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

async function insertInitialData() {
  try {
    // Check if Authors table is empty
    const authors = await executeQuery({ query: 'SELECT COUNT(*) as count FROM Authors' });
    if (authors[0].count === 0) {
      console.log('Inserting initial authors...');
      await executeQuery({
        query: `INSERT INTO Authors (Name, Bio) VALUES 
          ('J.K. Rowling', 'British author best known for the Harry Potter series'),
          ('Stephen King', 'American author of horror, supernatural fiction, suspense, and fantasy novels'),
          ('Agatha Christie', 'English writer known for her detective novels')`
      });
    }

    // Check if Categories table is empty
    const categories = await executeQuery({ query: 'SELECT COUNT(*) as count FROM Categories' });
    if (categories[0].count === 0) {
      console.log('Inserting initial categories...');
      await executeQuery({
        query: `INSERT INTO Categories (CategoryName) VALUES 
          ('Fiction'), 
          ('Mystery'), 
          ('Fantasy')`
      });
    }

    // Check if Books table is empty
    const books = await executeQuery({ query: 'SELECT COUNT(*) as count FROM Books' });
    if (books[0].count === 0) {
      console.log('Inserting initial books...');
      await executeQuery({
        query: `INSERT INTO Books (Title, AuthorID, CategoryID, Price, Stock) VALUES 
          ('Harry Potter and the Philosopher\'s Stone', 1, 3, 19.99, 50),
          ('The Shining', 2, 1, 15.99, 30),
          ('Murder on the Orient Express', 3, 2, 12.99, 25)`
      });
    }
  } catch (error) {
    console.error('Error inserting initial data:', error);
    throw error;
  }
}

// Export the pool for direct access if needed
export { pool };