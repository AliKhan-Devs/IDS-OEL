import { executeQuery, pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching orders...');
    const orders = await executeQuery({
      query: `
        SELECT 
          o.OrderID,
          o.OrderDate,
          o.TotalAmount,
          o.Status,
          c.Name as CustomerName,
          GROUP_CONCAT(
            CONCAT(b.Title, ' (', oi.Quantity, ' x $', oi.Price, ')')
            SEPARATOR ', '
          ) as Items
        FROM Orders o
        LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        LEFT JOIN Books b ON oi.BookID = b.BookID
        GROUP BY o.OrderID, o.OrderDate, o.TotalAmount, o.Status, c.Name
        ORDER BY o.OrderDate DESC
      `
    });

    console.log('Orders fetched:', orders);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { customerId, items, status } = await request.json();

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert order
      const [orderResult] = await connection.execute(
        'INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, Status) VALUES (?, NOW(), ?, ?)',
        [customerId, totalAmount, status || 'Pending']
      );
      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO OrderItems (OrderID, BookID, Quantity, Price) VALUES (?, ?, ?, ?)',
          [orderId, item.bookId, item.quantity, item.price]
        );

        // Update book stock
        await connection.execute(
          'UPDATE Books SET Stock = Stock - ? WHERE BookID = ?',
          [item.quantity, item.bookId]
        );
      }

      await connection.commit();
      return NextResponse.json({ 
        success: true, 
        message: 'Order created successfully',
        data: { orderId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { orderId, customerId, items, status } = await request.json();

    if (!orderId || !customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current order items
      const [currentItems] = await connection.execute(
        'SELECT BookID, Quantity FROM OrderItems WHERE OrderID = ?',
        [orderId]
      );

      // Return stock for current items
      for (const item of currentItems) {
        await connection.execute(
          'UPDATE Books SET Stock = Stock + ? WHERE BookID = ?',
          [item.Quantity, item.BookID]
        );
      }

      // Delete current order items
      await connection.execute('DELETE FROM OrderItems WHERE OrderID = ?', [orderId]);

      // Update order
      await connection.execute(
        'UPDATE Orders SET CustomerID = ?, TotalAmount = ?, Status = ? WHERE OrderID = ?',
        [customerId, totalAmount, status, orderId]
      );

      // Insert new order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO OrderItems (OrderID, BookID, Quantity, Price) VALUES (?, ?, ?, ?)',
          [orderId, item.bookId, item.quantity, item.price]
        );

        // Update book stock
        await connection.execute(
          'UPDATE Books SET Stock = Stock - ? WHERE BookID = ?',
          [item.quantity, item.bookId]
        );
      }

      await connection.commit();
      return NextResponse.json({ 
        success: true, 
        message: 'Order updated successfully',
        data: { orderId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order', error: error.message },
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
        { success: false, message: 'Order ID is required' }, 
        { status: 400 }
      );
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get order items
      const [orderItems] = await connection.execute(
        'SELECT BookID, Quantity FROM OrderItems WHERE OrderID = ?',
        [id]
      );

      // Return stock for all items
      for (const item of orderItems) {
        await connection.execute(
          'UPDATE Books SET Stock = Stock + ? WHERE BookID = ?',
          [item.Quantity, item.BookID]
        );
      }

      // Delete order items
      await connection.execute('DELETE FROM OrderItems WHERE OrderID = ?', [id]);
      // Delete the order
      await connection.execute('DELETE FROM Orders WHERE OrderID = ?', [id]);

      await connection.commit();
      return NextResponse.json({ 
        success: true, 
        message: 'Order deleted successfully' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete order', error: error.message }, 
      { status: 500 }
    );
  }
}