const mysql = require('mysql2/promise');

async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // Create a connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bookstore'}`);
    await connection.end();

    // Create a new connection with the database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bookstore'
    });

    // Create Authors table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS Authors (
        AuthorID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Bio TEXT
      )
    `);

    // Create Categories table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS Categories (
        CategoryID INT AUTO_INCREMENT PRIMARY KEY,
        CategoryName VARCHAR(255) NOT NULL
      )
    `);

    // Create Books table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS Books (
        BookID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255) NOT NULL,
        AuthorID INT,
        CategoryID INT,
        Price DECIMAL(10,2),
        Stock INT,
        FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID),
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
      )
    `);

    // Create Customers table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS Customers (
        CustomerID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Phone VARCHAR(20),
        Address TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Orders table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS Orders (
        OrderID INT AUTO_INCREMENT PRIMARY KEY,
        CustomerID INT,
        OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        TotalAmount DECIMAL(10,2),
        Status VARCHAR(50) DEFAULT 'Pending',
        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
      )
    `);

    // Create OrderItems table for order details
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS OrderItems (
        OrderItemID INT AUTO_INCREMENT PRIMARY KEY,
        OrderID INT,
        BookID INT,
        Quantity INT,
        Price DECIMAL(10,2),
        FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
        FOREIGN KEY (BookID) REFERENCES Books(BookID)
      )
    `);

    // Insert sample data
    await dbConnection.execute(`
      INSERT IGNORE INTO Authors (Name, Bio) VALUES 
      ('J.K. Rowling', 'British author best known for the Harry Potter series'),
      ('George R.R. Martin', 'American novelist and short story writer'),
      ('Stephen King', 'American author of horror and supernatural fiction')
    `);

    await dbConnection.execute(`
      INSERT IGNORE INTO Categories (CategoryName) VALUES 
      ('Fantasy'),
      ('Science Fiction'),
      ('Mystery'),
      ('Horror')
    `);

    await dbConnection.execute(`
      INSERT IGNORE INTO Books (Title, AuthorID, CategoryID, Price, Stock) VALUES 
      ('Harry Potter and the Philosopher''s Stone', 1, 1, 19.99, 100),
      ('A Game of Thrones', 2, 1, 24.99, 75),
      ('The Shining', 3, 4, 15.99, 50)
    `);

    // Insert sample customers
    await dbConnection.execute(`
      INSERT IGNORE INTO Customers (Name, Email, Phone, Address) VALUES 
      ('John Doe', 'john@example.com', '123-456-7890', '123 Main St'),
      ('Jane Smith', 'jane@example.com', '098-765-4321', '456 Oak Ave')
    `);

    // Insert sample orders
    await dbConnection.execute(`
      INSERT IGNORE INTO Orders (CustomerID, TotalAmount, Status) VALUES 
      (1, 39.98, 'Completed'),
      (2, 24.99, 'Pending')
    `);

    // Insert sample order items
    await dbConnection.execute(`
      INSERT IGNORE INTO OrderItems (OrderID, BookID, Quantity, Price) VALUES 
      (1, 1, 2, 19.99),
      (2, 2, 1, 24.99)
    `);

    await dbConnection.end();
    console.log('Database and tables created successfully with sample data');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 