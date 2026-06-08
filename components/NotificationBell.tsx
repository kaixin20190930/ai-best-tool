'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import Link from 'next/link';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from '@/app/actions/notifications';

interface NotificationBellProps {
  userId: string;
}

/**
 * NotificationBell Component
 *
 * Displays a notification bell icon with unread count badge
 * and a dropdown menu showing recent notifications
 */
export default function NotificationBell({ userId }: NotificationBellProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(userId, 10),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id, userId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }

    setShowMenu(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Handle delete notification
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notificationId, userId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (notifications.find((n) => n.id === notificationId && !n.read)) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Format relative time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setShowMenu(!showMenu)}
        className='relative rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100'
        aria-label='Notifications'
      >
        <Bell className='size-6' />
        {unreadCount > 0 && (
          <span className='absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            role='button'
            tabIndex={0}
            className='fixed inset-0 z-40'
            onClick={() => setShowMenu(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowMenu(false)}
            aria-label='Close menu'
          />

          {/* Notification menu */}
          <div className='theme-surface absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 shadow-sm sm:w-96'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-slate-200 p-4'>
              <h3 className='text-lg font-semibold text-slate-900'>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type='button'
                  onClick={handleMarkAllAsRead}
                  className='flex items-center gap-1 text-sm text-cyan-700 hover:text-cyan-800'
                >
                  <Check className='size-4' />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className='max-h-96 overflow-y-auto'>
              {loading && (
                <div className='p-8 text-center text-slate-500'>Loading...</div>
              )}
              {!loading && notifications.length === 0 && (
                <div className='p-8 text-center text-slate-500'>
                  <Bell className='mx-auto mb-2 size-12 text-slate-300' />
                  <p>No updates yet</p>
                </div>
              )}
              {!loading && notifications.length > 0 && (
                notifications.map((notification) => {
                  const content = (
                    <div
                      role='button'
                      tabIndex={0}
                      onClick={() => handleNotificationClick(notification)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                      className={`group relative cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 ${
                        !notification.read ? 'bg-cyan-50/50' : ''
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className='absolute left-2 top-1/2 size-2 -translate-y-1/2 rounded-full bg-cyan-600' />
                      )}

                      <div className='ml-4'>
                        <div className='flex items-start justify-between gap-2'>
                          <h4 className='font-medium text-slate-900'>{notification.title}</h4>
                          <button
                            type='button'
                            onClick={(e) => handleDelete(notification.id, e)}
                            className='opacity-0 transition-opacity group-hover:opacity-100'
                            aria-label='Delete'
                          >
                            <X className='size-4 text-slate-400 hover:text-slate-600' />
                          </button>
                        </div>
                        {notification.content && (
                          <p className='mt-1 text-sm text-slate-600'>{notification.content}</p>
                        )}
                        <p className='mt-1 text-xs text-slate-400'>
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  );

                  return notification.link ? (
                    <Link key={notification.id} href={notification.link}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className='border-t border-slate-200 p-2 text-center'>
                <Link
                  href='/profile/notifications'
                  onClick={() => setShowMenu(false)}
                  className='text-sm text-cyan-700 hover:text-cyan-800'
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
