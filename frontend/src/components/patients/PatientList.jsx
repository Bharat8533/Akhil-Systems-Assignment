import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  CalendarPlus,
  Phone,
  Mail,
  User,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/dateUtils';

export const PatientList = ({
  patients = [],
  onOpenRegisterModal,
  onViewPatient,
  onEditPatient,
  onBookForPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      if (bloodFilter !== 'all' && p.bloodGroup !== bloodFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.fullName?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    });
  }, [patients, searchQuery, genderFilter, bloodFilter]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery('');
    setGenderFilter('all');
    setBloodFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || genderFilter !== 'all' || bloodFilter !== 'all';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Registry & Central EHR Records
            </h2>
            <p className="text-xs text-slate-500">
              Search, inspect, and maintain patient demographic profiles, emergency contacts, and clinical histories.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'Record' : 'Records'}
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={onOpenRegisterModal}
              className="w-full sm:w-auto shadow-xs"
            >
              Register New Patient
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name, Phone, ID, or Email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bloodFilter}
              onChange={(e) => {
                setBloodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700"
            >
              <option value="all">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-1.5 whitespace-nowrap cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <User className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Patient Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {hasActiveFilters
                ? 'No registered patient matches your current filter or search criteria.'
                : 'No registered patients in the central hospital database yet.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset Search Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={onOpenRegisterModal}
              >
                Register New Patient
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Demographics</th>
                  <th className="py-3.5 px-4">Contact Phone & Email</th>
                  <th className="py-3.5 px-4">Blood & Allergies</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                      <button
                        onClick={() => onViewPatient(patient)}
                        className="hover:underline text-left cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{patient.id}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {patient.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {patient.gender} • {patient.age ? `${patient.age} yrs` : 'Age N/A'}
                        {patient.address && (
                          <span className="text-slate-400"> • {patient.address}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email ? (
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {patient.email}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {patient.bloodGroup ? (
                          <span className="font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] border border-rose-200">
                            {patient.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                        <span
                          className="text-[11px] text-slate-500 truncate max-w-[150px]"
                          title={patient.allergies}
                        >
                          {patient.allergies && patient.allergies !== 'None reported'
                            ? patient.allergies
                            : 'No allergies'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(patient.registeredAt || patient.dob)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPatient(patient)}
                          title="View Complete Patient Record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          title="Edit Patient Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={CalendarPlus}
                          onClick={() => onBookForPatient(patient)}
                          className="py-1 px-2.5 text-xs ml-1"
                        >
                          Book Slot
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{' '}
              {filteredPatients.length} patients
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
