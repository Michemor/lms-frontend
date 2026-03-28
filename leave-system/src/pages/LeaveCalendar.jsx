import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authhook';
import { useAlert } from '../hooks/alerthook';
import { getMyLeaves, listLeaves } from '../services/ApiClient';
import ProtectedLayout from '../components/ProtectedLayout';
import { getUserDisplayName } from '../utils/userUtils';

export default function LeaveCalendar() {
  const location = useLocation();
  const { user } = useAuth();
  const { showError } = useAlert();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveEvents, setLeaveEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveEvents = async () => {
      try {
        setIsLoading(true);
        const res = user.is_admin ? await listLeaves() : await getMyLeaves();
        const rawData = res.data;

        if (rawData) {
          let leaveData = Array.isArray(rawData) ? rawData : rawData.results || [];
          
          // For non-admins, filter out rejected leaves
          if (!user.is_admin) {
            leaveData = leaveData.filter(leave => String(leave.status).toLowerCase() !== 'rejected');
          }
          
          const events = leaveData.map(leave => {
            // Try multiple possible field names for employee identification
            let employeeName = leave.employee_name || 
                              leave.employee?.first_name || 
                              leave.employee?.full_name ||
                              leave.employee?.name ||
                              leave.first_name ||
                              leave.full_name ||
                              leave.name ||
                              'Unknown Employee';
            
            // If we have first_name and last_name, combine them
            if (leave.employee?.first_name && leave.employee?.last_name) {
              employeeName = `${leave.employee.first_name} ${leave.employee.last_name}`;
            } else if (leave.first_name && leave.last_name) {
              employeeName = `${leave.first_name} ${leave.last_name}`;
            }

            return {
              date: leave.start_date,
              endDate: leave.end_date,
              type: leave.leave_type_name || leave.leave_type || leave.type || 'Leave',
              title: user.is_admin ? `${employeeName}: ${leave.reason || ''}` : leave.reason || '',
              status: leave.status || 'pending',
              employeeName: employeeName
            };
          });
          
          setLeaveEvents(events);
        } else {
          showError('No leave data found.');
        }
      } catch (error) {
        console.error('Error fetching leave events:', error);
        showError('Failed to fetch leave events. You may not have the required permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchLeaveEvents();
    }
  }, [showError, user]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getLeavesForDate = (day) => {
    if (!day) return [];

    const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    cellDate.setHours(0, 0, 0, 0);
    return leaveEvents.filter(event => {
      if (!event.date || !event.endDate) return false;

      const [sYear, sMonth, sDay] = event.date.split('-').map(Number);
      const start = new Date(sYear, sMonth - 1, sDay);
      start.setHours(0, 0, 0, 0);

      const [eYear, eMonth, eDay] = event.endDate.split('-').map(Number);
      const end = new Date(eYear, eMonth - 1, eDay);
      end.setHours(0, 0, 0, 0);

      return cellDate >= start && cellDate <= end;
    })
  }
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getLeaveColor = (status) => {
    const statusLower = String(status || 'pending').toLowerCase();
    if (statusLower === 'approved') return 'bg-green-100 border-green-400';
    if (statusLower === 'rejected') return 'bg-red-100 border-red-400';
    if (statusLower === 'pending') return 'bg-yellow-100 border-yellow-400';
    return 'bg-slate-100 border-slate-400';
  };

  const getLeaveStatusBadgeColor = (status) => {
    const statusLower = String(status || 'pending').toLowerCase();
    if (statusLower === 'approved') return 'bg-green-500';
    if (statusLower === 'rejected') return 'bg-red-500';
    if (statusLower === 'pending') return 'bg-yellow-500';
    return 'bg-slate-500';
  };

  const pageTitle = user?.is_admin ? "Admin Leave Calendar" : `${getUserDisplayName(user)}'s Leave Calendar`;
  const pageSubtitle = user?.is_admin ? "View all employee leave dates" : "View your approved and pending leave dates";

  return (
    <ProtectedLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      currentPath={location.pathname}
    >
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow border border-slate-200 p-8 text-center">
            <p className="text-slate-600">Loading calendar...</p>
          </div>
        ) : (
        <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
          
          {/* Calendar Container */}
          <div className="rounded-lg border border-slate-200 p-6 bg-slate-50">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="px-3 py-2 hover:bg-slate-100 rounded transition"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="px-3 py-2 hover:bg-slate-100 rounded transition"
          >
            →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-bold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const leavesOnDay = day ? getLeavesForDate(day) : [];
            const hasLeave = leavesOnDay.length > 0;
            
            return (
              <div
                key={index}
                className={`min-h-28 p-2 rounded border text-sm flex flex-col ${
                  !day
                    ? 'bg-slate-50 border-transparent'
                    : 'bg-white border-slate-200'
                }`}
              >
                {day && (
                  <>
                    <div className="font-bold text-slate-900 mb-1">{day}</div>
                    <div className="space-y-1 overflow-y-auto">
                    {hasLeave && leavesOnDay.map((leave, idx) => (
                      <div 
                        key={idx} 
                        className={`p-1 rounded text-xs ${getLeaveColor(leave.status)}`}
                        title={user.is_admin ? `${leave.employeeName}: ${leave.type} (${leave.status})` : `${leave.type} (${leave.status})`}
                      >
                        {user.is_admin ? (
                            <>
                                <span className={`font-semibold ${getLeaveStatusBadgeColor(leave.status)} text-white px-1 rounded-full text-xs`}>
                                  {leave.employeeName && leave.employeeName.length > 0 ? leave.employeeName.split(' ')[0] : 'Emp'}
                                </span> - {leave.type}
                            </>
                        ) : (
                            <>{leave.type}</>
                        )}
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
              <span className="text-sm text-slate-600">Approved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
              <span className="text-sm text-slate-600">Pending</span>
            </div>
            {user && user.is_admin && (
                <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                <span className="text-sm text-slate-600">Rejected</span>
                </div>
            )}
          </div>

          <h3 className="font-bold text-slate-900 mb-3">{user.is_admin ? "All Leave Events" : "Your Leave Events"}</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leaveEvents.length > 0 ? (
              leaveEvents.map((event, idx) => {
                const safeStatus = event.status || 'pending';
                return (
                <div key={idx} className="flex items-start gap-3 text-sm p-2 bg-slate-50 rounded">
                  <div className={`w-3 h-3 mt-1 rounded flex-shrink-0 ${getLeaveStatusBadgeColor(safeStatus)}`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {user.is_admin ? `${event.employeeName} - ` : ''}{event.type} ({safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)})
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatDateRange(event.date, event.endDate)}
                    </div>
                    {event.title && <div className="text-xs text-slate-600 mt-1">{event.title}</div>}
                  </div>
                </div>
              );
              })
            ) : (
              <p className="text-slate-600 text-sm">{user.is_admin ? "No leave events scheduled for any employee." : "You have no upcoming approved or pending leaves."}</p>
            )}
          </div>

          {/* End Calendar Container */}
          </div>
        </div>

      </div> )}
      </div>
    </ProtectedLayout>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return 'N/A';
  if (!endDate || startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
