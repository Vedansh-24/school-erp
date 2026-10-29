// File name: examsheduale&admitcard.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, Plus, Trash2, Calendar, FileText, Edit2, CheckCircle2, Printer, X, UserCheck, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ClassSubjectMaster() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('Seventh');
  const [selectedSubject, setSelectedSubject] = useState('');

  // 1. School Logo Path
  const [schoolLogo, setSchoolLogo] = useState('/school-logo.png'); 

  // Class Subjects State (Fetched from class_subjects table)
  const [classSubjectsMap, setClassSubjectsMap] = useState({});
  const [classList, setClassList] = useState([
    'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth',
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 
    'Eleventh (Arts)', 'Eleventh (Commerce)', 'Eleventh (Science)',
    'Twelfth (Arts)', 'Twelfth (Commerce)', 'Twelfth (Science)'
  ]);

  // Default Exam Instructions
  const defaultInstructions = "1. Candidates must arrive at the examination hall 15 minutes prior to the scheduled time.\n2. Carrying this Admit Card to the examination hall is mandatory.\n3. Mobile phones, smartwatches, and electronic gadgets are strictly prohibited.\n4. Students must bring their own stationery items (pens, pencils, ruler).\n5. All school fee dues must be cleared prior to the commencement of examinations.";

  // Exam Creation & Scheduler Form States
  const [editingExamTitle, setEditingExamTitle] = useState(null);
  const [examTitle, setExamTitle] = useState(''); 
  const [examClass, setExamClass] = useState('PP.3+'); 
  const [currentSession, setCurrentSession] = useState('2026-2027');
  const [examInstructions, setExamInstructions] = useState(defaultInstructions);

  // Default entries set to empty array
  const [scheduleEntries, setScheduleEntries] = useState([]);

  // Registered Exams List (Grouped from exams_inventory table)
  const [registeredExams, setRegisteredExams] = useState([]);

  // Admit Card Selection States
  const [admitCardExam, setAdmitCardExam] = useState('');
  const [admitCardClass, setAdmitCardClass] = useState('PP.3+');
  
  // Student List (Fetched from students table)
  const [allStudents, setAllStudents] = useState([]);

  // Manual Roll No / Input state per student SR No
  const [manualRollNos, setManualRollNos] = useState({});

  // Modal State for Print View
  const [selectedStudentForAdmitCard, setSelectedStudentForAdmitCard] = useState(null);

  // FETCH DATA FROM SUPABASE ON MOUNT
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchClassSubjects(),
      fetchExamsInventory(),
      fetchStudentsData()
    ]);
    setLoading(false);
  };

  // 1. Fetch Class Subjects from Supabase (Table: class_subjects)
  const fetchClassSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = {};
        const classesSet = new Set();

        data.forEach((row) => {
          if (row.class_name) {
            classesSet.add(row.class_name);
            if (!mapped[row.class_name]) {
              mapped[row.class_name] = [];
            }
            if (row.subject_name && !mapped[row.class_name].includes(row.subject_name)) {
              mapped[row.class_name].push(row.subject_name);
            }
          }
        });

        setClassSubjectsMap(mapped);
        if (classesSet.size > 0) {
          setClassList(Array.from(classesSet));
        }
      }
    } catch (err) {
      console.error('Error fetching class subjects:', err.message);
    }
  };

  // 2. Fetch Exams Inventory from Supabase (Table: exams_inventory)
  const fetchExamsInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('exams_inventory')
        .select('*')
        .order('exam_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const groupedExams = {};

        data.forEach((item) => {
          const key = `${item.exam_title}_${item.class_name}`;
          if (!groupedExams[key]) {
            groupedExams[key] = {
              id: key,
              name: item.exam_title,
              class: item.class_name,
              session: item.session || '2026-2027',
              instructions: item.instructions_rules || defaultInstructions,
              schedule: []
            };
          }

          let dayName = '';
          if (item.exam_date) {
            const dt = new Date(item.exam_date);
            dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
          }

          groupedExams[key].schedule.push({
            id: item.id,
            date: item.exam_date || '',
            dayFormat: dayName || 'Monday',
            subject: item.subject_name || '',
            timeSlot: item.time_slot || '08:30 AM - 11:30 AM'
          });
        });

        const formattedExams = Object.values(groupedExams).map((ex) => {
          const dates = ex.schedule.map((s) => s.date).filter(Boolean);
          const minDate = dates.length > 0 ? dates[0] : 'N/A';
          const maxDate = dates.length > 0 ? dates[dates.length - 1] : 'N/A';
          
          return {
            ...ex,
            totalPapers: `${ex.schedule.length} Papers`,
            dateRange: minDate === maxDate ? minDate : `${minDate} to ${maxDate}`
          };
        });

        setRegisteredExams(formattedExams);
        if (formattedExams.length > 0 && !admitCardExam) {
          setAdmitCardExam(formattedExams[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching exams inventory:', err.message);
    }
  };

  // 3. Fetch Students from Supabase (Table: students)
  const fetchStudentsData = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id, student_full_name, father_name, mother_name, class_name, sr_no, mobile_number, photo_url');

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedStudents = data.map((st, idx) => ({
          rollNo: (101 + idx).toString(),
          name: st.student_full_name || `Student (${st.sr_no})`,
          fatherName: st.father_name || 'N/A',
          motherName: st.mother_name || 'N/A',
          srNo: st.sr_no || st.student_id || `2026000${idx + 1}`,
          mobileNo: st.mobile_number || 'N/A',
          class: st.class_name || 'Seventh',
          section: 'A',
          feeDue: '₹0 (Cleared)',
          studentPhoto: st.photo_url || null
        }));
        setAllStudents(mappedStudents);
      }
    } catch (err) {
      console.error('Error fetching students data:', err.message);
    }
  };

  const subjects = classSubjectsMap[selectedClass] || [];

  const handleExamClassChange = (newClass) => {
    setExamClass(newClass);
    if (!editingExamTitle) {
      const defaultSubjs = classSubjectsMap[newClass] || ['Mathematics', 'English', 'Science'];
      const autoSchedule = defaultSubjs.map((sub, idx) => ({
        id: `temp_${Date.now()}_${idx}`,
        date: `2026-08-${17 + idx}`,
        dayFormat: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][idx % 6],
        subject: sub,
        timeSlot: '08:30 AM - 11:30 AM'
      }));
      setScheduleEntries(autoSchedule);
    }
  };

  const handleAddScheduleRow = () => {
    const currentClassSubjs = classSubjectsMap[examClass] || ['Subject'];
    setScheduleEntries([
      ...scheduleEntries,
      { id: `temp_${Date.now()}`, date: '', dayFormat: '', subject: currentClassSubjs[0] || '', timeSlot: '08:30 AM - 11:30 AM' }
    ]);
  };

  const handleDeleteScheduleRow = (id) => {
    setScheduleEntries(scheduleEntries.filter(item => item.id !== id));
  };

  const handleSaveCompleteSchedule = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      alert('Please enter Exam Title!');
      return;
    }

    setLoading(true);

    try {
      if (editingExamTitle) {
        await supabase
          .from('exams_inventory')
          .delete()
          .eq('exam_title', examTitle)
          .eq('class_name', examClass);
      }

      const rowsToInsert = scheduleEntries.map((entry) => ({
        exam_title: examTitle,
        class_name: examClass,
        exam_date: entry.date || new Date().toISOString().split('T')[0],
        subject_name: entry.subject,
        time_slot: entry.timeSlot,
        instructions_rules: examInstructions,
        session: currentSession
      }));

      const { error } = await supabase
        .from('exams_inventory')
        .insert(rowsToInsert);

      if (error) throw error;

      alert(editingExamTitle ? 'Exam schedule updated in Supabase successfully!' : 'New exam schedule created in Supabase!');
      setEditingExamTitle(null);
      await fetchExamsInventory();
    } catch (err) {
      alert('Error saving to Supabase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = (exam) => {
    setEditingExamTitle(exam.name);
    setExamTitle(exam.name);
    setExamClass(exam.class);
    setCurrentSession(exam.session || '2026-2027');
    setExamInstructions(exam.instructions || defaultInstructions);
    setScheduleEntries(exam.schedule || []);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleDeleteRegisteredExam = async (exam) => {
    if (confirm(`Are you sure you want to delete ${exam.name} (${exam.class})?`)) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('exams_inventory')
          .delete()
          .eq('exam_title', exam.name)
          .eq('class_name', exam.class);

        if (error) throw error;

        alert('Exam schedule deleted successfully from Supabase!');
        await fetchExamsInventory();
      } catch (err) {
        alert('Error deleting exam: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredStudents = allStudents.filter(st => st.class === admitCardClass);

  const handlePrintAdmitCard = (student) => {
    const assignedRollNo = manualRollNos[student.srNo] !== undefined ? manualRollNos[student.srNo] : student.rollNo;
    setSelectedStudentForAdmitCard({
      ...student,
      rollNo: assignedRollNo
    });
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const currentAdmitCardExamData = registeredExams.find(ex => ex.name === admitCardExam && ex.class === admitCardClass) 
    || registeredExams.find(ex => ex.name === admitCardExam) 
    || { schedule: scheduleEntries, instructions: examInstructions };

  const inputTheme = "w-full bg-[#F4F7F9] border-2 border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/15 shadow-inner transition-all duration-200";

  return (
    <div className="bg-[#F5F7FA] min-h-screen w-full p-4 md:p-8 font-sans space-y-8 text-[#1A2332]">
      
      {/* PRINT MARGIN & TOP SPACING ZERO OVERRIDE */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
          }
          .print-container {
            margin: 0 !important;
            padding: 10px !important;
            border: none !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs text-[#1B3A6B]">
            <Loader2 className="animate-spin" size={20} /> Syncing with Supabase...
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B3A6B] flex items-center justify-center text-white shadow-lg shrink-0">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1B3A6B] uppercase tracking-wide">
                Class-wise Subject Master & Exam Creator
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Manage subjects, create exam timetables, and print student admit cards directly linked with Supabase.
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto bg-slate-50 p-3 rounded-2xl border border-gray-200 flex items-center gap-3">
            <Image size={20} className="text-[#1B3A6B] shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-slate-500">Logo File / Path</label>
              <input 
                type="text"
                value={schoolLogo}
                onChange={(e) => setSchoolLogo(e.target.value)}
                className="bg-white border border-gray-300 text-xs font-bold px-2 py-1 rounded w-full md:w-48 outline-none text-slate-800 focus:border-[#1B3A6B]"
                placeholder="/school-logo.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. CLASS-WISE FIXED SUBJECTS MASTER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm print:hidden">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <BookOpen className="text-[#1B3A6B]" size={22} />
          <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-wide">1. Class-wise Fixed Subjects Master (Supabase)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          <div className="lg:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
              }}
              className={inputTheme}
            >
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Class Subjects List ({subjects.length} Subjects Configured)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={inputTheme}
            >
              <option value="">-- Select / View Subject --</option>
              {subjects.map((subj, idx) => (
                <option key={idx} value={subj}>{idx + 1}. {subj}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. EXAM CREATION & TIMETABLE SCHEDULER */}
      <div className={`bg-white border-2 ${editingExamTitle ? 'border-[#D97706] ring-4 ring-[#D97706]/10' : 'border-gray-200'} rounded-3xl p-7 shadow-sm transition-all print:hidden`}>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="text-[#1B3A6B]" size={22} />
            <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-wide">
              {editingExamTitle ? '2. Edit Exam Schedule & Timetable' : '2. Exam Creation & Timetable Scheduler'}
            </h2>
          </div>
          {editingExamTitle && (
            <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-xs font-bold px-3 py-1 rounded-full uppercase">
              Editing Mode Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Exam Title / Name</label>
            <input
              type="text"
              placeholder="e.g. FA - 2 or Half-Yearly 2026"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className={inputTheme}
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Target Class</label>
            <select
              value={examClass}
              onChange={(e) => handleExamClassChange(e.target.value)}
              className={inputTheme}
            >
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Session</label>
            <input
              type="text"
              value={currentSession}
              onChange={(e) => setCurrentSession(e.target.value)}
              className={inputTheme}
            />
          </div>
        </div>

        {/* Schedule Inputs */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase text-slate-700 mb-4 tracking-wider">Date-wise Subject & Time Schedule</h3>
          
          <div className="space-y-4">
            {scheduleEntries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Exam Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[index].date = e.target.value;
                      setScheduleEntries(updated);
                    }}
                    className={inputTheme}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Day</label>
                  <input
                    type="text"
                    value={entry.dayFormat}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[index].dayFormat = e.target.value;
                      setScheduleEntries(updated);
                    }}
                    placeholder="Monday"
                    className={inputTheme}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Subject Name</label>
                  <input
                    type="text"
                    value={entry.subject}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[index].subject = e.target.value;
                      setScheduleEntries(updated);
                    }}
                    placeholder="Subject Name"
                    className={inputTheme}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Time Slot</label>
                  <input
                    type="text"
                    value={entry.timeSlot}
                    onChange={(e) => {
                      const updated = [...scheduleEntries];
                      updated[index].timeSlot = e.target.value;
                      setScheduleEntries(updated);
                    }}
                    placeholder="08:30 AM - 11:30 AM"
                    className={inputTheme}
                  />
                </div>

                <div className="sm:col-span-1 flex items-end justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteScheduleRow(entry.id)}
                    className="bg-[#EF4444] hover:bg-[#DC2626] text-white p-3 rounded-xl shadow-[0_4px_0_#991B1B] active:translate-y-[4px] transition-all"
                    title="Delete Row"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddScheduleRow}
            className="mt-5 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-[0_4px_0_#075985] active:translate-y-[4px] transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            <Plus size={16} /> Add Subject Exam Date
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Exam Instructions / Rules</label>
          <textarea
            rows={4}
            value={examInstructions}
            onChange={(e) => setExamInstructions(e.target.value)}
            className={inputTheme}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSaveCompleteSchedule}
            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-[0_4px_0_#047857] active:translate-y-[4px] transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            <CheckCircle2 size={18} /> {editingExamTitle ? 'Update Exam Schedule in Supabase' : 'Save Complete Exam Schedule to Supabase'}
          </button>
          
          {editingExamTitle && (
            <button
              type="button"
              onClick={() => {
                setEditingExamTitle(null);
                setExamTitle('');
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-[0_4px_0_#4B5563] active:translate-y-[4px] transition-all uppercase"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* REGISTERED EXAMS INVENTORY FROM SUPABASE */}
      <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm print:hidden">
        <h3 className="text-sm font-black text-slate-800 mb-5 tracking-wider uppercase">Registered Exams Inventory (Fetched from Supabase: exams_inventory)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-gray-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                <th className="p-4 rounded-tl-xl">Exam Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Session</th>
                <th className="p-4">Total Papers</th>
                <th className="p-4">Date Range</th>
                <th className="p-4 text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-bold text-slate-800">
              {registeredExams.length > 0 ? (
                registeredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{exam.name}</td>
                    <td className="p-4">{exam.class}</td>
                    <td className="p-4 text-slate-500">{exam.session}</td>
                    <td className="p-4 text-slate-500">{exam.totalPapers}</td>
                    <td className="p-4 text-slate-500">{exam.dateRange}</td>
                    <td className="p-4 text-right space-x-3">
                      <button 
                        onClick={() => handleEditExam(exam)}
                        className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2.5 rounded-xl shadow-[0_4px_0_#92400E] active:translate-y-[4px] transition-all inline-flex items-center gap-1.5 uppercase tracking-wider mb-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRegisteredExam(exam)}
                        className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2.5 rounded-xl shadow-[0_4px_0_#991B1B] active:translate-y-[4px] transition-all inline-flex items-center gap-1.5 uppercase tracking-wider mb-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 font-bold">No registered exams found in Supabase. Please create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ADMIT CARD GENERATOR */}
      <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm print:hidden">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <FileText className="text-[#1B3A6B]" size={22} />
          <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-wide">3. Admit Card Generator</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Exam Name</label>
            <select
              value={admitCardExam}
              onChange={(e) => setAdmitCardExam(e.target.value)}
              className={inputTheme}
            >
              <option value="">-- Choose Exam --</option>
              {registeredExams.map((ex) => (
                <option key={ex.id} value={ex.name}>{ex.name} ({ex.class})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Class</label>
            <select
              value={admitCardClass}
              onChange={(e) => setAdmitCardClass(e.target.value)}
              className={inputTheme}
            >
              <option value="">-- Choose Class --</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STUDENT LIST TABLE */}
        {admitCardExam && admitCardClass ? (
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-slate-50 mt-6 shadow-sm">
            <div className="bg-[#1B3A6B] text-white px-6 py-4 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={18} className="text-[#FFC107]" />
                Students List for Exam: <span className="text-[#FFC107]">{admitCardExam}</span> | Class: <span className="text-[#FFC107]">{admitCardClass}</span>
              </span>
              <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full font-bold">
                Total Students: {filteredStudents.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">SR No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Father Name</th>
                    <th className="p-4">Manual Roll No./ Input</th>
                    <th className="p-4">Remaining Fee Due</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-bold text-slate-800 bg-white">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st) => (
                      <tr key={st.srNo} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-[#1B3A6B]">{st.srNo}</td>
                        <td className="p-4">{st.name}</td>
                        <td className="p-4 text-slate-600">{st.fatherName}</td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={manualRollNos[st.srNo] !== undefined ? manualRollNos[st.srNo] : st.rollNo}
                            onChange={(e) => setManualRollNos({ ...manualRollNos, [st.srNo]: e.target.value })}
                            className="w-32 bg-slate-50 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-[#1B3A6B] focus:bg-white shadow-inner"
                            placeholder="Enter Roll No"
                          />
                        </td>
                        <td className="p-4 font-bold text-slate-700">{st.feeDue}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handlePrintAdmitCard(st)}
                            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-[0_3px_0_#047857] active:translate-y-[2px] transition-all inline-flex items-center gap-2 uppercase tracking-wider"
                          >
                            <Printer size={14} /> Print Admit Card
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        No students enrolled in class <span className="text-slate-700">{admitCardClass}</span> yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs font-bold text-slate-400">
            Please select both <span className="text-slate-700 font-extrabold">Exam Name</span> and <span className="text-slate-700 font-extrabold">Class</span> above to view the student list table.
          </div>
        )}
      </div>

      {/* ADMIT CARD PRINT MODAL PREVIEW */}
      {selectedStudentForAdmitCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 md:p-6 shadow-2xl relative my-2 print:p-2 print:shadow-none print:m-0 print:w-full print:max-w-none print-container">
            
            {/* Modal Actions (Hidden in Print) */}
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200 print:hidden">
              <h3 className="text-sm font-black text-[#1B3A6B] uppercase tracking-wider">
                Admit Card Preview
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerBrowserPrint}
                  className="bg-[#1B3A6B] hover:bg-[#112544] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 uppercase shadow-md transition-all"
                >
                  <Printer size={16} /> Print Now
                </button>
                <button
                  onClick={() => setSelectedStudentForAdmitCard(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINTABLE ADMIT CARD CONTAINER */}
            <div className="border-4 border-[#1B3A6B] p-5 rounded-2xl bg-white text-slate-900 space-y-4">
              
              {/* Header with School Logo */}
              <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
                <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden border shrink-0">
                  <img 
                    src={schoolLogo} 
                    alt="School Logo" 
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="text-center flex-1 px-4">
                  <h2 className="text-xl md:text-2xl font-black text-[#1B3A6B] uppercase tracking-wide">
                    BLUE HEAVEN KIDS ACADEMY
                  </h2>
                  <p className="text-[10px] md:text-[11px] font-bold text-gray-700 mt-0.5">
                    133-134 Shri Dev Nagar, Benar Road, Jaipur
                  </p>
                  <p className="text-[10px] font-bold text-gray-600 mt-1">
                    ADMIT CARD - SESSION {currentAdmitCardExamData?.session || currentSession}
                  </p>
                  <span className="inline-block mt-1 bg-[#1B3A6B] text-white text-[11px] font-black px-4 py-0.5 rounded-full uppercase tracking-widest">
                    {admitCardExam || 'EXAMINATION'}
                  </span>
                </div>
                <div className="w-16 h-16 shrink-0"></div>
              </div>

              {/* Student Details Grid with Photo */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 text-xs flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Roll No :</span> <span className="font-black text-[#1B3A6B]">{selectedStudentForAdmitCard.rollNo}</span></div>
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">SR No :</span> <span className="font-black text-slate-900">{selectedStudentForAdmitCard.srNo}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Student Name:</span> <span className="font-black text-slate-900">{selectedStudentForAdmitCard.name}</span></div>
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Class:</span> <span className="font-bold">{selectedStudentForAdmitCard.class}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Father Name:</span> <span className="font-bold">{selectedStudentForAdmitCard.fatherName}</span></div>
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Mother Name:</span> <span className="font-bold">{selectedStudentForAdmitCard.motherName}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Mobile No:</span> <span className="font-bold">{selectedStudentForAdmitCard.mobileNo}</span></div>
                    <div><span className="font-extrabold text-slate-500 uppercase text-[10px]">Remaining Fee Due:</span> <span className="font-bold text-[#10B981]">{selectedStudentForAdmitCard.feeDue}</span></div>
                  </div>
                </div>

                {/* Student Photo Box */}
                <div className="w-20 h-24 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {selectedStudentForAdmitCard.studentPhoto ? (
                    <img 
                      src={selectedStudentForAdmitCard.studentPhoto} 
                      alt="Student" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-1">
                      <UserCheck size={22} className="text-gray-300 mx-auto mb-1" />
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Examination Timetable</h4>
                <table className="w-full text-left border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-[#1B3A6B] text-white font-black uppercase text-[10px]">
                      <th className="p-2 border border-gray-300">Date</th>
                      <th className="p-2 border border-gray-300">Day</th>
                      <th className="p-2 border border-gray-300">Subject</th>
                      <th className="p-2 border border-gray-300">Time Slot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-bold">
                    {currentAdmitCardExamData?.schedule && currentAdmitCardExamData.schedule.length > 0 ? (
                      currentAdmitCardExamData.schedule.map((sc, idx) => (
                        <tr key={idx} className="nth-[even]:bg-slate-50">
                          <td className="p-1.5 border border-gray-300">{sc.date || 'N/A'}</td>
                          <td className="p-1.5 border border-gray-300">{sc.dayFormat || 'N/A'}</td>
                          <td className="p-1.5 border border-gray-300 text-slate-900">{sc.subject}</td>
                          <td className="p-1.5 border border-gray-300 text-slate-600">{sc.timeSlot}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-gray-400">No schedule available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 text-[11px]">
                <h5 className="font-black uppercase text-slate-700 mb-1 text-[10px]">Rules & Instructions:</h5>
                <pre className="whitespace-pre-wrap font-sans text-slate-600 text-[9.5px] leading-relaxed">
                  {currentAdmitCardExamData?.instructions || defaultInstructions}
                </pre>
              </div>

              {/* Professional Bottom Signature & Centered School Stamp Section */}
              <div className="grid grid-cols-3 items-end pt-4 text-[11px] font-black uppercase text-slate-700">
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-1 w-32 mx-auto">
                    Student Signature
                  </div>
                </div>
                
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="w-24 h-12 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-[9px] text-gray-400 bg-slate-50 mb-1 shadow-inner">
                    School Stamp
                  </div>
                  <span className="text-[9px] tracking-tighter text-slate-500">Official Seal</span>
                </div>

                <div className="text-center">
                  <div className="border-t border-slate-400 pt-1 w-36 mx-auto">
                    Principal / Controller
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}