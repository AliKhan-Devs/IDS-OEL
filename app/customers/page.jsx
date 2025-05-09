"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
  });
  
  const columns = [
    {
      accessorKey: "CustomerID",
      header: "ID",
    },
    {
      accessorKey: "Name",
      header: "Name",
    },
    {
      accessorKey: "Email",
      header: "Email",
    },
    {
      accessorKey: "Phone",
      header: "Phone",
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers');
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      Name: '',
      Email: '',
      Phone: '',
    });
    setIsEditing(false);
    setSelectedCustomer(null);
  }

  function handleEdit(customer) {
    setIsEditing(true);
    setSelectedCustomer(customer);
    setFormData({
      CustomerID: customer.CustomerID,
      Name: customer.Name,
      Email: customer.Email,
      Phone: customer.Phone || '',
    });
    setFormOpen(true);
  }

  function confirmDelete(customer) {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = '/api/customers';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? 'Customer updated successfully' : 'Customer added successfully');
        setFormOpen(false);
        resetForm();
        fetchCustomers();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error saving customer');
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/customers?id=${selectedCustomer.CustomerID}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Customer deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedCustomer(null);
        fetchCustomers();
      } else {
        toast.error(result.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Error deleting customer');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="Name">Full Name</Label>
                  <Input 
                    id="Name" 
                    name="Name" 
                    value={formData.Name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="Email">Email</Label>
                  <Input 
                    id="Email" 
                    name="Email" 
                    type="email"
                    value={formData.Email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="Phone">Phone</Label>
                  <Input 
                    id="Phone" 
                    name="Phone" 
                    value={formData.Phone} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditing ? 'Update' : 'Add'} Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              "{selectedCustomer?.Name}" and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customers Database</CardTitle>
          <CardDescription>
            Manage your customer information, add new customers, update details, or remove records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={customers} 
            searchColumn="Name"
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}