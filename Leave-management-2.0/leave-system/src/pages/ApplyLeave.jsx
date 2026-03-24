// pages/ApplyLeave.jsx
import { useState } from "react";
import { Navbar } from "../components/NavBar";

function ApplyLeave() {
  const [formData, setFormData] = useState({
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Apply for Leave</h2>
          <p className="text-gray-600">Submit a new leave request</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Leave Type */}
          <div className="mb-6">
            <label htmlFor="leaveType" className="block text-sm font-semibold text-gray-700 mb-2">
              Leave Type
            </label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            >
              <option>Sick Leave</option>
              <option>Annual Leave</option>
              <option>Family Responsibility Leave</option>
              <option>Study Leave</option>
              <option>Special Leave</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              placeholder="Please provide a reason for your leave..."
              value={formData.reason}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition resize-none placeholder-gray-400"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105"
          >
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;