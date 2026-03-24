import { useState } from 'react';
import { useAlert } from '../hooks/alerthook';
import { applyLeave } from '../services/ApiClient';

// Leave type mapping
const LEAVE_TYPE_MAP = {
  'Annual Leave': 'ANN',
  'Sick Leave': 'SICK',
  'Study Leave': 'STUDY',
  'Family Responsibility Leave': 'FAMILY',
  'Special Leave': 'SPECIAL',
  'Unpaid Leave': 'UNPAID',
};

export default function ApplyLeaveModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    document: null,
  });

  const { showSuccess, showError, showWarning } = useAlert();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if document is required for sick or study leave
    const leaveType = formData.leaveType || '';
    if ((leaveType === 'Sick Leave' || leaveType === 'Study Leave') && !formData.document) {
      showWarning('Please upload a document for ' + leaveType);
      return;
    }

    if (typeof onSubmit === 'function') {
      // Convert display name to code for API
      const leaveTypeCode = LEAVE_TYPE_MAP[leaveType] || leaveType;
      
      const submissionData = {
        ...formData,
        leaveType: leaveTypeCode, // Send code to backend
      };

      applyLeave(submissionData)
        .then((response) => {
          showSuccess('Leave request submitted successfully!');
          onSubmit(response);
          onClose();
        })
        .catch((error) => {
          console.error('Error applying for leave:', error);
          showError('Failed to submit leave request. Please try again.');
        });
    }
    setFormData({
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: '',
      document: null,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur z-30"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-2xl font-black text-slate-900 mb-2">Request Leave</h3>
          <p className="text-slate-500 text-sm mb-6">Fill in your leave request details</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                required
              >
                <option>Annual Leave</option>
                <option>Sick Leave</option>
                <option>Study Leave</option>
                <option>Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                placeholder="Provide details about your leave request..."
                required
              ></textarea>
            </div>

            {/* Document Upload - Only for Sick Leave and Study Leave */}
            {(formData.leaveType === 'Sick Leave' || formData.leaveType === 'Study Leave') && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {formData.leaveType === 'Sick Leave' ? 'Medical Certificate' : 'Supporting Document'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="file"
                  name="document"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </p>
                {formData.document && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ File selected: {formData.document.name}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg"
            >
              Submit Request
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
