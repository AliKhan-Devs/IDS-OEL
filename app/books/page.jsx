"use client";

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    Title: '',
    AuthorID: '',
    CategoryID: '',
    Price: '',
    Stock: 0,
  });
  
  const columns = [
    {
      accessorKey: "BookID",
      header: "ID",
    },
    {
      accessorKey: "Title",
      header: "Title",
    },
    {
      accessorKey: "AuthorName",
      header: "Author",
    },
    {
      accessorKey: "CategoryName",
      header: "Category",
    },
    {
      accessorKey: "Price",
      header: "Price",
      cell: ({ row }) => `$${parseFloat(row.getValue("Price")).toFixed(2)}`,
    },
    {
      accessorKey: "Stock",
      header: "Stock",
    },
  ];

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchCategories();
  }, []);

  async function fetchBooks() {
    try {
      const response = await fetch('/api/books');
      const result = await response.json();
      
      if (result.success) {
        setBooks(result.data);
      } else {
        toast.error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Error fetching books');
    }
  }

  async function fetchAuthors() {
    try {
      const response = await fetch('/api/authors');
      const result = await response.json();
      
      if (result.success) {
        setAuthors(result.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      Title: '',
      AuthorID: '',
      CategoryID: '',
      Price: '',
      Stock: 0,
    });
    setIsEditing(false);
    setSelectedBook(null);
  }

  function handleEdit(book) {
    setIsEditing(true);
    setSelectedBook(book);
    setFormData({
      BookID: book.BookID,
      Title: book.Title,
      AuthorID: book.AuthorID ? book.AuthorID.toString() : '',
      CategoryID: book.CategoryID ? book.CategoryID.toString() : '',
      Price: book.Price,
      Stock: book.Stock,
    });
    setFormOpen(true);
  }

  function confirmDelete(book) {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = '/api/books';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Price: parseFloat(formData.Price),
          Stock: parseInt(formData.Stock),
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? 'Book updated successfully' : 'Book added successfully');
        setFormOpen(false);
        resetForm();
        fetchBooks();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Error saving book');
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/books?id=${selectedBook.BookID}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Book deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedBook(null);
        fetchBooks();
      } else {
        toast.error(result.message || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Error deleting book');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Books Management</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="Title">Title</Label>
                  <Input 
                    id="Title" 
                    name="Title" 
                    value={formData.Title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="AuthorID">Author</Label>
                  <Select 
                    value={formData.AuthorID || undefined} 
                    onValueChange={(value) => handleSelectChange('AuthorID', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map(author => (
                        <SelectItem key={author.AuthorID} value={author.AuthorID.toString()}>
                          {author.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="CategoryID">Category</Label>
                  <Select 
                    value={formData.CategoryID || undefined} 
                    onValueChange={(value) => handleSelectChange('CategoryID', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                          {category.CategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="Price">Price</Label>
                  <Input 
                    id="Price" 
                    name="Price" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={formData.Price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="Stock">Stock</Label>
                  <Input 
                    id="Stock" 
                    name="Stock" 
                    type="number" 
                    min="0" 
                    value={formData.Stock} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditing ? 'Update' : 'Add'} Book</Button>
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
              This action cannot be undone. This will permanently delete the book
              "{selectedBook?.Title}" and remove it from the database.
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
          <CardTitle>Books Inventory</CardTitle>
          <CardDescription>
            Manage your bookstore inventory, add new books, update details, or remove items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={books} 
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}