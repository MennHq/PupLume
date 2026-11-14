import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, Activity, Sparkles, CheckCircle2, Volume2, ShieldCheck, Droplets } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/react';
import { api } from '../../../convex/_generated/api';
import { Modal } from './Modal';
import { storage } from '../../lib/storage';
import { NotificationItem } from '../../types';
import { engine as notificationEngine } from '../../lib/NotificationEngine';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (url: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const { user } = useUser();
  const cloudNotifications = useQuery(
    api.notifications.listNotifications,
    user?.id ? { userId: user.id } : 'skip'
  );
  const markReadMutation = useMutation(api.notifications.markNotificationRead);
  const markAllReadMutation = useMutation(api.notifications.markAllNotificationsRead);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [permission, setPermission] = useState<NotificationPermission>(() => 
    notificationEngine.getPermissionStatus()
  );
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (cloudNotifications) {
      const mapped: NotificationItem[] = cloudNotifications.map((n: any) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        category: (n.category as NotificationItem['category']) || 'reminder',
        timestamp: n.timestamp,
        actionUrl: n.actionUrl,
        read: Boolean(n.read),
      }));
      setNotifications(mapped);
      storage.saveNotifications(mapped);
    } else if (isOpen) {
      setNotifications(storage.getNotifications());
    }
    if (isOpen) {
      setPermission(notificationEngine.getPermissionStatus());
    }
  }, [cloudNotifications, isOpen]);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setNotifications(storage.getNotifications());
    });
    return unsub;
  }, []);

  const filtered = notifications.filter(n => filter === 'all' || !n.read);

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      markAllReadMutation({ userId: user.id }).catch((err) =>
        console.debug('[NotificationCenter] markAllRead note:', err)
      );
    }
  };

  const handleItemClick = (n: NotificationItem) => {
    storage.markNotificationRead(n.id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    if (user?.id) {
      markReadMutation({ id: n.id, userId: user.id }).catch((err) =>
        console.debug('[NotificationCenter] markRead note:', err)
      );
    }
    if (n.actionUrl && onSelectAction) {
      onSelectAction(n.actionUrl);
      onClose();
    }
  };

  const handleEnablePush = async () => {
    const res = await notificationEngine.requestPermission();
    setPermission(res);
    if (res === 'granted' && user?.id) {
      await notificationEngine.syncPushSubscriptionToCloud(user.id);
    }
  };

  const handleTestPush = async () => {
    setTestSent(true);
    await notificationEngine.testNotification();
    setNotifications(storage.getNotifications());
    setTimeout(() => setTestSent(false), 3000);
  };

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'health':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-[#8B5E3C]" />;
      case 'potty':
        return <Droplets className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      subtitle="Reminders, health alerts, and AI insights"
      maxWidth="md"
    >
      <div className="space-y-3">
        {/* Web Push Notification Status Banner */}
        <div className="p-3 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-xl shrink-0 ${
              permission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {permission === 'granted' ? <ShieldCheck className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#2C211B] flex items-center gap-1.5">
                <span>{permission === 'granted' ? 'Background Alerts Active' : 'Enable Device Push Alerts'}</span>
                {permission === 'granted' && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                    Live
                  </span>
                )}
              </h5>
              <p className="text-[11px] text-[#766A63] truncate">
                {permission === 'granted'
                  ? 'Fires potty alarms & task reminders even when tab is closed'
                  : 'Get phone & desktop alerts when potty breaks are due'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {permission === 'granted' ? (
              <button
                type="button"
                onClick={handleTestPush}
                disabled={testSent}
                className="px-2.5 py-1 rounded-xl bg-white text-[#2C211B] border border-[#E8DDD3] hover:bg-[#F3E7DA] text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                title="Send a sample notification to your device"
              >
                <Volume2 className="w-3 h-3 text-[#8B5E3C]" />
                <span>{testSent ? 'Sent!' : 'Test Alert'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#724C30] text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD3]">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'all' ? 'bg-[#8B5E3C] text-white' : 'bg-[#F3E7DA] text-[#5F3E29]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filter === 'unread' ? 'bg-[#8B5E3C] text-white' : 'bg-[#F3E7DA] text-[#5F3E29]'
              }`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="text-xs text-[#8B5E3C] hover:text-[#5F3E29] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#766A63]">
              <Bell className="w-8 h-8 text-[#E8DDD3] mx-auto mb-2" />
              All caught up! No notifications.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.read
                    ? 'bg-white border-[#E8DDD3]/80 opacity-75'
                    : 'bg-[#FFF9F2] border-[#8B5E3C]/30 shadow-xs hover:border-[#8B5E3C]'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-[#E8DDD3] flex-shrink-0 mt-0.5">
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#2C211B] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#766A63] flex-shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#766A63] mt-1 leading-relaxed">{item.message}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#8B5E3C] mt-2 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
