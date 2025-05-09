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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    CategoryName: '',
  });
  
  const columns = [
    {
      accessorKey: "CategoryID",
      header: "ID",
    },
    {
      accessorKey: "CategoryName",
      header: "Category Name",
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      CategoryName: '',
    });
    setIsEditing(false);
    setSelectedCategory(null);
  }

  function handleEdit(category) {
    setIsEditing(true);
    setSelectedCategory(category);
    setFormData({
      CategoryID: category.CategoryID,
      CategoryName: category.CategoryName,
    });
    setFormOpen(true);
  }

  function confirmDelete(category) {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? 'Category updated successfully' : 'Category added successfully');
        setFormOpen(false);
        resetForm();
        fetchCategories();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/categories?id=${selectedCategory.CategoryID}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Category deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="CategoryName">Category Name</Label>
                <Input 
                  id="CategoryName" 
                  name="CategoryName" 
                  value={formData.CategoryName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditing ? 'Update' : 'Add'} Category</Button>
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
              This action cannot be undone. This will permanently delete the category
              "{selectedCategory?.CategoryName}" and remove it from the database.
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
          <CardTitle>Book Categories</CardTitle>
          <CardDescription>
            Manage your book categories, add new ones, update names, or remove unused categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={categories} 
            searchColumn="CategoryName"
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}