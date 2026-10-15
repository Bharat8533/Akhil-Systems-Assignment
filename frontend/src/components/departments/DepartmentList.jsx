import React, { useMemo } from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  Clock,
  CalendarDays,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Button } from '../common/Button';

export const DepartmentList = ({
  doctors = [],
  onNavigateToAvailability,
  onBookWithDoctor,
  onNavigateToDoctors
}) => {
  const departmentGroups = useMemo(() => {
    const groups = {};

    doctors.forEach((doc) => {
      const dept = doc.department || 'General Medicine';
      if (!groups[dept]) {
        groups[dept] = {
          name: dept,
          doctors: [],
          totalDuration: 0,
          activeDoctors: 0
        };
      }
      groups[dept].doctors.push(doc);
      groups[dept].totalDuration += doc.consultationDuration || 30;
      if (doc.isActive) groups[dept].activeDoctors += 1;
    });

    return Object.values(groups);
  }, [doctors]);

  const departmentMeta = {
    Cardiology: {
      description: 'Comprehensive cardiovascular care, ECG diagnostics, heart health evaluations, and coronary consultations.',
      location: 'Block A, 2nd Floor, Wing 1',
    },
    Orthopedics: {
      description: 'Bone, joint, spine, and musculoskeletal care, fracture management, and joint replacement consultations.',
      location: 'Block B, Ground Floor, Wing 2',
    },
    Pediatrics: {
      description: 'Infant, child, and adolescent healthcare, developmental tracking, vaccinations, and pediatric OPD.',
      location: 'Block A, 1st Floor, Wing 3',
    },
    Neurology: {
      description: 'Advanced neurological assessments, brain and nerve disorders, headache, stroke, and seizure care.',
      location: 'Block C, 3rd Floor, Wing 1',
    },
    Dermatology: {
      description: 'Clinical dermatology, skin, hair, and nail health, allergy testing, and cosmetic outpatient procedures.',
      location: 'Block B, 1st Floor, Wing 4',
    },
    'General Medicine': {
      description: 'Comprehensive adult health, acute disease management, routine checkups, and preventive clinical care.',
      location: 'Block A, Ground Floor, Wing 1',
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                Hospital Resources
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Clinical Divisions & Specialty Centers
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Departments & Clinical Specialties
            </h2>
            <p className="text-xs text-slate-500">
              Outpatient consultation wings, physician staffing rosters, and departmental scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {departmentGroups.length} Active Departments
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departmentGroups.map((dept) => {
          const meta = departmentMeta[dept.name] || {
            description: `Outpatient consultation services for ${dept.name} patients.`,
            location: 'Main Hospital Building, OPD Wing',
          };
          const headDoctor = dept.doctors[0]?.name || 'Department Lead';

          const avgDuration = Math.round(dept.totalDuration / (dept.doctors.length || 1));

          return (
            <div
              key={dept.name}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-teal-700 font-medium">
                        Head: {headDoctor}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {dept.activeDoctors} On Duty
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {meta.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Consulting Staff
                    </span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {dept.doctors.length} Physicians
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Avg. Slot Duration
                    </span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {avgDuration} Minutes
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Specialists in this Wing
                  </span>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden text-xs">
                    {dept.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={doc.avatar || 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg'}
                            alt={doc.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://i.pinimg.com/1200x/59/19/8e/59198e7d74109231340e7b0d28b1bba7.jpg';
                            }}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {doc.workingDays?.join(', ')} • {doc.workingHours?.start}-{doc.workingHours?.end}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigateToAvailability(doc)}
                            className="px-2 py-1 rounded text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                          >
                            Slots
                          </button>
                          <button
                            onClick={() => onBookWithDoctor(doc)}
                            className="px-2 py-1 rounded text-[11px] font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{meta.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
