'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderForm } from './components/order-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid response format');
      }
      const formattedOrders = result.data.map(order => ({
        ...order,
        TotalAmount: parseFloat(order.TotalAmount) || 0
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmit = async (data) => {
    try {
      const response = await fetch('/api/orders', {
        method: selectedOrder ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          orderId: selectedOrder?.OrderID
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save order');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to save order');
      }

      await fetchOrders();
      setIsDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error saving order:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError(error.message);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const filteredOrders = useMemo(() => {
    if (!debouncedSearchQuery) return orders;

    const searchLower = debouncedSearchQuery.toLowerCase();
    return orders.filter(order => {
      const orderId = order.OrderID?.toString() || '';
      const customerName = order.CustomerName?.toLowerCase() || '';
      const status = order.Status?.toLowerCase() || '';
      const items = order.Items?.toLowerCase() || '';

      return (
        orderId.includes(searchLower) ||
        customerName.includes(searchLower) ||
        status.includes(searchLower) ||
        items.includes(searchLower)
      );
    });
  }, [orders, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedOrder(null)}>Add Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedOrder ? 'Edit Order' : 'Add Order'}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedOrder ? 'Update the order details below.' : 'Fill in the order details below.'}
              </p>
            </DialogHeader>
            <OrderForm 
              onSubmit={handleSubmit} 
              initialData={selectedOrder}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.OrderID}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.OrderID}</span>
                <div className="flex gap-2">
                  <Badge variant={order.Status === 'Completed' ? 'success' : 'default'}>
                    {order.Status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(order)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(order.OrderID)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p>{new Date(order.OrderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <p>{order.CustomerName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Items</p>
                  <p>{order.Items}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="font-semibold">${Number(order.TotalAmount).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {debouncedSearchQuery ? 'No orders found matching your search' : 'No orders found'}
          </div>
        )}
      </div>
    </div>
  );
} 