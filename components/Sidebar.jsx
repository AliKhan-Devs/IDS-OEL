"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Users, 
  BookmarkIcon, ShoppingCart, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    { 
      name: 'Books', 
      path: '/books', 
      icon: <BookOpen className="h-5 w-5" />
    },
    { 
      name: 'Authors', 
      path: '/authors', 
      icon: <Users className="h-5 w-5" />
    },
    { 
      name: 'Categories', 
      path: '/categories', 
      icon: <BookmarkIcon className="h-5 w-5" />
    },
    { 
      name: 'Customers', 
      path: '/customers', 
      icon: <Users className="h-5 w-5" />
    },
    { 
      name: 'Orders', 
      path: '/orders', 
      icon: <ShoppingCart className="h-5 w-5" />
    },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 p-4 flex items-center justify-between bg-background z-50 border-b">
        <Link href="/" className="font-semibold text-lg">Bookstore Admin</Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={cn(
        "bg-card fixed inset-y-0 z-40 flex w-64 flex-col border-r transition-transform md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="border-b p-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold text-lg">Bookstore Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-6 px-3">
          <ul className="space-y-1">
            {routes.map((route) => (
              <li key={route.path}>
                <Link 
                  href={route.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === route.path 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Bookstore Admin
          </p>
        </div>
      </aside>
    </>
  );
}