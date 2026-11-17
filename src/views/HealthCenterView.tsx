import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Pill, 
  Calendar as CalendarIcon, 
  Scale, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Download,
  ExternalLink,
  Edit3,
  Trash2 
} from 'lucide-react';
import { 
  PuppyProfile, 
  VaccinationRecord, 
  MedicationRecord, 
  VetAppointment 
} from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastNotification } from '../components/ui/ToastNotification';

const middleTruncate = (str: string, lead = 6, tail = 4): string => {
  if (!str || str.length <= lead + tail + 3) return str;
  return `${str.slice(0, lead)}...${str.slice(-tail)}`;
};

interface HealthCenterViewProps {
  puppy: PuppyProfile;
  onUpdatePuppy?: (updated: PuppyProfile) => void;
}

const parseTimeToHoursAndMinutes = (timeStr: string): { hours: number; minutes: number } => {
  if (!timeStr) return { hours: 9, minutes: 0 };
  const parts = timeStr.trim().split(' ');
  const [hStr, mStr] = (parts[0] || '9:00').split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  const period = parts[1]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
};

const generateGoogleCalendarUrl = (apt: VetAppointment) => {
  const { hours, minutes } = parseTimeToHoursAndMinutes(apt.time);
  const [y, m, d] = (apt.date || new Date().toISOString().split('T')[0]).split('-').map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1, hours, minutes, 0);
  const end = new Date(start.getTime() + 60 * 60000); // 1-hour appointment window

  const formatCalDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
  };

  const dates = `${formatCalDate(start)}/${formatCalDate(end)}`;
  const details = `Reason: ${apt.reason}\nNotes: ${apt.notes || ''}`;
  const location = apt.clinic;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', apt.title);
  url.searchParams.append('dates', dates);
  url.searchParams.append('details', details);
  if (location) {
    url.searchParams.append('location', location);
  }
  
  return url.toString();
};

export const HealthCenterView: React.FC<HealthCenterViewProps> = ({ puppy, onUpdatePuppy }) => {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'meds' | 'appointments' | 'weight'>('vaccines');
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => storage.getVaccinations(puppy.id));
  const [medications, setMedications] = useState<MedicationRecord[]>(() => storage.getMedications(puppy.id));
  const [appointments, setAppointments] = useState<VetAppointment[]>(() => storage.getAppointments(puppy.id));

  React.useEffect(() => {
    setVaccinations(storage.getVaccinations(puppy.id));
    setMedications(storage.getMedications(puppy.id));
    setAppointments(storage.getAppointments(puppy.id));
  }, [puppy.id]);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setVaccinations([...storage.getVaccinations(puppy.id)]);
      setMedications([...storage.getMedications(puppy.id)]);
      setAppointments([...storage.getAppointments(puppy.id)]);
    });
  }, [puppy.id]);

  // Modals
  const [isEditVetOpen, setIsEditVetOpen] = useState(false);
  const [isEditInsuranceOpen, setIsEditInsuranceOpen] = useState(false);
  const [isAddVacOpen, setIsAddVacOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);

  // Vet Edit Form
  const [vetClinicInput, setVetClinicInput] = useState(puppy.vetClinic || '');
  const [vetNameInput, setVetNameInput] = useState(puppy.vetName || '');
  const [vetPhoneInput, setVetPhoneInput] = useState(puppy.vetPhone || '');

  // Insurance Edit Form
  const [insuranceProviderInput, setInsuranceProviderInput] = useState(puppy.insuranceProvider || '');
  const [insurancePolicyInput, setInsurancePolicyInput] = useState(puppy.insurancePolicyNumber || '');
  const [microchipInput, setMicrochipInput] = useState(puppy.microchipNumber || '');

  React.useEffect(() => {
    setVetClinicInput(puppy.vetClinic || '');
    setVetNameInput(puppy.vetName || '');
    setVetPhoneInput(puppy.vetPhone || '');
    setInsuranceProviderInput(puppy.insuranceProvider || '');
    setInsurancePolicyInput(puppy.insurancePolicyNumber || '');
    setMicrochipInput(puppy.microchipNumber || '');
  }, [puppy]);

  const handleSaveVet = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPuppy: PuppyProfile = {
      ...puppy,
      vetClinic: vetClinicInput.trim() || undefined,
      vetName: vetNameInput.trim() || undefined,
      vetPhone: vetPhoneInput.trim() || undefined,
    };
    storage.savePuppy(updatedPuppy);
    if (onUpdatePuppy) onUpdatePuppy(updatedPuppy);
    setIsEditVetOpen(false);
  };

  const handleSaveInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPuppy: PuppyProfile = {
      ...puppy,
      insuranceProvider: insuranceProviderInput.trim() || undefined,
      insurancePolicyNumber: insurancePolicyInput.trim() || undefined,
      microchipNumber: microchipInput.trim() || undefined,
    };
    storage.savePuppy(updatedPuppy);
    if (onUpdatePuppy) onUpdatePuppy(updatedPuppy);
    setIsEditInsuranceOpen(false);
  };

  // Vac Form
  const [vacName, setVacName] = useState('');
  const [vacAdminDate, setVacAdminDate] = useState('');
  const [vacDueDate, setVacDueDate] = useState('');
  const [vacClinic, setVacClinic] = useState(puppy.vetClinic || '');

  // Med Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('Monthly');

  // Apt Form
  const [aptTitle, setAptTitle] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('09:00 AM');
  const [aptReason, setAptReason] = useState('');

  // Weight Form
  const [newWeight, setNewWeight] = useState(puppy.weightLbs.toString());

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim()) return;
    storage.addVaccination({
      puppyId: puppy.id,
      vaccineName: vacName,
      administeredDate: vacAdminDate || new Date().toISOString().split('T')[0],
      nextDueDate: vacDueDate || '',
      vetClinic: vacClinic || puppy.vetClinic || '',
      status: 'up_to_date'
    });
    setVaccinations(storage.getVaccinations(puppy.id));
    setIsAddVacOpen(false);
    setVacName('');
    setVacDueDate('');
    setVacAdminDate('');
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    storage.addMedication({
      puppyId: puppy.id,
      name: medName,
      dosage: medDosage,
      frequency: medFrequency,
      startDate: new Date().toISOString().split('T')[0],
      active: true
    });
    setMedications(storage.getMedications(puppy.id));
    setIsAddMedOpen(false);
    setMedName('');
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptTitle.trim()) return;
    storage.addAppointment({
      puppyId: puppy.id,
      title: aptTitle,
      clinic: puppy.vetClinic || 'Vet Clinic',
      date: aptDate || new Date().toISOString().split('T')[0],
      time: aptTime,
      reason: aptReason,
      status: 'scheduled'
    });
    setAppointments(storage.getAppointments(puppy.id));
    setIsAddAptOpen(false);
    setAptTitle('');
  };

  const [weightError, setWeightError] = useState<string | null>(null);

  const handleUpdateWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newWeight);
    if (isNaN(wt) || wt <= 0) {
      setWeightError('Please enter a valid weight.');
      return;
    }
    if (wt < 0.5 || wt > 350) {
      setWeightError('Weight must be between 0.5 and 350 lbs.');
      return;
    }
    setWeightError(null);
    const updatedPuppy = { ...puppy, weightLbs: wt };
    storage.savePuppy(updatedPuppy);
    onUpdatePuppy?.(updatedPuppy);
    setIsAddWeightOpen(false);
  };

  const handleExportICS = async () => {
    const icsContent = storage.generateICSFile(puppy.name, puppy.id);
    const fileName = `${puppy.name}-PupLume-Calendar.ics`;

    // 1. Mobile Web Share API: directly opens native Calendar sheet (Google/Samsung/Apple) with no scary security prompts
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        const file = new File([icsContent], fileName, { type: 'text/calendar;charset=utf-8' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${puppy.name}'s Calendar Schedule`,
            text: `Vaccine and veterinary schedule for ${puppy.name}`,
          });
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User closed share sheet
      }
    }

    // 2. Data URI fallback to avoid Chrome mixed-content insecure download warning on HTTP
    try {
      const dataUri = `data:text/calendar;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(icsContent)))}`;
      const link = document.createElement('a');
      link.href = dataUri;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Delete',
    onConfirm: () => {},
  });

  const [undoToast, setUndoToast] = useState<{
    open: boolean;
    message: string;
    undoAction?: () => void;
  }>({
    open: false,
    message: '',
  });

  const handleDeleteVaccine = (vac: VaccinationRecord) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Vaccination Record?',
      description: `Remove "${vac.vaccineName}" from ${puppy.name}'s medical records? You can undo this immediately.`,
      confirmLabel: 'Delete Record',
      onConfirm: () => {
        storage.deleteVaccination(vac.id);
        setVaccinations(storage.getVaccinations(puppy.id));
        setUndoToast({
          open: true,
          message: `Vaccine record "${vac.vaccineName}" removed`,
          undoAction: () => {
            const current = storage.getVaccinations(puppy.id);
            storage.saveVaccinations([...current, vac], puppy.id);
            setVaccinations(storage.getVaccinations(puppy.id));
          }
        });
      }
    });
  };

  const handleDeleteMedication = (med: MedicationRecord) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Medication?',
      description: `Remove "${med.name}" from ${puppy.name}'s medications? You can undo this immediately.`,
      confirmLabel: 'Delete Medication',
      onConfirm: () => {
        storage.deleteMedication(med.id);
        setMedications(storage.getMedications(puppy.id));
        setUndoToast({
          open: true,
          message: `Medication "${med.name}" removed`,
          undoAction: () => {
            const current = storage.getMedications(puppy.id);
            storage.saveMedications([...current, med], puppy.id);
            setMedications(storage.getMedications(puppy.id));
          }
        });
      }
    });
  };

  const handleDeleteAppointment = (apt: VetAppointment) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Vet Visit?',
      description: `Remove scheduled visit "${apt.title}" on ${apt.date}? You can undo this immediately.`,
      confirmLabel: 'Cancel Visit',
      onConfirm: () => {
        storage.deleteAppointment(apt.id);
        setAppointments(storage.getAppointments(puppy.id));
        setUndoToast({
          open: true,
          message: `Visit "${apt.title}" removed`,
          undoAction: () => {
            const current = storage.getAppointments(puppy.id);
            storage.saveAppointments([...current, apt], puppy.id);
            setAppointments(storage.getAppointments(puppy.id));
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Health & Veterinary Center
            </h1>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Records Secured
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Complete medical vault, booster reminders, parasite preventatives, and weight curves for {puppy.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportICS}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Sync to Calendar (.ICS)
          </Button>
        </div>
      </div>

      {/* Primary Vet & Insurance Quick Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div 
          onClick={() => setIsEditVetOpen(true)}
          className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between cursor-pointer hover:border-[#8B5E3C]/60 hover:shadow-xs transition-all group"
        >
          <div className="flex-1 pr-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#766A63]">
                Primary Veterinarian
              </span>
              <span className="text-[11px] font-bold text-[#8B5E3C] flex items-center gap-1 group-hover:underline">
                <Edit3 className="w-3 h-3" />
                {puppy.vetClinic || puppy.vetName ? 'Edit' : 'Add'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#2C211B] mt-0.5">
              {puppy.vetClinic || puppy.vetName ? (puppy.vetName || puppy.vetClinic) : 'No clinic added'}
            </h3>
            {puppy.vetName && puppy.vetClinic && (
              <p className="text-xs text-[#5F3E29]">{puppy.vetClinic}</p>
            )}
            <p className="text-xs font-semibold text-[#8B5E3C] mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {puppy.vetPhone || 'No phone recorded'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-[#E8DDD3] text-[#8B5E3C] group-hover:scale-105 transition-transform shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setIsEditInsuranceOpen(true)}
          className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between cursor-pointer hover:border-[#8B5E3C]/60 hover:shadow-xs transition-all group"
        >
          <div className="flex-1 pr-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#766A63]">
                Pet Insurance & Microchip
              </span>
              <span className="text-[11px] font-bold text-[#8B5E3C] flex items-center gap-1 group-hover:underline">
                <Edit3 className="w-3 h-3" />
                {puppy.insuranceProvider || puppy.microchipNumber ? 'Edit' : 'Add'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#2C211B] mt-0.5">
              {puppy.insuranceProvider || 'No insurance recorded'}
            </h3>
            {puppy.insurancePolicyNumber && (
              <p className="text-xs text-[#766A63]" title={puppy.insurancePolicyNumber}>
                Policy: #{middleTruncate(puppy.insurancePolicyNumber, 6, 4)}
              </p>
            )}
            <p className="text-xs font-semibold text-[#5F3E29] mt-1" title={puppy.microchipNumber || undefined}>
              Microchip: {puppy.microchipNumber ? middleTruncate(puppy.microchipNumber, 5, 4) : 'Not recorded'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-[#E8DDD3] text-[#8B5E3C] group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDD3] gap-6">
        {[
          { id: 'vaccines', label: `Vaccines (${vaccinations.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'meds', label: `Medications (${medications.length})`, icon: <Pill className="w-4 h-4" /> },
          { id: 'appointments', label: `Vet Visits (${appointments.length})`, icon: <CalendarIcon className="w-4 h-4" /> },
          { id: 'weight', label: `Weight (${puppy.weightLbs} lbs)`, icon: <Scale className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-[#8B5E3C] text-[#8B5E3C]'
                : 'border-transparent text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Vaccines */}
      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63]">
              Immunization Schedule
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddVacOpen(true)}
            >
              Add Vaccine Record
            </Button>
          </div>

          {vaccinations.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <ShieldCheck className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No vaccinations logged yet</h4>
              <p className="text-xs text-[#766A63] mb-4">Record core and non-core vaccines to track booster due dates.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddVacOpen(true)}>
                Add Vaccine Record
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vac) => (
                <div
                  key={vac.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2C211B]">{vac.vaccineName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vac.status === 'up_to_date' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vac.status === 'up_to_date' ? 'Up to Date' : 'Due Soon'}
                      </span>
                    </div>
                    <p className="text-xs text-[#766A63] mt-1">
                      Administered: {vac.administeredDate} • Next Due: <strong>{vac.nextDueDate || 'Not set'}</strong>
                    </p>
                    {vac.lotNumber && (
                      <p className="text-[11px] text-[#766A63]">Clinic Lot: {vac.lotNumber}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {vac.vetClinic && (
                      <div className="text-xs font-semibold text-[#5F3E29] bg-[#FFF9F2] px-3 py-1.5 rounded-xl border border-[#E8DDD3]">
                        {vac.vetClinic}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteVaccine(vac)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2 text-[#766A63] hover:text-rose-600 transition-colors cursor-pointer rounded-lg"
                      aria-label={`Delete record for ${vac.vaccineName}`}
                      title={`Delete record for ${vac.vaccineName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Medications */}
      {activeTab === 'meds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63]">
              Preventatives & Prescriptions
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddMedOpen(true)}
            >
              Add Medication
            </Button>
          </div>

          {medications.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <Pill className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No medications recorded</h4>
              <p className="text-xs text-[#766A63] mb-4">Log flea, tick, heartworm preventatives, or prescription meds.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddMedOpen(true)}>
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 mt-0.5">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2C211B]">{med.name}</h3>
                      <p className="text-xs text-[#766A63] mt-0.5">
                        Dosage: <strong>{med.dosage}</strong> • {med.frequency}
                      </p>
                      {med.notes && (
                        <p className="text-[11px] text-[#5F3E29] mt-1">{med.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2 text-[#766A63] hover:text-rose-600 transition-colors cursor-pointer rounded-lg"
                      aria-label={`Delete ${med.name}`}
                      title={`Delete ${med.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Vet Visits */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63]">
              Upcoming & Past Consultations
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddAptOpen(true)}
            >
              Schedule Visit
            </Button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <CalendarIcon className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No vet visits scheduled</h4>
              <p className="text-xs text-[#766A63] mb-4">Schedule wellness checkups, booster visits, or consultations.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddAptOpen(true)}>
                Schedule Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2C211B]">{apt.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#766A63] mt-1">
                      📅 {apt.date} at {apt.time} • {apt.clinic}
                    </p>
                    <p className="text-xs text-[#5F3E29] mt-1 leading-relaxed">
                      Reason: {apt.reason}
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-[#766A63] mt-0.5">Note: {apt.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-[#8B5E3C] bg-[#FFF9F2] px-3 py-1.5 rounded-xl border border-[#E8DDD3]">
                        {apt.doctor || 'Staff Vet'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(apt)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2 text-[#766A63] hover:text-rose-600 transition-colors cursor-pointer rounded-lg"
                        aria-label={`Delete visit ${apt.title}`}
                        title={`Delete visit ${apt.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {apt.status === 'scheduled' && (
                      <a 
                        href={generateGoogleCalendarUrl(apt)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-[#4285F4] hover:bg-[#3367D6] px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <CalendarIcon className="w-3 h-3" />
                        Add to Calendar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Weight */}
      {activeTab === 'weight' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63]">
              Weight Progression Curve
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddWeightOpen(true)}
            >
              Log New Weight
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs text-center">
            <span className="text-xs font-bold text-[#766A63]">Current Weight</span>
            <div className="text-4xl font-black text-[#2C211B] my-2 tabular-nums">
              {puppy.weightLbs > 0 ? puppy.weightLbs : '—'} <span className="text-xl font-medium text-[#766A63]">lbs</span>
            </div>
            <p className="text-xs text-[#8B5E3C] font-semibold">
              {puppy.weightLbs > 0
                ? `Logged at approximately ${Math.max(1, Math.floor((Date.now() - new Date(puppy.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 7)))} weeks of age for ${puppy.breed}.`
                : `No weight recorded yet for ${puppy.name}. Log their current weight to track healthy growth.`}
            </p>

            <div className="mt-6 pt-6 border-t border-[#E8DDD3] flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddWeightOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Update Weight Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vaccine Modal */}
      <Modal isOpen={isAddVacOpen} onClose={() => setIsAddVacOpen(false)} title="Add Vaccine Record">
        <form onSubmit={handleAddVaccine} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">Vaccine Name</label>
            <input
              type="text"
              name="puppy_vaccine_name"
              id="puppy_vaccine_name"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              required
              value={vacName}
              onChange={(e) => setVacName(e.target.value)}
              placeholder="e.g. Lyme Disease Vaccine"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Administered Date</label>
              <input
                type="date"
                value={vacAdminDate}
                onChange={(e) => setVacAdminDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Next Due Date</label>
              <input
                type="date"
                value={vacDueDate}
                onChange={(e) => setVacDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddVacOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Vaccine</Button>
          </div>
        </form>
      </Modal>

      {/* Add Medication Modal */}
      <Modal isOpen={isAddMedOpen} onClose={() => setIsAddMedOpen(false)} title="Add Medication">
        <form onSubmit={handleAddMedication} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">Medication Name</label>
            <input
              type="text"
              name="puppy_medication_name"
              id="puppy_medication_name"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              required
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Interceptor Plus"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Dosage</label>
              <input
                type="text"
                name="puppy_med_dosage"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="1 chewable tablet"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Frequency</label>
              <input
                type="text"
                name="puppy_med_freq"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                placeholder="Monthly"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddMedOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Medication</Button>
          </div>
        </form>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal isOpen={isAddAptOpen} onClose={() => setIsAddAptOpen(false)} title="Schedule Vet Visit">
        <form onSubmit={handleAddAppointment} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">Visit Title</label>
            <input
              type="text"
              name="puppy_apt_title"
              id="puppy_apt_title"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              required
              value={aptTitle}
              onChange={(e) => setAptTitle(e.target.value)}
              placeholder="e.g. 16-Week Booster & Rabies"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Date</label>
              <input
                type="date"
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1">Time</label>
              <input
                type="text"
                value={aptTime}
                onChange={(e) => setAptTime(e.target.value)}
                placeholder="03:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">Reason / Notes</label>
            <textarea
              rows={2}
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="What needs to be checked (teeth, ears, booster shot)..."
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddAptOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Log Weight Modal */}
      <Modal 
        isOpen={isAddWeightOpen} 
        onClose={() => {
          setIsAddWeightOpen(false);
          setWeightError(null);
        }} 
        title="Update Weight"
      >
        <form onSubmit={handleUpdateWeight} noValidate autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">Weight (lbs)</label>
            <input
              type="text"
              inputMode="decimal"
              name="puppy_weight_lbs"
              id="puppy_weight_lbs"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              value={newWeight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setNewWeight(val);
                  if (weightError) setWeightError(null);
                }
              }}
              placeholder="e.g. 15.5"
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FFF9F2] text-lg font-bold text-[#2C211B] focus:outline-none tabular-nums transition-colors ${
                weightError ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-[#E8DDD3] focus:border-[#8B5E3C]'
              }`}
            />
            {weightError && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{weightError}</span>
              </p>
            )}
            <p className="text-[11px] text-[#766A63] mt-1">
              Valid range: 0.5 to 350 lbs for healthy canine growth.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddWeightOpen(false);
                setWeightError(null);
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Update Weight
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Primary Vet Modal */}
      <Modal isOpen={isEditVetOpen} onClose={() => setIsEditVetOpen(false)} title="Primary Veterinarian">
        <form onSubmit={handleSaveVet} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Clinic or Hospital Name
            </label>
            <input
              type="text"
              name="vet_clinic_name"
              id="vet_clinic_name"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={vetClinicInput}
              onChange={(e) => setVetClinicInput(e.target.value)}
              placeholder="e.g. City Paws Animal Hospital"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Primary Veterinarian (Doctor Name)
            </label>
            <input
              type="text"
              name="vet_doctor_name"
              id="vet_doctor_name"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={vetNameInput}
              onChange={(e) => setVetNameInput(e.target.value)}
              placeholder="e.g. Dr. Sarah Vance, DVM"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Clinic Phone Number
            </label>
            <input
              type="tel"
              name="vet_phone_num"
              id="vet_phone_num"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={vetPhoneInput}
              onChange={(e) => setVetPhoneInput(e.target.value)}
              placeholder="e.g. (555) 234-5678"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditVetOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Veterinarian
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Pet Insurance & Microchip Modal */}
      <Modal isOpen={isEditInsuranceOpen} onClose={() => setIsEditInsuranceOpen(false)} title="Pet Insurance & Microchip">
        <form onSubmit={handleSaveInsurance} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Pet Insurance Provider
            </label>
            <input
              type="text"
              name="pet_insurance_provider"
              id="pet_insurance_provider"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={insuranceProviderInput}
              onChange={(e) => setInsuranceProviderInput(e.target.value)}
              placeholder="e.g. Trupanion, Lemonade, Healthy Paws"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Policy Number
            </label>
            <input
              type="text"
              name="pet_insurance_policy"
              id="pet_insurance_policy"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={insurancePolicyInput}
              onChange={(e) => setInsurancePolicyInput(e.target.value)}
              placeholder="e.g. POL-984210"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Microchip ID / Number
            </label>
            <input
              type="text"
              name="pet_microchip_num"
              id="pet_microchip_num"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              value={microchipInput}
              onChange={(e) => setMicrochipInput(e.target.value)}
              placeholder="e.g. 985141002345678"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
            <p className="text-[11px] text-[#766A63] mt-1">
              Usually a 9, 10, or 15-digit number registered with HomeAgain, AKC Reunite, or 24Petwatch.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditInsuranceOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Insurance & Microchip
            </Button>
          </div>
        </form>
      </Modal>

      {/* Non-blocking Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={true}
      />

      {/* 5-second Undo Toast Notification */}
      <ToastNotification
        isOpen={undoToast.open}
        message={undoToast.message}
        onClose={() => setUndoToast(prev => ({ ...prev, open: false }))}
        onUndo={undoToast.undoAction}
      />
    </div>
  );
};
