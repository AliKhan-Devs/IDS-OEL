import { BookOpen, Users, BookmarkIcon, ShoppingCart, LayoutList } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const sections = [
    {
      title: 'Books',
      description: 'Manage your book inventory',
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      link: '/books',
      color: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Authors',
      description: 'Manage authors information',
      icon: <Users className="h-8 w-8 text-emerald-500" />,
      link: '/authors',
      color: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      title: 'Categories',
      description: 'Manage book categories',
      icon: <BookmarkIcon className="h-8 w-8 text-purple-500" />,
      link: '/categories',
      color: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      title: 'Customers',
      description: 'Manage customer details',
      icon: <Users className="h-8 w-8 text-amber-500" />,
      link: '/customers',
      color: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      title: 'Orders',
      description: 'Track and manage orders',
      icon: <ShoppingCart className="h-8 w-8 text-rose-500" />,
      link: '/orders',
      color: 'bg-rose-50 hover:bg-rose-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Bookstore Management System</CardTitle>
          <CardDescription>
            Manage your bookstore inventory, customers, and orders from one place
          </CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Access</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link href={section.link} key={section.title}>
            <Card className={`cursor-pointer transition-all ${section.color}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{section.title}</CardTitle>
                {section.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">System Overview</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View and manage the latest updates in your system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Books that need to be restocked soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Latest customer purchases</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}