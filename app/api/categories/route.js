import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific category
      const query = 'SELECT * FROM Categories WHERE CategoryID = ?';
      const category = await executeQuery({ query, values: [id] });
      
      if (category.length === 0) {
        return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: category[0] });
    } else {
      // Get all categories
      const query = 'SELECT * FROM Categories';
      const categories = await executeQuery({ query });
      return NextResponse.json({ success: true, data: categories });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { CategoryName } = body;
    
    if (!CategoryName) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'INSERT INTO Categories (CategoryName) VALUES (?)';
    const result = await executeQuery({ query, values: [CategoryName] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category created successfully', 
      data: { CategoryID: result.insertId, CategoryName } 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { CategoryID, CategoryName } = body;
    
    if (!CategoryID || !CategoryName) {
      return NextResponse.json(
        { success: false, message: 'CategoryID and CategoryName are required' }, 
        { status: 400 }
      );
    }
    
    const query = 'UPDATE Categories SET CategoryName = ? WHERE CategoryID = ?';
    await executeQuery({ query, values: [CategoryName, CategoryID] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category updated successfully', 
      data: body 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update category', error: error.message }, 
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
        { success: false, message: 'Category ID is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'DELETE FROM Categories WHERE CategoryID = ?';
    await executeQuery({ query, values: [id] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: error.message }, 
      { status: 500 }
    );
  }
}