"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusIcon } from "lucide-react";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Bio: '',
  });
  
  const columns = [
    {
      accessorKey: "AuthorID",
      header: "ID",
    },
    {
      accessorKey: "Name",
      header: "Name",
    },
    {
      accessorKey: "Bio",
      header: "Biography",
      cell: ({ row }) => {
        const bio = row.getValue("Bio");
        return bio ? bio.substring(0, 100) + (bio.length > 100 ? '...' : '') : '';
      },
    },
  ];

  useEffect(() => {
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    try {
      const response = await fetch('/api/authors');
      const result = await response.json();
      
      if (result.success) {
        setAuthors(result.data);
      } else {
        toast.error('Failed to fetch authors');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Error fetching authors');
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      Name: '',
      Bio: '',
    });
    setIsEditing(false);
    setSelectedAuthor(null);
  }

  function handleEdit(author) {
    setIsEditing(true);
    setSelectedAuthor(author);
    setFormData({
      AuthorID: author.AuthorID,
      Name: author.Name,
      Bio: author.Bio || '',
    });
    setFormOpen(true);
  }

  function confirmDelete(author) {
    setSelectedAuthor(author);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = '/api/authors';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(isEditing ? 'Author updated successfully' : 'Author added successfully');
        setFormOpen(false);
        resetForm();
        fetchAuthors();
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error('Error saving author');
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/authors?id=${selectedAuthor.AuthorID}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Author deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedAuthor(null);
        fetchAuthors();
      } else {
        toast.error(result.message || 'Failed to delete author');
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error('Error deleting author');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Authors Management</h1>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Author
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Author' : 'Add New Author'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="Name">Name</Label>
                  <Input 
                    id="Name" 
                    name="Name" 
                    value={formData.Name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="Bio">Biography</Label>
                  <Textarea 
                    id="Bio" 
                    name="Bio" 
                    rows={5}
                    value={formData.Bio} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{isEditing ? 'Update' : 'Add'} Author</Button>
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
              This action cannot be undone. This will permanently delete the author
              "{selectedAuthor?.Name}" and remove it from the database.
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
          <CardTitle>Authors Directory</CardTitle>
          <CardDescription>
            Manage your author database, add new authors, update information, or remove entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={authors} 
            searchColumn="Name"
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}