import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyLeaves } from '../services/ApiClient';
import { useAlert } from '../hooks/alerthook';
import ProtectedLayout from '../components/ProtectedLayout';

// Helper function for date formatting
const formatDate = (dateStr) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

// Helper function for status color styling
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

// Request Card Component

const RequestCard = ({ request }) => {
  if (!request || !request.id) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-slate-900 text-lg leading-tight">
            {request.leave_type_name || request.leave_type || 'Leave Request'}
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{request.institution_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(request.status)}`}>
          {request.status || 'Pending'}
        </span>
      </div>
      
      <div className="flex items-center gap-4 py-3 border-y border-slate-50 my-4">
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">From</p>
          <p className="text-sm font-bold text-slate-700">{formatDate(request.start_date)}</p>
        </div>
        <div className="h-8 w-px bg-slate-100"></div>
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">To</p>
          <p className="text-sm font-bold text-slate-700">{formatDate(request.end_date)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Duration:</span>
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {request.leave_duration || 'N/A'} days
          </span>
        </div>
        <p className="text-slate-600 text-sm line-clamp-2 italic">"{request.reason || 'No reason provided'}"</p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
        <p className="text-slate-400 text-[10px] font-medium">
          Submitted {formatDate(request.created_at || new Date().toISOString())}
        </p>
        {request.supporting_document && (
          <a 
            href={request.supporting_document} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 text-xs font-bold hover:underline"
          >
            View Document
          </a>
        )}
      </div>
    </div>
  );
};

// Status Section Component
const StatusSection = ({ title, requests: sectionRequests, icon, bgColor }) => (
  <div>
    <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${bgColor}`}>
      <span className="text-lg">{icon}</span>
      <h3 className="text-lg font-bold text-slate-900">
        {title} ({sectionRequests.length})
      </h3>
    </div>
    <div className="space-y-4">
      {sectionRequests.length > 0 ? (
        sectionRequests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))
      ) : (
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-slate-500">No {title.toLowerCase()} requests</p>
        </div>
      )}
    </div>
  </div>
);

export default function MyRequests() {
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const { showError } = useAlert();

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const res = await getMyLeaves();
        const leaveData = res.data;
        if (!leaveData) {
          showError('No leave data found.');
          return;
        }
        // Handle both array and paginated response formats
        const requestsList = Array.isArray(leaveData) ? leaveData : leaveData.results || [];
        // Filter out any undefined/null entries
        const cleanedRequests = requestsList.filter(req => req && req.id);
        setRequests(cleanedRequests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        showError('Failed to load leave requests.');
      }
    };

    fetchLeaveHistory();
  }, [showError]);

  // Categorize requests by status
  const getRequestsByStatus = (status) => {
    return requests.filter(req => (req.status || '').toLowerCase() === status.toLowerCase());
  };

  const pendingRequests = getRequestsByStatus('pending');
  const approvedRequests = getRequestsByStatus('approved');
  const rejectedRequests = getRequestsByStatus('rejected');

  const pendingCategory = pendingRequests.reduce((acc, req) => {
    const type = req.leave_type_name || req.leave_type || req.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(req);
    return acc;
  }, {});

  return (
    <ProtectedLayout
      title="My Leave Requests"
      subtitle="View all your submitted leave requests"
      currentPath={location.pathname}
    >
      {/** Pending requests */}
      <div className="space-y-12">
       <section className="mb-12">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Pending Requests ({pendingRequests.length})
              </h3>
            </div>
          </div>

          {Object.keys(pendingCategory).length > 0 ? (
            Object.entries(pendingCategory).map(([type, reqs]) => (
              <div key={type} className="mb-8 last:mb-0">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-l-4 border-yellow-400 pl-3">
                  {type}
                </h4>
                
                {/* Changed to a grid layout so cards sit nicely side-by-side on larger screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reqs.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <p className="text-slate-500">No pending requests</p>
            </div>
          )}
        </section>
       
        {/* Approved Requests */}
        <StatusSection
          title="Approved Requests"
          requests={approvedRequests}
          icon="✅"
          bgColor="bg-green-50 border border-green-200"
        />

        {/* Rejected Requests */}
        <StatusSection
          title="Rejected Requests"
          requests={rejectedRequests}
          icon="❌"
          bgColor="bg-red-50 border border-red-200"
        />

        {/* No Requests */}
        {requests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">No leave requests found</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
