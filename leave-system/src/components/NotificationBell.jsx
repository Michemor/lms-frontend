import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useLeaveBalance } from '../hooks/useLeaveBalance';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { lowBalanceLeaves, isLoading } = useLeaveBalance();

  const notificationCount = lowBalanceLeaves.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
      >
        <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
              {notificationCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-3 sm:p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Notifications</h3>
          </div>
          <div className="py-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="text-slate-500 text-center py-4 text-sm">Loading balances...</p>
            ) : notificationCount > 0 ? (
              lowBalanceLeaves.map((leaveType) => (
                <div key={leaveType.id} className="px-3 sm:px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                  <p className="font-semibold text-slate-800 text-sm">Low Leave Balance</p>
                  <p className="text-xs text-slate-600 mt-1">
                    You have <span className="font-bold text-red-600">{leaveType.remaining} day{leaveType.remaining !== 1 ? 's' : ''}</span> remaining for <span className="font-bold">{leaveType.name}</span>.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4 text-sm">No notifications right now.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
