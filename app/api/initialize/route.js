// When this route is fetched thorugh a get request /api/initialize so all the initial setup of the database will be done


import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mysql = require('mysql2/promise');
    
    // Database connection configuration
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: '',
    };
    
    // Create connection without database
    const connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS bookstore`);
    await connection.end();
    
    // Connect to database
    const dbPool = await mysql.createPool({
      ...dbConfig,
      database: 'bookstore',
    });
    
    // Drop existing tables in reverse order of dependencies
    const dropTables = [
      'DROP TABLE IF EXISTS Orders',
      'DROP TABLE IF EXISTS Books',
      'DROP TABLE IF EXISTS Authors',
      'DROP TABLE IF EXISTS Categories',
      'DROP TABLE IF EXISTS Customers'
    ];

    // Execute drop table queries
    for (const query of dropTables) {
      await dbPool.execute(query);
    }
    
    // Create tables
    const tables = [
      // Authors table
      `CREATE TABLE IF NOT EXISTS Authors (
        AuthorID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Bio TEXT
      )`,
      
      // Categories table
      `CREATE TABLE IF NOT EXISTS Categories (
        CategoryID INT AUTO_INCREMENT PRIMARY KEY,
        CategoryName VARCHAR(50) NOT NULL
      )`,
      
      // Books table
      `CREATE TABLE IF NOT EXISTS Books (
        BookID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(200) NOT NULL,
        AuthorID INT,
        CategoryID INT,
        Price DECIMAL(10, 2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0,
        FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID) ON DELETE CASCADE,
        FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
      )`,
      
      // Customers table
      `CREATE TABLE IF NOT EXISTS Customers (
        CustomerID INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(100) NOT NULL UNIQUE,
        Phone VARCHAR(20)
      )`,
      
      // Orders table
      `CREATE TABLE IF NOT EXISTS Orders (
        OrderID INT AUTO_INCREMENT PRIMARY KEY,
        CustomerID INT,
        BookID INT,
        Quantity INT NOT NULL,
        OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
        FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE
      )`
    ];
    
    // Execute table creation queries
    for (const query of tables) {
      await dbPool.execute(query);
    }
    
    // Add sample data
    const sampleData = [
      // Add some authors
      `INSERT INTO Authors (Name, Bio) 
       VALUES 
       ('J.K. Rowling', 'British author best known for the Harry Potter series'),
       ('Stephen King', 'American author of horror, supernatural fiction, suspense, and fantasy novels'),
       ('Agatha Christie', 'English writer known for her detective novels')`,
       
      // Add some categories
      `INSERT INTO Categories (CategoryName) 
       VALUES 
       ('Fiction'), 
       ('Mystery'), 
       ('Fantasy')`,
       
      // Add some books
      `INSERT INTO Books (Title, AuthorID, CategoryID, Price, Stock) 
       VALUES 
       ('Harry Potter and the Philosopher\'s Stone', 1, 3, 19.99, 50),
       ('The Shining', 2, 1, 15.99, 30),
       ('Murder on the Orient Express', 3, 2, 12.99, 25)`,
       
      // Add some customers
      `INSERT INTO Customers (Name, Email, Phone) 
       VALUES 
       ('John Doe', 'john@example.com', '555-1234'),
       ('Jane Smith', 'jane@example.com', '555-5678'),
       ('Bob Johnson', 'bob@example.com', '555-9012')`,
       
      // Add some orders
      `INSERT INTO Orders (CustomerID, BookID, Quantity, OrderDate) 
       VALUES 
       (1, 1, 2, '2023-01-15 10:30:00'),
       (2, 3, 1, '2023-02-20 14:45:00'),
       (3, 2, 3, '2023-03-25 16:15:00')`
    ];
    
    // Execute sample data queries
    for (const query of sampleData) {
      try {
        await dbPool.execute(query);
      } catch (error) {
        console.warn('Sample data query failed:', error.message);
      }
    }
    
    await dbPool.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize database', error: error.message }, 
      { status: 500 }
    );
  }
}
