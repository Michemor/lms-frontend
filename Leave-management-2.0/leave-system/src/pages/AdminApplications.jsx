import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAlert } from '../hooks/alerthook';
import { getPendingLeaves, updateLeaveData } from '../services/ApiClient';
import ProtectedLayout from '../components/ProtectedLayout';

export default function AdminApplications() {
  const location = useLocation();
  const { showSuccess, showError, showWarning } = useAlert();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Format leave type
  const formatLeaveType = (leaveType) => {
    const typeMap = {
      ANN: 'Annual Leave',
      SICK: 'Sick Leave',
      STUDY: 'Study Leave',
      FAMILY: 'Family Responsibility Leave',
    };
    return typeMap[leaveType] || leaveType || 'Leave';
  };

  // Fetch pending applications
  const fetchPendingApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPendingLeaves();
      // Handle both array and nested object responses
      const leaveData = Array.isArray(data) ? data : data.results || [];
      
      // Transform API response to component format
      const transformedData = leaveData.map((item) => {
        const employee = item.employee || {};
        return {
          id: item.id,
          employeeName: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown',
          employeeId: employee.id || 'N/A',
          employeeDepartment: employee.department || 'N/A',
          employeeEmail: employee.email || 'N/A',
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending',
          type: formatLeaveType(item.leave_type),
          start: item.start_date || 'N/A',
          end: item.end_date || 'N/A',
          reason: item.reason || 'No reason provided',
          submittedDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
          leave_type: item.leave_type,
        };
      });
      
      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      showError('Failed to load pending applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Fetch pending applications on component mount
  useEffect(() => {
    fetchPendingApplications();
  }, [fetchPendingApplications]);

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '1 day';
    } catch {
      return 'N/A';
    }
  };

  // Handle cell edit start
  const handleEditStart = (app) => {
    setEditingRowId(app.id);
    setEditingData({
      status: app.status.toUpperCase(),
      reason: app.reason,
      start: app.start,
      end: app.end,
    });
  };

  // Handle cell value change
  const handleCellChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save edited data
  const handleSaveRow = async (app) => {
    if (!editingData.status) {
      showWarning('Status is required');
      return;
    }

    // set status to uppercase for API
    editingData.status = editingData.status.toUpperCase();

    setIsProcessing(true);
    try {
      // Update the status via API
      await updateLeaveData(app.id, editingData);
      
      // Update local state
      setApplications((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: editingData.status.charAt(0).toUpperCase() + editingData.status.slice(1),
                reason: editingData.reason,
                start: editingData.start,
                end: editingData.end,
              }
            : item
        )
      );

      showSuccess(`Leave application updated successfully!`);
      setEditingRowId(null);
      setEditingData({});
    } catch (error) {
      console.error('Error updating application:', error);
      showError('Failed to update application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
  };

  return (
    <ProtectedLayout currentPath={location.pathname}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Leave Applications</h1>
            <p className="text-slate-600">
              Review and manage pending leave applications awaiting approval
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="animate-spin h-6 w-6 text-slate-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-slate-600 font-medium">Loading applications...</p>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Applications</h3>
                <p className="text-slate-600">All leave applications have been processed!</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Summary Card */}
              <div className="bg-blue-50 border-b border-slate-200 p-4">
                <p className="text-blue-900 font-semibold">
                  {applications.length} pending application{applications.length !== 1 ? 's' : ''} awaiting approval
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Employee</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Leave Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Start Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">End Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Reason</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const isEditing = editingRowId === app.id;
                      return (
                        <tr
                          key={app.id}
                          className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                            isEditing ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{app.employeeName}</p>
                              <p className="text-xs text-slate-500">{app.employeeId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{app.employeeDepartment}</td>
                          <td className="px-6 py-4 text-slate-700">{app.type}</td>
                          <td className="px-6 py-4 text-slate-700">{calculateDays(app.start, app.end)}</td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editingData.start}
                                onChange={(e) => handleCellChange('start', e.target.value)}
                                disabled={isProcessing}
                                className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                            ) : (
                              <span className="text-slate-700">{app.start}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editingData.end}
                                onChange={(e) => handleCellChange('end', e.target.value)}
                                disabled={isProcessing}
                                className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                            ) : (
                              <span className="text-slate-700">{app.end}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select
                                value={editingData.status}
                                onChange={(e) => handleCellChange('status', e.target.value)}
                                disabled={isProcessing}
                                className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  app.status === 'Approved'
                                    ? 'bg-green-100 text-green-700'
                                    : app.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {app.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <textarea
                                value={editingData.reason}
                                onChange={(e) => handleCellChange('reason', e.target.value)}
                                disabled={isProcessing}
                                className="w-full px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                rows="2"
                              />
                            ) : (
                              <p className="text-slate-700 text-sm truncate max-w-xs" title={app.reason}>
                                {app.reason}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveRow(app)}
                                    disabled={isProcessing}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isProcessing}
                                    className="px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white text-xs font-semibold rounded transition disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleEditStart(app)}
                                  disabled={isProcessing}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition disabled:opacity-50"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}