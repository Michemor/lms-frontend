



export default function ApprovedLeaveCard({ leave }) {

    if (!leave || !leave.start_date || !leave.end_date) { return null };
  // 1. Calculate Duration and Countdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(leave?.start_date);
  const end = new Date(leave?.end_date);
  
  // Total duration of the requested leave in days
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Days remaining until the leave starts
  const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  
  // 2. Progress Bar Logic: Visualizing a 7-day countdown
  // If more than 7 days, bar is at 0%. If starts tomorrow, bar is at 90%.
  const progress = daysUntilStart <= 0 ? 100 : Math.max(0, ((7 - daysUntilStart) / 7) * 100);

  // 3. Status Styling
  const isUrgent = daysUntilStart <= 2 && daysUntilStart > 0;
  const isToday = daysUntilStart === 0;

  return (
    <div className={`bg-white p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
      isToday ? 'border-green-500 bg-green-50' : isUrgent ? 'border-orange-400' : 'border-slate-200'
    }`}>
      {/* Header: Name and Days Left */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {leave.leave_type_name || leave.leave_type || 'Leave Request'}
          </h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {duration} Day Duration
          </p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black ${isToday ? 'text-green-600' : 'text-blue-600'}`}>
            {daysUntilStart > 0 ? daysUntilStart : '0'}
          </span>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Days Left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
          <span>{isToday ? 'Starts Today' : 'Countdown'}</span>
          <span>{isToday ? '100%' : `${Math.round(progress)}%`}</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-700 ease-out ${
              isToday ? 'bg-green-500' : isUrgent ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer: Date Range */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule</span>
          <span className="text-xs font-semibold text-slate-700">
            {formatDisplayDate(leave.start_date)} - {formatDisplayDate(leave.end_date)}
          </span>
        </div>
        {isToday && (
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
        )}
      </div>
    </div>
  );
}


const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
