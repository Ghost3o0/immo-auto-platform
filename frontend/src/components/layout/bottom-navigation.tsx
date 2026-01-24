'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageCircle, User, LucideIcon, Car } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { messagesApi } from '@/lib/api';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  auth?: boolean;
  badge?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Recherche', href: '/properties', icon: Search },
  { name: 'Favoris', href: '/dashboard/favorites', icon: Heart, auth: true },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle, auth: true, badge: true },
  { name: 'Profil', href: '/dashboard', icon: User, auth: true },
];

const navItemsNotAuth: NavItem[] = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Immobilier', href: '/properties', icon: Search },
  { name: 'Véhicules', href: '/vehicles', icon: Car },
  { name: 'Connexion', href: '/login', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      // Silently fail - don't spam console on network errors during polling
    }
  };

  const items = isAuthenticated ? navItems : navItemsNotAuth;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
                {item.badge && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn('truncate', active && 'font-medium')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
