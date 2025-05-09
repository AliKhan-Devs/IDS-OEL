import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get a specific customer
      const query = 'SELECT * FROM Customers WHERE CustomerID = ?';
      const customer = await executeQuery({ query, values: [id] });
      
      if (customer.length === 0) {
        return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: customer[0] });
    } else {
      // Get all customers
      const query = 'SELECT * FROM Customers';
      const customers = await executeQuery({ query });
      return NextResponse.json({ success: true, data: customers });
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { Name, Email, Phone } = body;
    
    if (!Name || !Email) {
      return NextResponse.json(
        { success: false, message: 'Name and Email are required' }, 
        { status: 400 }
      );
    }
    
    const query = 'INSERT INTO Customers (Name, Email, Phone) VALUES (?, ?, ?)';
    const result = await executeQuery({ query, values: [Name, Email, Phone || null] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer created successfully', 
      data: { CustomerID: result.insertId, Name, Email, Phone } 
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { CustomerID, Name, Email, Phone } = body;
    
    if (!CustomerID || !Name || !Email) {
      return NextResponse.json(
        { success: false, message: 'CustomerID, Name, and Email are required' }, 
        { status: 400 }
      );
    }
    
    const query = 'UPDATE Customers SET Name = ?, Email = ?, Phone = ? WHERE CustomerID = ?';
    await executeQuery({ query, values: [Name, Email, Phone || null, CustomerID] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer updated successfully', 
      data: body 
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update customer', error: error.message }, 
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
        { success: false, message: 'Customer ID is required' }, 
        { status: 400 }
      );
    }
    
    const query = 'DELETE FROM Customers WHERE CustomerID = ?';
    await executeQuery({ query, values: [id] });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer', error: error.message }, 
      { status: 500 }
    );
  }
}