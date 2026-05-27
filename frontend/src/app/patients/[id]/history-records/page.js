'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Link from 'next/link';
import {
  ArrowLeft, Activity, User, Phone, Mail, Calendar,
  FileText, ClipboardList, CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';

export default function PatientHistoryRecords() {
  const { id } = useParams();
  const { user, token, API_BASE_URL } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Navigation guard — redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // Fetch patient data with appointments
  useEffect(() => {
    if (!token || !id) return;

    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load patient record.');
        }

        const data = await res.json();
        setPatient(data);
        setError('');
      } catch (err) {
        console.error('Patient fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [token, id]);

  if (!user) return null;

  // Status badge styling helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-500';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'CANCELLED':
        return <XCircle className="h-3.5 w-3.5" />;
      case 'PENDING':
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">

        {/* Back Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="pulse-loader">
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-400">Loading patient clinical records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Patient Record */}
        {patient && !loading && (
          <div className="space-y-8">

            {/* Patient Header Card */}
            <div className="glass p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                      {patient.name}
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                      Patient Clinical Record
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wide border border-teal-500/20">
                  ID: {patient.id?.slice(0, 8)}...
                </span>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="block text-xxs text-slate-400 font-bold uppercase tracking-wider">Age</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{patient.age} years</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="block text-xxs text-slate-400 font-bold uppercase tracking-wider">Gender</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{patient.gender}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="block text-xxs text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{patient.phoneNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="block text-xxs text-slate-400 font-bold uppercase tracking-wider">Email</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{patient.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-teal-600" />
                Clinical Background / Medical History
              </h2>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                {patient.medicalHistory ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-6 font-medium whitespace-pre-wrap">
                    {patient.medicalHistory}
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-semibold">
                      No medical history has been recorded for this patient.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clinical background can be added through the Patient Registry in the Dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment History Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                Appointment History
              </h2>

              {patient.appointments && patient.appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patient.appointments
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                        .map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                              <span className="font-mono">
                                {new Date(appt.appointmentDate).toLocaleDateString([], {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </span>
                              <span className="block text-xxs text-slate-400 font-semibold mt-0.5">
                                {new Date(appt.appointmentDate).toLocaleTimeString([], {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">
                              {appt.reason || 'No reason provided'}
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${getStatusStyle(appt.status)}`}>
                                {getStatusIcon(appt.status)}
                                {appt.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right text-slate-400 text-xs">
                              {new Date(appt.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Appointment Records</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    This patient does not have any scheduled or historical appointments on file.
                  </p>
                </div>
              )}
            </div>

            {/* Summary Statistics */}
            {patient.appointments && patient.appointments.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Total Visits</span>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {patient.appointments.length}
                  </h4>
                </div>
                <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Completed</span>
                  <h4 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                    {patient.appointments.filter(a => a.status === 'COMPLETED').length}
                  </h4>
                </div>
                <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Pending</span>
                  <h4 className="text-2xl font-black text-amber-500 mt-1">
                    {patient.appointments.filter(a => a.status === 'PENDING').length}
                  </h4>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
