'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
}

export function Drawer({ open, onClose, title, children, side = 'bottom' }: DrawerProps) {
  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses = {
    left: 'inset-y-0 left-0 w-full max-w-sm animate-in slide-in-from-left',
    right: 'inset-y-0 right-0 w-full max-w-sm animate-in slide-in-from-right',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl animate-in slide-in-from-bottom',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'absolute bg-background shadow-xl flex flex-col',
          sideClasses[side]
        )}
      >
        {/* Handle bar for bottom drawer */}
        {side === 'bottom' && (
          <div className="flex justify-center py-2">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 scroll-smooth-mobile">
          {children}
        </div>
      </div>
    </div>
  );
}
