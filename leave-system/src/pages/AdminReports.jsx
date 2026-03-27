import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStatistics, getEmployees, listLeaves } from '../services/ApiClient';
import ProtectedLayout from '../components/ProtectedLayout';

export default function AdminReports() {
  const location = useLocation();

  // State Management
  const [reportType, setReportType] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  
  // Optmized Individual Fetching States
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Paginated Leave States
  const [individualLeaves, setIndividualLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    departmentStats: [],
  });

  // 1. Fetch Summary Data Only (No Bulk Leaves/Employees)
  const fetchSummaryData = async () => {
    try {
      setIsLoading(true);
      const statsData = await getStatistics();
      console.log('Fetched Stats Data:', statsData);
      const summary = statsData.summary || {};
      const users = statsData.users || [];
      const deptMap = {};

      users.forEach((user) => {
        const dept = user.department || 'General';
        const inst = user.institution_name || 'Main Branch';
        const key = `${inst} - ${dept}`;
        
        if (!deptMap[key]) {
          deptMap[key] = { institution: inst, department: dept, employees: 0 };
        }
        deptMap[key].employees += 1;
      });

      setStatistics({
        totalApplications: summary.total_applications || 0,
        approvedApplications: summary.approved_applications || 0,
        rejectedApplications: summary.rejected_applications || 0,
        pendingApplications: summary.pending_applications || 0,
        departmentStats: Object.values(deptMap),
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  // 2. Optimum Smart Search for Employees (Avoid Bulk Loading)
  useEffect(() => {
    if (employeeSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Simulate debounced search (In production, hit /api/employees/?search=term)
    const timeoutId = setTimeout(async () => {
      try {
        const res = await getEmployees({ search: employeeSearch });
        const results = Array.isArray(res.data) ? res.data : res.data.results || [];
        // Keep to max 5 results for clean UI
        setSearchResults(results.slice(0, 5));
      } catch (error) {
        console.error('Search error', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [employeeSearch]);

  // 3. Paginated Fetch for Individual User Records
  const fetchIndividualLeaves = async (employeeId, pageNum = 1) => {
    try {
      // Passes employee_id and page to utilize backend optimization
      const res = await listLeaves({ employee_id: employeeId, page: pageNum });
      const rawData = res.data;
      
      if (rawData.results) {
        setIndividualLeaves(rawData.results);
        setHasNext(!!rawData.next);
      } else {
        setIndividualLeaves(Array.isArray(rawData) ? rawData : []);
        setHasNext(false);
      }
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Failed to load employee leaves', error);
    }
  };

  const selectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeSearch('');
    setSearchResults([]);
    fetchIndividualLeaves(emp.id, 1);
  };

  // 4. Clean Document Generator (CSV Export)
  const downloadExcel = () => {
    if (statistics.departmentStats.length === 0) return;

    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Institution,Department,Total Employees\n";

    // Data Rows
    statistics.departmentStats.forEach(stat => {
      const row = `"${stat.institution}","${stat.department}","${stat.employees}"`;
      csvContent += row + "\n";
    });

    // Auto-download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Department_Stats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedLayout currentPath={location.pathname}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-5xl font-black text-slate-900 mb-3">Admin Reports</h1>
            <p className="text-slate-600 text-lg">System-wide analytics and individual employee tracking</p>
          </div>

          {/* Controls Bar */}
          <div className="mb-8 flex gap-4 flex-wrap items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="summary">Summary Report</option>
                <option value="individual">Individual Employee Timeline</option>
              </select>
            </div>

            {reportType === 'individual' && (
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Search Employee</label>
                <input
                  type="text"
                  placeholder="Type name or email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="px-4 py-2 w-64 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-blue-900"
                />
                
                {/* Search Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-[100%] mt-1 w-full bg-white border border-slate-200 shadow-xl rounded-lg z-50 overflow-hidden">
                    {searchResults.map(emp => (
                      <div 
                        key={emp.id} 
                        onClick={() => selectEmployee(emp)}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <p className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 ml-auto">
              <button onClick={downloadExcel} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                Download Dept. CSV
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-center font-bold text-slate-400 py-12">Loading Insights...</p>
          ) : (
            <div className="space-y-6">
              
              {/* Summary View */}
              {reportType === 'summary' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard label="Total Applications" value={statistics.totalApplications} />
                        <StatCard label="Approved" value={statistics.approvedApplications} color="text-green-600" />
                        <StatCard label="Rejected" value={statistics.rejectedApplications} color="text-red-600" />
                        <StatCard label="Pending" value={statistics.pendingApplications} color="text-yellow-600" />
                    </div>
                </>
              )}

              {/* Individual Employee Paginated View */}
              {reportType === 'individual' && (
                selectedEmployee ? (
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white flex justify-between">
                        <div>
                          <h2 className="text-3xl font-black mb-1">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                          <p className="text-slate-400 text-sm">{selectedEmployee.email}</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Paginated Leave History</h3>
                      <div className="space-y-3">
                        {individualLeaves.map((l, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                            <div>
                              <p className="font-bold text-slate-800">{l.leave_type_name || l.leave_type || 'Leave'}</p>
                              <p className="text-xs text-slate-500">{l.start_date} to {l.end_date}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${l.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex gap-2 mt-6 justify-center">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => fetchIndividualLeaves(selectedEmployee.id, currentPage - 1)}
                            className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-bold disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-bold text-slate-500">Page {currentPage}</span>
                        <button 
                            disabled={!hasNext}
                            onClick={() => fetchIndividualLeaves(selectedEmployee.id, currentPage + 1)}
                            className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-bold disabled:opacity-50"
                        >
                            Next
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 text-xl font-medium">Search and select an employee above.</p>
                  </div>
                )
              )}

            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}

function StatCard({ label, value, color = "text-slate-900" }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  );
}