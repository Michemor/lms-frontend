import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getLeaveHistory } from '../services/ApiClient';
import ProtectedLayout from '../components/ProtectedLayout';

export default function MyRequests() {
  const location = useLocation();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getLeaveHistory();
        // Handle both array and paginated response formats
        const leaveData = Array.isArray(data) ? data : data.results || [];
        setRequests(leaveData);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <ProtectedLayout
      title="My Leave Requests"
      subtitle="View all your leave requests and their statuses"
      currentPath={location.pathname}
    >
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{request.leave_type || request.type}</h3>
                  <p className="text-slate-600 text-sm">{formatDate(request.start_date)} to {formatDate(request.end_date)}</p>
                  <p className="text-slate-500 text-sm mt-2">Reason: {request.reason || '-'}</p>
                  <p className="text-slate-400 text-xs mt-1">Submitted: {formatDate(request.created_at || new Date().toISOString())}</p>
                </div>
                <div></div>
                <div className="md:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.admin_remarks && (
                    <p className="text-slate-600 text-xs mt-3 md:text-right">Admin: {request.admin_remarks}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No leave requests found</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const getStatusColor = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'approved') {
    return 'bg-green-100 text-green-700';
  } else if (statusLower === 'rejected') {
    return 'bg-red-100 text-red-700';
  } else if (statusLower === 'pending') {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-slate-100 text-slate-800';
};
