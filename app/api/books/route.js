import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific book
      const query = `
        SELECT b.*, a.Name as AuthorName, c.CategoryName 
        FROM Books b
        LEFT JOIN Authors a ON b.AuthorID = a.AuthorID
        LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
        WHERE b.BookID = ?
      `;
      const book = await executeQuery({ query, values: [id] });
      
      if (book.length === 0) {
        return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: book[0] });
    } else {
      // Get all books with related data
      const query = `
        SELECT b.*, a.Name as AuthorName, c.CategoryName 
        FROM Books b
        LEFT JOIN Authors a ON b.AuthorID = a.AuthorID
        LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
      `;
      const books = await executeQuery({ query });
      return NextResponse.json({ success: true, data: books });
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch books', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { Title, AuthorID, CategoryID, Price, Stock } = body;
    
    // Validate required fields
    if (!Title || !Price) {
      return NextResponse.json(
        { success: false, message: 'Title and Price are required' }, 
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO Books (Title, AuthorID, CategoryID, Price, Stock)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery({ 
      query, 
      values: [Title, AuthorID || null, CategoryID || null, Price, Stock || 0] 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Book created successfully', 
      data: { BookID: result.insertId, ...body } 
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create book', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { BookID, Title, AuthorID, CategoryID, Price, Stock } = body;
    
    if (!BookID || !Title || !Price) {
      return NextResponse.json(
        { success: false, message: 'BookID, Title, and Price are required' }, 
        { status: 400 }
      );
    }
    
    const query = `
      UPDATE Books
      SET Title = ?, AuthorID = ?, CategoryID = ?, Price = ?, Stock = ?
      WHERE BookID = ?
    `;
    
    await executeQuery({ 
      query, 
      values: [Title, AuthorID || null, CategoryID || null, Price, Stock || 0, BookID] 
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Book updated successfully', 
      data: body 
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update book', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'DELETE FROM Books WHERE BookID = ?';
    await executeQuery({ query, values: [id] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Book deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete book', error: error.message }, 
      { status: 500 }
    );
  }
}