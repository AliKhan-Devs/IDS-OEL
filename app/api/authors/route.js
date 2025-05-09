import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific author
      const query = 'SELECT * FROM Authors WHERE AuthorID = ?';
      const author = await executeQuery({ query, values: [id] });
      
      if (author.length === 0) {
        return NextResponse.json({ success: false, message: 'Author not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: author[0] });
    } else {
      // Get all authors
      const query = 'SELECT * FROM Authors';
      const authors = await executeQuery({ query });
      return NextResponse.json({ success: true, data: authors });
    }
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch authors', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { Name, Bio } = body;
    
    if (!Name) {
      return NextResponse.json(
        { success: false, message: 'Author name is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'INSERT INTO Authors (Name, Bio) VALUES (?, ?)';
    const result = await executeQuery({ query, values: [Name, Bio || null] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Author created successfully', 
      data: { AuthorID: result.insertId, Name, Bio } 
    });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create author', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { AuthorID, Name, Bio } = body;
    
    if (!AuthorID || !Name) {
      return NextResponse.json(
        { success: false, message: 'AuthorID and Name are required' }, 
        { status: 400 }
      );
    }
    
    const query = 'UPDATE Authors SET Name = ?, Bio = ? WHERE AuthorID = ?';
    await executeQuery({ query, values: [Name, Bio || null, AuthorID] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Author updated successfully', 
      data: body 
    });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update author', error: error.message }, 
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
        { success: false, message: 'Author ID is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'DELETE FROM Authors WHERE AuthorID = ?';
    await executeQuery({ query, values: [id] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Author deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete author', error: error.message }, 
      { status: 500 }
    );
  }
}