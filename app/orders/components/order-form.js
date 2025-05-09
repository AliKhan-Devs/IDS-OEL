'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(z.object({
    bookId: z.string().min(1, 'Book is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    price: z.string().min(1, 'Price is required'),
  })),
  status: z.string().min(1, 'Status is required'),
});

export function OrderForm({ onSubmit, initialData }) {
  const [customers, setCustomers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.CustomerID?.toString() || '',
      items: [{ bookId: '', quantity: '', price: '' }],
      status: initialData?.Status || 'Pending',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [customersRes, booksRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/books'),
        ]);

        if (!customersRes.ok || !booksRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [customersData, booksData] = await Promise.all([
          customersRes.json(),
          booksRes.json(),
        ]);

        // Check if the response has the expected structure
        if (!customersData?.data || !booksData?.data) {
          throw new Error('Invalid data format received');
        }

        setCustomers(customersData.data);
        setBooks(booksData.data);

        // If we have initial data, format it for the form
        if (initialData) {
          // Parse the items string into an array of items
          const itemsArray = initialData.Items ? [initialData.Items].map(item => {
            // Extract book title, quantity, and price from the string
            const match = item.match(/(.*?) \((\d+) x \$(\d+\.?\d*)\)/);
            if (match) {
              const [_, title, quantity, price] = match;
              // Find the book in the books array
              const book = booksData.data.find(b => b.Title === title);
              if (book) {
                return {
                  bookId: book.BookID.toString(),
                  quantity: quantity,
                  price: price,
                };
              }
            }
            return null;
          }).filter(Boolean) : [];

          // Reset the form with the formatted data
          form.reset({
            customerId: initialData.CustomerID?.toString() || '',
            items: itemsArray.length > 0 ? itemsArray : [{ bookId: '', quantity: '', price: '' }],
            status: initialData.Status || 'Pending',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData, form]);

  const handleSubmit = async (data) => {
    try {
      // Convert string values to appropriate types
      const formattedData = {
        ...data,
        customerId: parseInt(data.customerId, 10),
        items: data.items.map(item => ({
          bookId: parseInt(item.bookId, 10),
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price),
        })),
      };

      // Validate the data before submitting
      if (!formattedData.customerId || isNaN(formattedData.customerId)) {
        throw new Error('Invalid customer selected');
      }

      if (!formattedData.items.length) {
        throw new Error('At least one item is required');
      }

      for (const item of formattedData.items) {
        if (!item.bookId || isNaN(item.bookId)) {
          throw new Error('Invalid book selected');
        }
        if (!item.quantity || isNaN(item.quantity) || item.quantity < 1) {
          throw new Error('Invalid quantity');
        }
        if (!item.price || isNaN(item.price) || item.price <= 0) {
          throw new Error('Invalid price');
        }
      }

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    }
  };

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [...currentItems, { bookId: '', quantity: '', price: '' }]);
  };

  const removeItem = (index) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-4">Loading form data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!Array.isArray(customers) || !Array.isArray(books) || customers.length === 0 || books.length === 0) {
    return <div className="p-4 text-yellow-500">No customers or books available. Please add some first.</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || undefined}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem 
                      key={customer.CustomerID} 
                      value={customer.CustomerID.toString()}
                    >
                      {customer.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center sticky top-0 bg-background py-2 z-10">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button type="button" onClick={addItem} variant="outline">
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {form.watch('items').map((_, index) => (
              <div key={index} className="grid gap-4 p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.bookId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Find the selected book and set its price
                          const selectedBook = books.find(book => book.BookID.toString() === value);
                          if (selectedBook) {
                            form.setValue(`items.${index}.price`, selectedBook.Price.toString());
                          }
                        }}
                        value={field.value || undefined}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a book" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {books.map((book) => (
                            <SelectItem 
                              key={book.BookID} 
                              value={book.BookID.toString()}
                            >
                              {book.Title} - ${book.Price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="Enter quantity" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Enter price" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-background py-4 border-t">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end mt-4">
            <Button type="submit">Save Order</Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 