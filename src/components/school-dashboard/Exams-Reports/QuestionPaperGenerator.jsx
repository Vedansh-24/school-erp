// Filename: QuestionPaperGenerator.tsx
'use client';
 
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, FileText, Zap, PlusCircle, Send, Clock, Search, Layers, Printer, ArrowLeft, CheckSquare, FileSpreadsheet, Code2, Upload, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
 
export default function QuestionPaperGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [selectedManualQuestions, setSelectedManualQuestions] = useState([]);

  // Database se fetched available books mapping (Class -> Subject -> Books array)
  const [classBooksMap, setClassBooksMap] = useState({});
  // Class-wise subjects from class_subjects table
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Generated Paper State
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperPrintMode, setPaperPrintMode] = useState('student'); // 'student' or 'teacher'
 
  // Generate Paper Form State (with all question types quantity & marks setup)
  const [formData, setFormData] = useState({
    schoolName: 'BLUE HEAVEN KIDS ACADEMY',
    showSchoolName: true,
    examName: 'Half Yearly Examination (अर्द्धवार्षिक परीक्षा)',
    session: '2026-2027',
    timeAllowed: '3 Hours (घंटे)',
    selectedClass: 'Sixth',
    subject: '',
    selectedBooks: [],
    selectedChapters: [],
    medium: 'English',
    sourceType: 'Global Question Bank',
    mcqQty: 4,
    mcqMarks: 1,
    blankQty: 2,
    blankMarks: 1,
    matchingQty: 2,
    matchingMarks: 1,
    tfQty: 2,
    tfMarks: 1,
    vShortQty: 3,
    vShortMarks: 1,
    shortQty: 4,
    shortMarks: 2,
    longQty: 2,
    longMarks: 4,
  });

  // Manual Picker Quantity & Marks Configuration State
  const [manualConfig, setManualConfig] = useState({
    mcqQty: 4,
    mcqMarks: 1,
    blankQty: 2,
    blankMarks: 1,
    matchingQty: 2,
    matchingMarks: 1,
    tfQty: 2,
    tfMarks: 1,
    vShortQty: 3,
    vShortMarks: 1,
    shortQty: 4,
    shortMarks: 2,
    longQty: 2,
    longMarks: 4,
  });
 
  // Suggest / Add Question Form State
  const [suggestData, setSuggestData] = useState({
    class_name: 'Sixth',
    subject_name: '',
    book_name: 'Main Book',
    chapter_name: 'Chapter 1',
    question_type: 'MCQ',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    marks: 1,
    medium: 'English',
    school_name: 'BLUE HEAVEN KIDS ACADEMY'
  });
 
  // Manual Picker Form State with Dropdowns for Book, Chapter, Question Type
  const [manualData, setManualData] = useState({
    selectedClass: 'Sixth',
    subject_name: '',
    selectedBook: '',
    selectedChapter: '',
    selectedQuestionType: 'All',
    medium: 'English',
    sourceType: 'Global Question Bank',
  });

  // Bulk Import States (Excel / CSV & JSON Tabs UI - Class, Subject, Book, Medium selected once globally)
  const [bulkSubTab, setBulkSubTab] = useState('excel');
  const [bulkClass, setBulkClass] = useState('Sixth');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBook, setBulkBook] = useState('Main Book');
  const [bulkMedium, setBulkMedium] = useState('English');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStatusMsg, setBulkStatusMsg] = useState({ type: '', text: '' });
 
  const classList = [
    'All Classes', 'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh (Arts)', 'Eleventh (Commerce)', 
    'Eleventh (Science)', 'Twelfth (Arts)', 'Twelfth (Commerce)', 'Twelfth (Science)'
  ];

  const mediumList = ['English', 'Hindi', 'Both'];
  const questionTypeList = ['All', 'MCQ', 'Blank Space', 'Matchings', 'True/False', 'Very Short', 'Short', 'Long'];
  const suggestQuestionTypes = ['MCQ', 'Blank Space', 'Matchings', 'True/False', 'Very Short', 'Short', 'Long'];

  // Helper function to format decimal marks into clear mixed fractions (e.g., 0.5 -> 1/2, 1.5 -> 1 1/2, 2.5 -> 2 1/2) without any confusion
  const fmtMarks = (m) => {
    const num = Number(m);
    if (Math.abs(num % 1 - 0.5) < 1e-5) {
      const intPart = Math.floor(num);
      return intPart === 0 ? '1/2' : `${intPart} 1/2`;
    }
    return m;
  };

  const fmtTotalMarks = (total) => {
    const t = Number(total);
    if (Math.abs(t % 1 - 0.5) < 1e-5) {
      const intPart = Math.floor(t);
      return intPart === 0 ? '1/2' : `${intPart} 1/2`;
    }
    return total;
  };

  // Helper for sequential natural sorting of chapters
  const sortChapters = (chaptersArray) => {
    return Array.from(chaptersArray).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  // Fetch subjects from class_subjects table based on selected class
  const fetchClassSubjects = async (className, isManual = false, isSuggest = false, isBulk = false) => {
    const { data, error } = await supabase
      .from('class_subjects')
      .select('subject_name')
      .eq('class_name', className);

    if (!error && data) {
      const subs = data.map(item => item.subject_name);
      setAvailableSubjects(subs);
      if (subs.length > 0) {
        if (isManual) {
          setManualData(prev => ({ ...prev, subject_name: subs[0], selectedBook: '', selectedChapter: '' }));
          handleLoadAllManualQuestionsForSubject(className, subs[0], manualData.medium, manualData.sourceType);
        } else if (isSuggest) {
          setSuggestData(prev => ({ ...prev, subject_name: subs[0] }));
        } else if (isBulk) {
          setBulkSubject(subs[0]);
        } else {
          setFormData(prev => ({ ...prev, subject: subs[0], selectedBooks: [], selectedChapters: [] }));
        }
      } else {
        if (isManual) {
          setManualData(prev => ({ ...prev, subject_name: '', selectedBook: '', selectedChapter: '' }));
          setLoadedQuestions([]);
        } else if (isSuggest) {
          setSuggestData(prev => ({ ...prev, subject_name: '' }));
        } else if (isBulk) {
          setBulkSubject('');
        } else {
          setFormData(prev => ({ ...prev, subject: '', selectedBooks: [], selectedChapters: [] }));
        }
      }
    }
  };

  // Fetch unique books and chapters from question_bank
  const fetchMetadata = async () => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('class_name, subject_name, book_name, chapter_name');

    if (!error && data) {
      const map = {};
      data.forEach(item => {
        const cls = item.class_name;
        const sub = item.subject_name;
        const book = item.book_name || 'Main Book';
        const chap = item.chapter_name;

        if (cls && sub) {
          if (!map[cls]) map[cls] = {};
          if (!map[cls][sub]) map[cls][sub] = {};
          if (!map[cls][sub][book]) map[cls][sub][book] = new Set();
          if (chap) map[cls][sub][book].add(chap);
        }
      });
      setClassBooksMap(map);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchClassSubjects(formData.selectedClass);
  }, []);

  const handleClassChange = (e, target = 'generator') => {
    const cls = e.target.value;
    if (target === 'generator') {
      setFormData(prev => ({ ...prev, selectedClass: cls }));
      fetchClassSubjects(cls, false, false, false);
    } else if (target === 'manual') {
      setManualData(prev => ({ ...prev, selectedClass: cls }));
      fetchClassSubjects(cls, true, false, false);
    } else if (target === 'suggest') {
      setSuggestData(prev => ({ ...prev, class_name: cls }));
      fetchClassSubjects(cls, false, true, false);
    } else if (target === 'bulk') {
      setBulkClass(cls);
      fetchClassSubjects(cls, false, false, true);
    }
  };

  const getBooksForClassSubject = (cls, sub) => {
    if (classBooksMap[cls] && classBooksMap[cls][sub]) {
      return Object.keys(classBooksMap[cls][sub]);
    }
    return ['Main Book'];
  };

  const getChaptersForSelection = (cls, sub, books) => {
    if (!classBooksMap[cls] || !classBooksMap[cls][sub]) return [];
    const chaptersSet = new Set();
    books.forEach(book => {
      if (classBooksMap[cls][sub][book]) {
        classBooksMap[cls][sub][book].forEach(chap => chaptersSet.add(chap));
      }
    });
    return sortChapters(chaptersSet);
  };
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleManualConfigChange = (e) => {
    const { name, value } = e.target;
    setManualConfig(prev => ({ ...prev, [name]: Number(value) }));
  };
 
  const handleSuggestChange = (e) => {
    const { name, value } = e.target;
    setSuggestData(prev => ({ ...prev, [name]: value }));
  };
 
  // Manual Picker Change Handler for Dropdowns
  const handleManualChange = async (e) => {
    const { name, value } = e.target;
    const updatedManualData = { ...manualData, [name]: value };
    
    if (name === 'subject_name') {
      updatedManualData.selectedBook = '';
      updatedManualData.selectedChapter = '';
    } else if (name === 'selectedBook') {
      updatedManualData.selectedChapter = '';
    }

    setManualData(updatedManualData);

    if (name === 'selectedClass' || name === 'subject_name' || name === 'medium' || name === 'sourceType') {
      await handleLoadAllManualQuestionsForSubject(
        updatedManualData.selectedClass, 
        updatedManualData.subject_name, 
        updatedManualData.medium, 
        updatedManualData.sourceType
      );
    }
  };

  const handleLoadAllManualQuestionsForSubject = async (cls, sub, med, src) => {
    if (!sub) {
      setLoadedQuestions([]);
      return;
    }

    let query = supabase
      .from('question_bank')
      .select('*')
      .eq('class_name', cls)
      .eq('subject_name', sub);

    if (med !== 'Both') {
      query = query.eq('medium', med);
    }

    if (src === 'Global Question Bank') {
      query = query.eq('status', 'approved');
    } else if (src === 'School Custom Questions') {
      query = query.eq('is_global', false).in('status', ['approved', 'pending']);
    } else {
      query = query.in('status', ['approved', 'pending']);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLoadedQuestions(data);
      const books = Array.from(new Set(data.map(q => q.book_name || 'Main Book')));
      const firstBook = books.length > 0 ? books[0] : '';
      const chapters = sortChapters(new Set(data.filter(q => (q.book_name || 'Main Book') === firstBook).map(q => q.chapter_name || 'General Chapter')));
      const firstChap = chapters.length > 0 ? chapters[0] : '';

      setManualData(prev => ({
        ...prev,
        selectedBook: firstBook,
        selectedChapter: firstChap
      }));
    } else {
      setLoadedQuestions([]);
    }
  };

  const toggleBookSelection = (bookName, isManual = false) => {
    if (isManual) {
      setManualData(prev => {
        const exists = prev.selectedBooks.includes(bookName);
        const updatedBooks = exists 
          ? prev.selectedBooks.filter(b => b !== bookName)
          : [...prev.selectedBooks, bookName];
        return { ...prev, selectedBooks: updatedBooks, selectedChapters: [] };
      });
    } else {
      setFormData(prev => {
        const exists = prev.selectedBooks.includes(bookName);
        const updatedBooks = exists 
          ? prev.selectedBooks.filter(b => b !== bookName)
          : [...prev.selectedBooks, bookName];
        return { ...prev, selectedBooks: updatedBooks, selectedChapters: [] };
      });
    }
  };

  const toggleChapterSelection = (chapName, isManual = false) => {
    if (isManual) {
      setManualData(prev => {
        const exists = prev.selectedChapters.includes(chapName);
        const updatedChapters = exists 
          ? prev.selectedChapters.filter(c => c !== chapName)
          : [...prev.selectedChapters, chapName];
        return { ...prev, selectedChapters: updatedChapters };
      });
    } else {
      setFormData(prev => {
        const exists = prev.selectedChapters.includes(chapName);
        const updatedChapters = exists 
          ? prev.selectedChapters.filter(c => c !== chapName)
          : [...prev.selectedChapters, chapName];
        return { ...prev, selectedChapters: updatedChapters };
      });
    }
  };

  // Selected questions objects and counters by type for Manual Picker limit enforcement
  const selectedQuestionsObjects = loadedQuestions.filter(q => selectedManualQuestions.includes(q.id));
  const countMCQ = selectedQuestionsObjects.filter(q => q.question_type === 'MCQ').length;
  const countBlank = selectedQuestionsObjects.filter(q => q.question_type === 'Blank Space').length;
  const countMatching = selectedQuestionsObjects.filter(q => q.question_type === 'Matchings').length;
  const countTF = selectedQuestionsObjects.filter(q => q.question_type === 'True/False').length;
  const countVShort = selectedQuestionsObjects.filter(q => q.question_type === 'Very Short').length;
  const countShort = selectedQuestionsObjects.filter(q => q.question_type === 'Short').length;
  const countLong = selectedQuestionsObjects.filter(q => q.question_type === 'Long').length;

  // Live Max Marks Calculations for Generate & Manual Picker
  const totalGenerateMaxMarks = 
    (Number(formData.mcqQty) * Number(formData.mcqMarks)) +
    (Number(formData.blankQty) * Number(formData.blankMarks)) +
    (Number(formData.matchingQty) * Number(formData.matchingMarks)) +
    (Number(formData.tfQty) * Number(formData.tfMarks)) +
    (Number(formData.vShortQty) * Number(formData.vShortMarks)) +
    (Number(formData.shortQty) * Number(formData.shortMarks)) +
    (Number(formData.longQty) * Number(formData.longMarks));

  const totalManualMaxMarks = 
    (Number(manualConfig.mcqQty) * Number(manualConfig.mcqMarks)) +
    (Number(manualConfig.blankQty) * Number(manualConfig.blankMarks)) +
    (Number(manualConfig.matchingQty) * Number(manualConfig.matchingMarks)) +
    (Number(manualConfig.tfQty) * Number(manualConfig.tfMarks)) +
    (Number(manualConfig.vShortQty) * Number(manualConfig.vShortMarks)) +
    (Number(manualConfig.shortQty) * Number(manualConfig.shortMarks)) +
    (Number(manualConfig.longQty) * Number(manualConfig.longMarks));

  const totalSelectedMarks = selectedQuestionsObjects.reduce((acc, q) => {
    let eachMarks = 1;
    if (q.question_type === 'MCQ') eachMarks = Number(manualConfig.mcqMarks);
    else if (q.question_type === 'Blank Space') eachMarks = Number(manualConfig.blankMarks);
    else if (q.question_type === 'Matchings') eachMarks = Number(manualConfig.matchingMarks);
    else if (q.question_type === 'True/False') eachMarks = Number(manualConfig.tfMarks);
    else if (q.question_type === 'Very Short') eachMarks = Number(manualConfig.vShortMarks);
    else if (q.question_type === 'Short') eachMarks = Number(manualConfig.shortMarks);
    else if (q.question_type === 'Long') eachMarks = Number(manualConfig.longMarks);
    else eachMarks = q.marks || 1;
    return acc + eachMarks;
  }, 0);

  const getMaxQtyForType = (qType) => {
    switch(qType) {
      case 'MCQ': return manualConfig.mcqQty;
      case 'Blank Space': return manualConfig.blankQty;
      case 'Matchings': return manualConfig.matchingQty;
      case 'True/False': return manualConfig.tfQty;
      case 'Very Short': return manualConfig.vShortQty;
      case 'Short': return manualConfig.shortQty;
      case 'Long': return manualConfig.longQty;
      default: return 99;
    }
  };

  const toggleManualQuestionSelection = (q) => {
    const isSelected = selectedManualQuestions.includes(q.id);
    if (!isSelected) {
      const currentCount = selectedQuestionsObjects.filter(item => item.question_type === q.question_type).length;
      const maxAllowed = getMaxQtyForType(q.question_type);
      if (currentCount >= maxAllowed) {
        alert(`Aap ${q.question_type} keval ${maxAllowed} hi select kar sakte hain! Kripya pehle koi dusra select kiya ہوا question uncheck karein.`);
        return;
      }
      setSelectedManualQuestions(prev => [...prev, q.id]);
    } else {
      setSelectedManualQuestions(prev => prev.filter(id => id !== q.id));
    }
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    if (!suggestData.question_text || !suggestData.correct_answer) {
      alert('Kripya Sawaal aur Jawab dono bharein!');
      return;
    }

    const { error } = await supabase.from('question_bank').insert([
      {
        class_name: suggestData.class_name,
        subject_name: suggestData.subject_name,
        book_name: suggestData.book_name || 'Main Book',
        chapter_name: suggestData.chapter_name,
        question_type: suggestData.question_type,
        question_text: suggestData.question_text,
        option_a: suggestData.question_type === 'MCQ' ? suggestData.option_a : null,
        option_b: suggestData.question_type === 'MCQ' ? suggestData.option_b : null,
        option_c: suggestData.question_type === 'MCQ' ? suggestData.option_c : null,
        option_d: suggestData.question_type === 'MCQ' ? suggestData.option_d : null,
        correct_answer: suggestData.correct_answer,
        marks: parseInt(suggestData.marks),
        medium: suggestData.medium,
        is_global: false,
        status: 'pending',
        school_name: suggestData.school_name
      }
    ]);

    if (error) {
      alert('Error saving question: ' + error.message);
    } else {
      alert('Question safaltapoorvak submit ho gaya hai!');
      setSuggestData(prev => ({ 
        ...prev, 
        question_text: '', 
        option_a: '', 
        option_b: '', 
        option_c: '', 
        option_d: '', 
        correct_answer: '' 
      }));
      fetchMetadata();
    }
  };

  // Bulk JSON Bulk Insert Handler (Multi-chapter supported via individual JSON objects containing chapter_name)
  const handleJsonBulkInsert = async () => {
    if (!jsonInput.trim()) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya JSON data paste karein!' });
      return;
    }

    setBulkLoading(true);
    setBulkStatusMsg({ type: '', text: '' });

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON format! Kripya syntax check karein.');
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('JSON data ek valid Array [...] hona chahiye.');
      }

      const formattedQuestions = parsedData.map((q) => ({
        subject_name: bulkSubject || 'General',
        class_name: bulkClass,
        book_name: bulkBook || 'Main Book',
        chapter_name: q.chapter_name || 'Chapter 1',
        question_type: q.question_type || 'MCQ',
        question_text: q.question_text || q.question || 'Untitled Question',
        option_a: q.option_a || null,
        option_b: q.option_b || null,
        option_c: q.option_c || null,
        option_d: q.option_d || null,
        correct_answer: q.correct_answer || null,
        answer_text: q.answer_text || null,
        marks: q.marks || q.max_marks || 1,
        medium: bulkMedium,
        is_global: false,
        status: 'pending',
        school_name: 'BLUE HEAVEN KIDS ACADEMY'
      }));

      const { error } = await supabase.from('question_bank').insert(formattedQuestions);
      if (error) throw error;

      setBulkStatusMsg({ type: 'success', text: `✅ Shandaar! Total ${formattedQuestions.length} questions successfully add ho gaye!` });
      setJsonInput('');
      fetchMetadata();
    } catch (error) {
      setBulkStatusMsg({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk CSV File Uploader Handler with Dynamic Multi-Chapter Header Mapping
  const handleCsvFileUpload = async () => {
    if (!selectedFile) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya pehle CSV file select karein!' });
      return;
    }

    setBulkLoading(true);
    setBulkStatusMsg({ type: '', text: '' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          throw new Error('CSV file khali hai ya sahi format mein nahi hai.');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const getColIdx = (names) => {
          for (let name of names) {
            const idx = headers.indexOf(name);
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const chapIdx = getColIdx(['chapter_name', 'chapter', 'chap']);
        const typeIdx = getColIdx(['question_type', 'type']);
        const textIdx = getColIdx(['question_text', 'question', 'q_text']);
        const optAIdx = getColIdx(['option_a', 'a']);
        const optBIdx = getColIdx(['option_b', 'b']);
        const optCIdx = getColIdx(['option_c', 'c']);
        const optDIdx = getColIdx(['option_d', 'd']);
        const ansIdx = getColIdx(['correct_answer', 'answer', 'ans']);
        const marksIdx = getColIdx(['marks', 'mark']);

        const formattedQuestions = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(val => val.trim());
          if (row.length >= 2) {
            formattedQuestions.push({
              subject_name: bulkSubject || 'General',
              class_name: bulkClass,
              book_name: bulkBook,
              chapter_name: chapIdx !== -1 && row[chapIdx] ? row[chapIdx] : 'Chapter 1',
              question_type: typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'MCQ',
              question_text: textIdx !== -1 && row[textIdx] ? row[textIdx] : (row[1] || 'Question'),
              option_a: optAIdx !== -1 ? row[optAIdx] : (row[2] || null),
              option_b: optBIdx !== -1 ? row[optBIdx] : (row[3] || null),
              option_c: optCIdx !== -1 ? row[optCIdx] : (row[4] || null),
              option_d: optDIdx !== -1 ? row[optDIdx] : (row[5] || null),
              correct_answer: ansIdx !== -1 ? row[ansIdx] : (row[6] || null),
              marks: marksIdx !== -1 && parseInt(row[marksIdx]) ? parseInt(row[marksIdx]) : 1,
              medium: bulkMedium,
              is_global: false,
              status: 'pending',
              school_name: 'BLUE HEAVEN KIDS ACADEMY'
            });
          }
        }

        const { error } = await supabase.from('question_bank').insert(formattedQuestions);
        if (error) throw error;

        setBulkStatusMsg({ type: 'success', text: `✅ File Upload Successful! Total ${formattedQuestions.length} questions added across chapters.` });
        setSelectedFile(null);
        fetchMetadata();
      } catch (err) {
        setBulkStatusMsg({ type: 'error', text: `CSV Parse Error: ${err.message}` });
      } finally {
        setBulkLoading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  const fetchPendingQuestions = async () => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending questions:', error.message);
    } else {
      setPendingQuestions(data || []);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-approvals') {
      fetchPendingQuestions();
    }
  }, [activeTab]);

  const handleGenerateManualPaper = () => {
    if (selectedManualQuestions.length === 0) {
      alert('Kripya kam se kam ek question select karein!');
      return;
    }

    const selectedList = loadedQuestions.filter(q => selectedManualQuestions.includes(q.id));

    const mcqs = selectedList.filter(q => q.question_type === 'MCQ');
    const blanks = selectedList.filter(q => q.question_type === 'Blank Space');
    const matchings = selectedList.filter(q => q.question_type === 'Matchings');
    const tfs = selectedList.filter(q => q.question_type === 'True/False');
    const vShorts = selectedList.filter(q => q.question_type === 'Very Short');
    const shorts = selectedList.filter(q => q.question_type === 'Short');
    const longs = selectedList.filter(q => q.question_type === 'Long');

    setGeneratedPaper({
      mcqs,
      blanks,
      matchings,
      tfs,
      vShorts,
      shorts,
      longs,
      config: {
        schoolName: formData.schoolName,
        showSchoolName: formData.showSchoolName,
        examName: formData.examName,
        session: formData.session,
        timeAllowed: formData.timeAllowed,
        selectedClass: manualData.selectedClass,
        subject: manualData.subject_name,
        selectedBooks: [manualData.selectedBook],
        medium: manualData.medium,
        mcqMarks: manualConfig.mcqMarks,
        blankMarks: manualConfig.blankMarks,
        matchingMarks: manualConfig.matchingMarks,
        tfMarks: manualConfig.tfMarks,
        vShortMarks: manualConfig.vShortMarks,
        shortMarks: manualConfig.shortMarks,
        longMarks: manualConfig.longMarks
      }
    });
    setPaperPrintMode('student');
  };

  const handleGeneratePaper = async () => {
    setIsGenerating(true);
    
    let query = supabase
      .from('question_bank')
      .select('*')
      .eq('class_name', formData.selectedClass)
      .eq('subject_name', formData.subject);

    if (formData.selectedBooks.length > 0) {
      query = query.in('book_name', formData.selectedBooks);
    }

    if (formData.selectedChapters.length > 0) {
      query = query.in('chapter_name', formData.selectedChapters);
    }

    if (formData.medium !== 'Both') {
      query = query.eq('medium', formData.medium);
    }

    if (formData.sourceType === 'Global Question Bank') {
      query = query.eq('status', 'approved');
    } else if (formData.sourceType === 'School Custom Questions') {
      query = query.eq('is_global', false).in('status', ['approved', 'pending']);
    } else {
      query = query.in('status', ['approved', 'pending']);
    }

    const { data, error } = await query;

    if (error) {
      alert('Error fetching questions: ' + error.message);
      setIsGenerating(false);
      return;
    }

    if (!data || data.length === 0) {
      alert(`Is Class (${formData.selectedClass}), Subject (${formData.subject}) ke anusaar database me koi question nahi mila!`);
      setIsGenerating(false);
      return;
    }

    const mcqs = data.filter(q => q.question_type === 'MCQ').slice(0, parseInt(formData.mcqQty) || 0);
    const blanks = data.filter(q => q.question_type === 'Blank Space').slice(0, parseInt(formData.blankQty) || 0);
    const matchings = data.filter(q => q.question_type === 'Matchings').slice(0, parseInt(formData.matchingQty) || 0);
    const tfs = data.filter(q => q.question_type === 'True/False').slice(0, parseInt(formData.tfQty) || 0);
    const vShorts = data.filter(q => q.question_type === 'Very Short').slice(0, parseInt(formData.vShortQty) || 0);
    const shorts = data.filter(q => q.question_type === 'Short').slice(0, parseInt(formData.shortQty) || 0);
    const longs = data.filter(q => q.question_type === 'Long').slice(0, parseInt(formData.longQty) || 0);

    setGeneratedPaper({
      mcqs,
      blanks,
      matchings,
      tfs,
      vShorts,
      shorts,
      longs,
      config: { ...formData }
    });
    setPaperPrintMode('student');
    setIsGenerating(false);
  };

  // Manual Picker Dropdown lists & filtered questions with sorted chapters
  const availableManualBooks = Array.from(new Set(loadedQuestions.map(q => q.book_name || 'Main Book')));
  const availableManualChapters = sortChapters(new Set(
    loadedQuestions
      .filter(q => (q.book_name || 'Main Book') === manualData.selectedBook)
      .map(q => q.chapter_name || 'General Chapter')
  ));

  const filteredManualQuestions = loadedQuestions.filter(q => {
    const book = q.book_name || 'Main Book';
    const chap = q.chapter_name || 'General Chapter';
    if (manualData.selectedBook && book !== manualData.selectedBook) return false;
    if (manualData.selectedChapter && chap !== manualData.selectedChapter) return false;
    if (manualData.selectedQuestionType !== 'All' && q.question_type !== manualData.selectedQuestionType) return false;
    return true;
  });
 
  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 font-sans print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-paper, #printable-paper * {
            visibility: visible !important;
          }
          #printable-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      ` }} />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        
        {/* Top Navigation Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 bg-white p-4 gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white shadow-sm shrink-0">
              <FileText size={16} />
            </div>
            <h2 className="text-lg font-bold text-[#1B3A6B]">
              Question Paper Generator & Bank
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => { setActiveTab('generate'); setGeneratedPaper(null); }} 
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-150 uppercase tracking-wider shadow-lg transform ${
                activeTab === 'generate' 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-b-6 border-red-800 ring-4 ring-orange-300 scale-105 active:border-b-0 active:translate-y-1.5 shadow-orange-500/50' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-200 active:border-b-0 active:translate-y-1'
              }`}
            >
              🔥 Generate Paper
            </button>
            
            <button 
              onClick={() => setActiveTab('suggest')} 
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-150 uppercase tracking-wider shadow-lg transform ${
                activeTab === 'suggest'
                  ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white border-b-6 border-indigo-900 ring-4 ring-blue-300 scale-105 active:border-b-0 active:translate-y-1.5 shadow-blue-500/50'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-200 active:border-b-0 active:translate-y-1'
              }`}
            >
              💡 Suggest / Add
            </button>

            <button 
              onClick={() => setActiveTab('bulk-import')} 
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-150 uppercase tracking-wider shadow-lg transform ${
                activeTab === 'bulk-import'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white border-b-6 border-teal-950 ring-4 ring-emerald-300 scale-105 active:border-b-0 active:translate-y-1.5 shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-200 active:border-b-0 active:translate-y-1'
              }`}
            >
              📁 Bulk Import
            </button>
            
            <button 
              onClick={() => setActiveTab('admin-approvals')} 
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-150 uppercase tracking-wider shadow-lg transform ${
                activeTab === 'admin-approvals'
                  ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-700 text-white border-b-6 border-teal-950 ring-4 ring-green-300 scale-105 active:border-b-0 active:translate-y-1.5 shadow-green-500/50'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-200 active:border-b-0 active:translate-y-1'
              }`}
            >
              ✅ admin aproval status
            </button>
            
            <button 
              onClick={() => setActiveTab('manual')} 
              className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-150 uppercase tracking-wider shadow-lg transform ${
                activeTab === 'manual' 
                  ? 'bg-gradient-to-r from-purple-500 via-fuchsia-600 to-pink-700 text-white border-b-6 border-purple-950 ring-4 ring-purple-300 scale-105 active:border-b-0 active:translate-y-1.5 shadow-purple-500/50' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-200 active:border-b-0 active:translate-y-1'
              }`}
            >
              🔍 Manual Picker
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 print:p-0">
          {generatedPaper ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center bg-[#F0F4F8] p-4 rounded-xl border border-gray-300 print:hidden gap-3">
                <button 
                  onClick={() => setGeneratedPaper(null)} 
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} /> Edit Parameters / Back
                </button>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => { setPaperPrintMode('student'); setTimeout(() => window.print(), 100); }} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg border-b-4 border-indigo-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                  >
                    <Printer size={18} /> Print question paper (student)
                  </button>

                  <button 
                    onClick={() => { setPaperPrintMode('teacher'); setTimeout(() => window.print(), 100); }} 
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg border-b-4 border-teal-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                  >
                    <Printer size={18} /> print answer key (Teachers)
                  </button>
                </div>
              </div>

              {/* Printable Paper Container */}
              <div id="printable-paper" className="bg-white border-2 border-gray-800 p-6 rounded-lg shadow-xl text-black max-w-4xl mx-auto space-y-4 print:border-none print:shadow-none print:p-0">
                
                <div className="text-center border-b-2 border-gray-800 pb-3 space-y-1">
                  {generatedPaper.config.showSchoolName && (
                    <h1 className="text-2xl font-black uppercase tracking-wide text-[#1B3A6B]">
                      {generatedPaper.config.schoolName}
                    </h1>
                  )}
                  <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800">
                    {generatedPaper.config.examName} {paperPrintMode === 'teacher' ? '- ANSWER KEY (TEACHERS COPY)' : ''} ({generatedPaper.config.session})
                  </h2>
                  
                  <div className="flex justify-between items-start text-sm font-bold pt-2 px-4 text-gray-700">
                    <span>Roll No.: ____________</span>
                    <div className="text-center">
                      <div>Subject: {generatedPaper.config.subject} {generatedPaper.config.selectedBooks && generatedPaper.config.selectedBooks.length > 0 ? `(${generatedPaper.config.selectedBooks.join(', ')})` : ''}</div>
                      <div className="text-xs font-semibold text-gray-700">Class: {generatedPaper.config.selectedClass}</div>
                    </div>
                    <span>Medium: {generatedPaper.config.medium}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold pt-1 px-4 text-gray-600">
                    <span>Time Allowed: {generatedPaper.config.timeAllowed}</span>
                    <span>Max Marks: {
                      fmtTotalMarks(
                        (generatedPaper.mcqs.length * Number(generatedPaper.config.mcqMarks)) + 
                        (generatedPaper.blanks.length * Number(generatedPaper.config.blankMarks)) + 
                        (generatedPaper.matchings.length * Number(generatedPaper.config.matchingMarks)) + 
                        (generatedPaper.tfs.length * Number(generatedPaper.config.tfMarks)) + 
                        (generatedPaper.vShorts.length * Number(generatedPaper.config.vShortMarks)) + 
                        (generatedPaper.shorts.length * Number(generatedPaper.config.shortMarks)) + 
                        (generatedPaper.longs.length * Number(generatedPaper.config.longMarks))
                      )
                    }</span>
                  </div>
                </div>

                <div className="text-xs border border-gray-400 p-2.5 rounded bg-gray-50 print:bg-white">
                  <p className="font-bold underline">General Instructions:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 text-gray-700">
                    <li>All questions are compulsory.</li>
                    <li>Read each question carefully before answering.</li>
                    <li>Marks for each question are indicated against it.</li>
                  </ul>
                </div>

                {/* SECTION A: MCQ */}
                {generatedPaper.mcqs.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Multiple Choice Questions ({generatedPaper.mcqs.length} × {fmtMarks(generatedPaper.config.mcqMarks)} = {fmtTotalMarks(generatedPaper.mcqs.length * Number(generatedPaper.config.mcqMarks))} Marks)
                    </div>
                    <div className="space-y-3 pl-2">
                      {generatedPaper.mcqs.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text} 
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.mcqMarks)} Mark]</span>
                          </p>
                          {q.option_a && (
                            <div className="grid grid-cols-2 gap-2 pl-6 text-xs text-gray-800 font-medium">
                              <div>(A) {q.option_a}</div>
                              <div>(B) {q.option_b}</div>
                              <div>(C) {q.option_c}</div>
                              <div>(D) {q.option_d}</div>
                            </div>
                          )}
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: Blank Space */}
                {generatedPaper.blanks.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Fill in the Blanks ({generatedPaper.blanks.length} × {fmtMarks(generatedPaper.config.blankMarks)} = {fmtTotalMarks(generatedPaper.blanks.length * Number(generatedPaper.config.blankMarks))} Marks)
                    </div>
                    <div className="space-y-2 pl-2">
                      {generatedPaper.blanks.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text} 
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.blankMarks)} Mark]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: Matchings */}
                {generatedPaper.matchings.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Match the Following ({generatedPaper.matchings.length} × {fmtMarks(generatedPaper.config.matchingMarks)} = {fmtTotalMarks(generatedPaper.matchings.length * Number(generatedPaper.config.matchingMarks))} Marks)
                    </div>
                    <div className="space-y-2 pl-2">
                      {generatedPaper.matchings.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text} 
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.matchingMarks)} Mark]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: True/False */}
                {generatedPaper.tfs.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: True / False ({generatedPaper.tfs.length} × {fmtMarks(generatedPaper.config.tfMarks)} = {fmtTotalMarks(generatedPaper.tfs.length * Number(generatedPaper.config.tfMarks))} Marks)
                    </div>
                    <div className="space-y-2 pl-2">
                      {generatedPaper.tfs.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text} 
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.tfMarks)} Mark]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: Very Short Answer */}
                {generatedPaper.vShorts.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Very Short Answer Questions ({generatedPaper.vShorts.length} × {fmtMarks(generatedPaper.config.vShortMarks)} = {fmtTotalMarks(generatedPaper.vShorts.length * Number(generatedPaper.config.vShortMarks))} Marks)
                    </div>
                    <div className="space-y-2 pl-2">
                      {generatedPaper.vShorts.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text}
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.vShortMarks)} Marks]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: Short Answer */}
                {generatedPaper.shorts.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Short Answer Questions ({generatedPaper.shorts.length} × {fmtMarks(generatedPaper.config.shortMarks)} = {fmtTotalMarks(generatedPaper.shorts.length * Number(generatedPaper.config.shortMarks))} Marks)
                    </div>
                    <div className="space-y-3 pl-2">
                      {generatedPaper.shorts.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text}
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.shortMarks)} Marks]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: Long Answer */}
                {generatedPaper.longs.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-gray-100 p-2 border-l-4 border-blue-800 font-bold text-sm uppercase text-blue-900 print:bg-white print:border-black">
                      Section: Long Answer Questions ({generatedPaper.longs.length} × {fmtMarks(generatedPaper.config.longMarks)} = {fmtTotalMarks(generatedPaper.longs.length * Number(generatedPaper.config.longMarks))} Marks)
                    </div>
                    <div className="space-y-4 pl-2">
                      {generatedPaper.longs.map((q, idx) => (
                        <div key={q.id} className="text-sm space-y-1.5">
                          <p className="font-medium text-gray-900">
                            <span className="font-bold mr-2">Q.{idx + 1}</span> {q.question_text}
                            <span className="float-right text-xs font-semibold text-gray-500">[{fmtMarks(generatedPaper.config.longMarks)} Marks]</span>
                          </p>
                          {paperPrintMode === 'teacher' && (
                            <div className="pl-6 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              Ans: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center pt-6 text-xs text-gray-500 font-semibold border-t border-gray-300">
                  *** All the Best ***
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'suggest' && (
                <form onSubmit={handleSuggestSubmit} className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-4">
                    <h3 className="text-sm font-bold text-[#1B3A6B] flex items-center gap-2 mb-1">
                      <PlusCircle size={18} className="text-[#00AEEF]" /> Add New Question to &apos;question_bank&apos;
                    </h3>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Class</label>
                        <select name="class_name" value={suggestData.class_name} onChange={(e) => handleClassChange(e, 'suggest')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {classList.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject Name (from class_subjects)</label>
                        <select name="subject_name" value={suggestData.subject_name} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Book Name</label>
                        <input type="text" name="book_name" value={suggestData.book_name} onChange={handleSuggestChange} placeholder="e.g. Main Book" className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Chapter Name</label>
                        <input type="text" name="chapter_name" value={suggestData.chapter_name} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Question Type</label>
                        <select name="question_type" value={suggestData.question_type} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {suggestQuestionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Medium</label>
                        <select name="medium" value={suggestData.medium} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-blue-700">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Question Text</label>
                      <textarea name="question_text" rows="3" value={suggestData.question_text} onChange={handleSuggestChange} placeholder="Enter question..." className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm"></textarea>
                    </div>

                    {suggestData.question_type === 'MCQ' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">Option (A)</label>
                          <input type="text" name="option_a" value={suggestData.option_a} onChange={handleSuggestChange} placeholder="Enter Option A" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">Option (B)</label>
                          <input type="text" name="option_b" value={suggestData.option_b} onChange={handleSuggestChange} placeholder="Enter Option B" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">Option (C)</label>
                          <input type="text" name="option_c" value={suggestData.option_c} onChange={handleSuggestChange} placeholder="Enter Option C" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">Option (D)</label>
                          <input type="text" name="option_d" value={suggestData.option_d} onChange={handleSuggestChange} placeholder="Enter Option D" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Correct Answer</label>
                        <input type="text" name="correct_answer" value={suggestData.correct_answer} onChange={handleSuggestChange} placeholder="Correct Answer" className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Marks</label>
                        <input type="number" name="marks" value={suggestData.marks} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:to-cyan-800 text-white font-extrabold px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 border-b-6 border-teal-950 active:border-b-0 active:translate-y-1.5 transition-all shadow-xl text-sm uppercase tracking-wider ring-2 ring-emerald-300 cursor-pointer">
                        <Send size={18} /> Send for Super Admin Approval
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* BULK IMPORT TAB WITH SUB-TABS (Class, Subject, Book, Medium selected once globally) */}
              {activeTab === 'bulk-import' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 font-sans">
                    
                    {/* Header & Sub-Tab Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800">Advanced Multi-Chapter Question Bank Importer</h2>
                        <p className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
                          Class, Subject, Book aur Medium ek baar select karein aur sabhi chapters ke questions ek sath upload karein.
                        </p>
                      </div>

                      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 w-full md:w-auto">
                        <button
                          onClick={() => setBulkSubTab('excel')}
                          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            bulkSubTab === 'excel' 
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileSpreadsheet size={16} /> Excel / CSV
                        </button>

                        <button
                          onClick={() => setBulkSubTab('json')}
                          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            bulkSubTab === 'json' 
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Code2 size={16} /> JSON Text Paste
                        </button>
                      </div>
                    </div>

                    {/* Status Alert Banner */}
                    {bulkStatusMsg.text && (
                      <div className={`p-4 rounded-2xl mb-6 font-bold text-sm flex items-center gap-3 shadow-sm ${
                        bulkStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200' : 'bg-rose-50 text-rose-800 border-2 border-rose-200'
                      }`}>
                        {bulkStatusMsg.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
                        <span>{bulkStatusMsg.text}</span>
                      </div>
                    )}

                    {/* Global Selectors for Class, Subject, Book & Medium */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Target Class</label>
                        <select value={bulkClass} onChange={(e) => handleClassChange(e, 'bulk')} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 cursor-pointer">
                          {classList.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Subject Name</label>
                        <select value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 cursor-pointer">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Book Name</label>
                        <input type="text" value={bulkBook} onChange={(e) => setBulkBook(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 shadow-inner" placeholder="Main Book" />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Medium</label>
                        <select value={bulkMedium} onChange={(e) => setBulkMedium(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 cursor-pointer">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* SUB-TAB 1: EXCEL / CSV UPLOAD SECTION */}
                    {bulkSubTab === 'excel' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-center mb-3">
                            <div className="bg-indigo-100 text-indigo-700 p-4 rounded-full">
                              <Upload size={32} />
                            </div>
                          </div>
                          <h3 className="text-base font-black text-slate-800">Upload Multi-Chapter CSV File</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1 mb-4">CSV Format (Dynamic Headers Supported): [chapter_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, marks]</p>
                          
                          <input 
                            type="file" 
                            accept=".csv" 
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="block w-full max-w-xs mx-auto text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button 
                            onClick={handleCsvFileUpload}
                            disabled={bulkLoading}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white font-black px-8 py-3.5 rounded-2xl text-sm uppercase tracking-wider border-t border-emerald-300 border-b-[4px] border-emerald-950 shadow-lg active:translate-y-1 active:border-b-[1px] transition-all cursor-pointer disabled:opacity-50 w-full md:w-auto"
                          >
                            {bulkLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Upload CSV File
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: JSON TEXT PASTE SECTION (Multi-Chapter) */}
                    {bulkSubTab === 'json' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                              Paste JSON Array Format [...] (Include <code className="text-indigo-600 font-bold">&quot;chapter_name&quot;</code> inside each object for multi-chapter support)
                            </label>
                            <span className="text-[11px] font-bold text-indigo-600">All Chapters & Question Types Supported</span>
                          </div>

                          <textarea
                            rows={10}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder={`[\n  {\n    "chapter_name": "Chapter 1: The Rise of Nationalism",\n    "question_type": "MCQ",\n    "question_text": "Bharat ki rajdhani kya hai?",\n    "option_a": "Mumbai",\n    "option_b": "New Delhi",\n    "correct_answer": "New Delhi",\n    "marks": 1\n  },\n  {\n    "chapter_name": "Chapter 2: Nationalism in India",\n    "question_type": "Blank Space",\n    "question_text": "Mahatma Gandhi ne dandi yatra kab shuru ki?",\n    "correct_answer": "1930",\n    "marks": 1\n  }\n]`}
                            className="w-full bg-[#F4F7F9] font-mono text-xs md:text-sm border-2 border-slate-200 rounded-2xl p-4 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white shadow-inner transition-all duration-200"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={handleJsonBulkInsert}
                            disabled={bulkLoading}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-400 hover:to-teal-600 text-white font-black px-8 py-3.5 rounded-2xl text-sm uppercase tracking-wider border-t border-emerald-300 border-b-[4px] border-emerald-950 shadow-lg active:translate-y-1 active:border-b-[1px] transition-all cursor-pointer disabled:opacity-50 w-full md:w-auto"
                          >
                            {bulkLoading ? (
                              <>
                                <Loader2 className="animate-spin" size={18} /> Saving...
                              </>
                            ) : (
                              <>
                                <Send size={18} className="stroke-[3]" /> Upload All Questions
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {activeTab === 'admin-approvals' && (
                <div className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-4 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#10B981] flex items-center gap-2">
                      <Clock size={18} /> Questions Pending for Super Admin Approval
                    </h3>
                    <button onClick={fetchPendingQuestions} className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 shadow-md transition-all cursor-pointer">Refresh</button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                          <th className="p-3.5">Class / Subject / Book / Medium</th>
                          <th className="p-3.5">Chapter</th>
                          <th className="p-3.5">Question & Options</th>
                          <th className="p-3.5">Correct Answer</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingQuestions.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-12 text-center text-gray-400 font-medium text-sm">
                              No questions pending for approval.
                            </td>
                          </tr>
                        ) : (
                          pendingQuestions.map((q) => (
                            <tr key={q.id} className="border-b border-gray-100 text-sm">
                              <td className="p-3.5 font-bold text-gray-800">
                                {q.class_name} <br/>
                                <span className="text-xs text-gray-500">{q.subject_name} ({q.book_name || 'Main Book'})</span><br/>
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">{q.medium || 'English'}</span>
                              </td>
                              <td className="p-3.5 text-gray-600">{q.chapter_name}</td>
                              <td className="p-3.5 text-gray-800">
                                <p className="font-semibold">{q.question_text} <span className="text-xs text-indigo-600 font-bold">[{q.question_type}]</span></p>
                                {q.option_a && (
                                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                                    <div>(A) {q.option_a}</div>
                                    <div>(B) {q.option_b}</div>
                                    <div>(C) {q.option_c}</div>
                                    <div>(D) {q.option_d}</div>
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5 text-green-600 font-semibold">{q.correct_answer}</td>
                              <td className="p-3.5">
                                <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                  <Clock size={12} /> Pending Approval
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'manual' && (
                <div className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5">
                    <h3 className="text-sm font-bold text-[#1B3A6B] flex items-center gap-2">
                      <Search size={18} className="text-[#2F6690]" /> Manual Question Picker (Dropdown Wise & Quantity/Marks Setup)
                    </h3>
                  </div>

                  {/* Live Selected Questions & Marks Counter Badge */}
                  <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 border border-purple-500/30">
                    <div className="flex items-center gap-3 font-extrabold text-sm uppercase tracking-wide">
                      <CheckSquare size={20} className="text-yellow-400" />
                      <div>
                        <div>Selected Questions: <span className="text-yellow-300 text-lg">{selectedManualQuestions.length}</span></div>
                        <div className="text-xs text-cyan-200 mt-0.5">
                          Total Marks Selected: <span className="text-yellow-300 font-bold">{totalSelectedMarks}</span> / <span className="text-white font-bold">{totalManualMaxMarks} Marks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">MCQ: {countMCQ}/{manualConfig.mcqQty} ({countMCQ * manualConfig.mcqMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Blank: {countBlank}/{manualConfig.blankQty} ({countBlank * manualConfig.blankMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Matching: {countMatching}/{manualConfig.matchingQty} ({countMatching * manualConfig.matchingMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">T/F: {countTF}/{manualConfig.tfQty} ({countTF * manualConfig.tfMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">V.Short: {countVShort}/{manualConfig.vShortQty} ({countVShort * manualConfig.vShortMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Short: {countShort}/{manualConfig.shortQty} ({countShort * manualConfig.shortMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Long: {countLong}/{manualConfig.longQty} ({countLong * manualConfig.longMarks}m)</span>
                    </div>
                  </div>

                  {/* Manual Quantity & Marks Configuration Section */}
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5 space-y-4">
                    <h3 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">
                      Manual Section-wise Question Quantity & Marks Setup (Total Paper Max Marks: <span className="text-emerald-700 font-black">{totalManualMaxMarks}</span>)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">MCQ Qty Limit</label>
                        <input type="number" name="mcqQty" value={manualConfig.mcqQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">MCQ Marks (Each)</label>
                        <input type="number" name="mcqMarks" value={manualConfig.mcqMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Blank Space Qty Limit</label>
                        <input type="number" name="blankQty" value={manualConfig.blankQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Blank Marks (Each)</label>
                        <input type="number" name="blankMarks" value={manualConfig.blankMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Matchings Qty Limit</label>
                        <input type="number" name="matchingQty" value={manualConfig.matchingQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Matching Marks (Each)</label>
                        <input type="number" name="matchingMarks" value={manualConfig.matchingMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">True/False Qty Limit</label>
                        <input type="number" name="tfQty" value={manualConfig.tfQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">True/False Marks (Each)</label>
                        <input type="number" name="tfMarks" value={manualConfig.tfMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Very Short Qty Limit</label>
                        <input type="number" name="vShortQty" value={manualConfig.vShortQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">V. Short Marks (Each)</label>
                        <input type="number" name="vShortMarks" value={manualConfig.vShortMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Short Answer Qty Limit</label>
                        <input type="number" name="shortQty" value={manualConfig.shortQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Short Marks (Each)</label>
                        <input type="number" name="shortMarks" value={manualConfig.shortMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Long Answer Qty Limit</label>
                        <input type="number" name="longQty" value={manualConfig.longQty} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Long Marks (Each)</label>
                        <input type="number" name="longMarks" value={manualConfig.longMarks} onChange={handleManualConfigChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Select Class</label>
                        <select name="selectedClass" value={manualData.selectedClass} onChange={(e) => handleClassChange(e, 'manual')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {classList.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject Name (from class_subjects)</label>
                        <select name="subject_name" value={manualData.subject_name} onChange={handleManualChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Medium</label>
                        <select name="medium" value={manualData.medium} onChange={handleManualChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-blue-700">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">📚 Select Book</label>
                        <select name="selectedBook" value={manualData.selectedBook} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          {availableManualBooks.length === 0 ? <option value="">No Books Available</option> : null}
                          {availableManualBooks.map((book) => <option key={book} value={book}>{book}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">📖 Select Chapter</label>
                        <select name="selectedChapter" value={manualData.selectedChapter} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          {availableManualChapters.length === 0 ? <option value="">No Chapters Available</option> : null}
                          {availableManualChapters.map((chap) => <option key={chap} value={chap}>{chap}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">⚡ Question Type</label>
                        <select name="selectedQuestionType" value={manualData.selectedQuestionType} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          {questionTypeList.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">🔍 Source Type</label>
                        <select name="sourceType" value={manualData.sourceType} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          <option value="Global Question Bank">Global Question Bank</option>
                          <option value="School Custom Questions">School Custom Questions</option>
                          <option value="Both (दोनों)">Both (दोनों)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
                    <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center justify-between">
                      <span>Questions for Book: <span className="text-blue-600">{manualData.selectedBook || 'N/A'}</span> &gt; Chapter: <span className="text-blue-600">{manualData.selectedChapter || 'N/A'}</span></span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Showing {filteredManualQuestions.length} Questions</span>
                    </h4>

                    {filteredManualQuestions.length === 0 ? (
                      <div className="text-center text-gray-400 py-10 text-sm font-medium">
                        Is book, chapter ya question type ke anusaار koi question nahi mila. Upar dropdown se dusri book/chapter select karein!
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
                              <th className="p-3.5 w-16 text-center">Select</th>
                              <th className="p-3.5 w-32">Type</th>
                              <th className="p-3.5">Question Text</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredManualQuestions.map((q) => (
                              <tr key={q.id} className="border-b border-gray-100 text-sm hover:bg-gray-50/50">
                                <td className="p-3.5 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedManualQuestions.includes(q.id)}
                                    onChange={() => toggleManualQuestionSelection(q)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3.5">
                                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
                                    {q.question_type}
                                  </span>
                                </td>
                                <td className="p-3.5 text-gray-900 space-y-1.5">
                                  <p className="font-medium">{q.question_text}</p>
                                  {q.option_a && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200">
                                      <div>(A) {q.option_a}</div>
                                      <div>(B) {q.option_b}</div>
                                      <div>(C) {q.option_c}</div>
                                      <div>(D) {q.option_d}</div>
                                    </div>
                                  )}
                                  <div className="text-xs text-green-600 font-bold pt-1">
                                    Correct Answer: {q.correct_answer}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="pt-4 sticky bottom-4 z-10">
                      <button 
                        onClick={handleGenerateManualPaper}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:to-cyan-800 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 border-b-8 border-teal-950 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-2xl text-base ring-4 ring-emerald-300 cursor-pointer"
                      >
                        <CheckSquare size={22} className="text-yellow-300" /> 
                        Generate paper with selected questions ({selectedManualQuestions.length} Selected | Total Marks: {totalSelectedMarks})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'generate' && (
                <div className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700">School Name</label>
                          <label className="flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer">
                            <input type="checkbox" name="showSchoolName" checked={formData.showSchoolName} onChange={handleChange} className="rounded text-blue-600 focus:ring-0" /> 
                            Show on Paper?
                          </label>
                        </div>
                        <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Exam Name</label>
                        <input type="text" name="examName" value={formData.examName} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Academic Session</label>
                        <input type="text" name="session" value={formData.session} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Time Allowed</label>
                        <input type="text" name="timeAllowed" value={formData.timeAllowed} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Select Class</label>
                        <select name="selectedClass" value={formData.selectedClass} onChange={(e) => handleClassChange(e, 'generator')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          {classList.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject (from class_subjects)</label>
                        <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Medium</label>
                        <select name="medium" value={formData.medium} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-blue-700">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase">Select Book(s):</label>
                      <div className="flex flex-wrap gap-3">
                        {getBooksForClassSubject(formData.selectedClass, formData.subject).map(book => (
                          <label key={book} className="flex items-center gap-2 text-xs font-semibold bg-white px-3 py-1.5 rounded border border-gray-300 cursor-pointer shadow-sm">
                            <input 
                              type="checkbox" 
                              checked={formData.selectedBooks.includes(book)}
                              onChange={() => toggleBookSelection(book, false)}
                              className="rounded text-blue-600 focus:ring-0" 
                            />
                            {book}
                          </label>
                        ))}
                      </div>
                    </div>

                    {formData.selectedBooks.length > 0 && (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-gray-200">
                        <label className="block text-xs font-bold text-gray-700 uppercase">Select Chapter(s): (Sequenced)</label>
                        <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-1">
                          {getChaptersForSelection(formData.selectedClass, formData.subject, formData.selectedBooks).map(chap => (
                            <label key={chap} className="flex items-center gap-2 text-xs font-semibold bg-white px-3 py-1.5 rounded border border-gray-300 cursor-pointer shadow-sm">
                              <input 
                                type="checkbox" 
                                checked={formData.selectedChapters.includes(chap)}
                                onChange={() => toggleChapterSelection(chap, false)}
                                className="rounded text-blue-600 focus:ring-0" 
                              />
                              {chap}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">Source Type</label>
                      <select name="sourceType" value={formData.sourceType} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                        <option value="Global Question Bank">Global Question Bank</option>
                        <option value="School Custom Questions">School Custom Questions</option>
                        <option value="Both">Both (दोनों)</option>
                      </select>
                    </div>
                  </div>

                  {/* All Question Types Quantity & Marks Setup Options */}
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">
                        Section-wise Question Quantity & Marks Setup (All Types)
                      </h3>
                      <div className="bg-blue-900 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold shadow">
                        Total Paper Max Marks: <span className="text-yellow-300 text-sm">{totalGenerateMaxMarks}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">MCQ Qty</label>
                        <input type="number" name="mcqQty" value={formData.mcqQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">MCQ Marks (Each)</label>
                        <input type="number" name="mcqMarks" value={formData.mcqMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Blank Space Qty</label>
                        <input type="number" name="blankQty" value={formData.blankQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Blank Marks (Each)</label>
                        <input type="number" name="blankMarks" value={formData.blankMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Matchings Qty</label>
                        <input type="number" name="matchingQty" value={formData.matchingQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Matching Marks (Each)</label>
                        <input type="number" name="matchingMarks" value={formData.matchingMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">True/False Qty</label>
                        <input type="number" name="tfQty" value={formData.tfQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">True/False Marks (Each)</label>
                        <input type="number" name="tfMarks" value={formData.tfMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Very Short Qty</label>
                        <input type="number" name="vShortQty" value={formData.vShortQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">V. Short Marks (Each)</label>
                        <input type="number" name="vShortMarks" value={formData.vShortMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Short Answer Qty</label>
                        <input type="number" name="shortQty" value={formData.shortQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Short Marks (Each)</label>
                        <input type="number" name="shortMarks" value={formData.shortMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Long Answer Qty</label>
                        <input type="number" name="longQty" value={formData.longQty} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Long Marks (Each)</label>
                        <input type="number" name="longMarks" value={formData.longMarks} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGeneratePaper}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 border-b-8 border-indigo-950 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-2xl text-base ring-2 ring-blue-300 cursor-pointer disabled:opacity-50"
                  >
                    <Zap size={22} className="text-[#FFC107] animate-pulse" fill="currentColor" /> 
                    {isGenerating ? 'Fetching Questions from Database...' : `Generate Detailed Test Paper (Max Marks: ${totalGenerateMaxMarks})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}