// Filename: TeacherDashboard.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, FileText, Zap, PlusCircle, Send, Clock, Search, Layers, Printer, ArrowLeft, CheckSquare, FileSpreadsheet, Code2, Upload, CheckCircle2, AlertCircle, Loader2, Database, RefreshCw, Image as ImageIcon } from 'lucide-react';

export default function QuestionPaperGenerator() {
  const [activeTab, setActiveTab] = useState('generate');
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [selectedManualQuestions, setSelectedManualQuestions] = useState([]);

  // Database se fetched full questions cache
  const [allBankQuestions, setAllBankQuestions] = useState([]);

  // Class-wise subjects from class_subjects table
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Generated Paper State
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperPrintMode, setPaperPrintMode] = useState('student'); // 'student' or 'teacher'

  // Generate Paper Form State
  const [formData, setFormData] = useState({
    schoolName: 'BLUE HEAVEN KIDS ACADEMY',
    showSchoolName: true,
    examName: 'Half Yearly Examination (अर्द्धवार्षिक परीक्षा)',
    session: '2026-2027',
    timeAllowed: '3 Hours (घंटे)',
    selectedClass: '',
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
    whoSaidQty: 2,
    whoSaidMarks: 1,
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
    whoSaidQty: 2,
    whoSaidMarks: 1,
    vShortQty: 3,
    vShortMarks: 1,
    shortQty: 4,
    shortMarks: 2,
    longQty: 2,
    longMarks: 4,
  });

  // Suggest / Add Question Form State (With Separate English & Hindi Book, Chapter, Question Types & Auto-Sync for Hindi/Sanskrit)
  const [suggestData, setSuggestData] = useState({
    class_name: '',
    subject_name: '',
    
    // Dual Medium Auto-Sync (Great for Hindi & Sanskrit where chapters, books and questions match)
    auto_sync: true, 

    // English Book & Chapter
    book_name_en: 'Main Book',
    custom_book_en: '',
    is_custom_book_en: false,
    chapter_prefix_en: 'Chapter',
    chapter_num: '1',
    chapter_name_en: '',
    custom_chapter_en: '',
    is_custom_chapter_en: false,

    // Hindi Book & Chapter
    book_name_hi: 'मुख्य पुस्तक',
    custom_book_hi: '',
    is_custom_book_hi: false,
    chapter_prefix_hi: 'अध्याय',
    chapter_num_hi: '1',
    chapter_name_hi: '',
    custom_chapter_hi: '',
    is_custom_chapter_hi: false,
    
    // English Side Configuration
    question_type_en: 'MCQ',
    custom_question_type_en: '',
    is_custom_q_type_en: false,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',

    // Hindi Side Configuration
    question_type_hi: 'बहुविकल्पात्मक प्रश्न',
    custom_question_type_hi: '',
    is_custom_q_type_hi: false,
    question_text_hi: '',
    option_a_hi: '',
    option_b_hi: '',
    option_c_hi: '',
    option_d_hi: '',
    correct_answer_hi: '',

    image_url: '',
    marks: 1,
    school_name: 'BLUE HEAVEN KIDS ACADEMY'
  });

  // Manual Picker Form State
  const [manualData, setManualData] = useState({
    selectedClass: '',
    subject_name: '',
    selectedBook: '',
    selectedChapter: '',
    selectedQuestionType: 'All',
    medium: 'English',
    sourceType: 'Global Question Bank',
  });

  // Bulk Import States
  const [bulkSubTab, setBulkSubTab] = useState('excel');
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBook, setBulkBook] = useState('Main Book');
  const [customBulkBook, setCustomBulkBook] = useState('');
  const [isCustomBulkBook, setIsCustomBulkBook] = useState(false);
  const [bulkMedium, setBulkMedium] = useState('English');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStatusMsg, setBulkStatusMsg] = useState({ type: '', text: '' });

  // Class List
  const classList = [
    'All Classes', 'PP.3+', 'PP.4+', 'PP.5+', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
    'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh (Arts)', 'Eleventh (Commerce)', 
    'Eleventh (Science)', 'Twelfth (Arts)', 'Twelfth (Commerce)', 'Twelfth (Science)'
  ];

  const getClassLabelByMedium = (cls, medium) => {
    const mapEnglish = {
      'All Classes': 'All Classes',
      'PP.3+': 'PP.3+',
      'PP.4+': 'PP.4+',
      'PP.5+': 'PP.5+',
      'First': '1 (First)',
      'Second': '2 (Second)',
      'Third': '3 (Third)',
      'Fourth': '4 (Fourth)',
      'Fifth': '5 (Fifth)',
      'Sixth': 'Sixth',
      'Seventh': 'Seventh',
      'Eighth': 'Eighth',
      'Ninth': 'Ninth',
      'Tenth': 'Tenth',
      'Eleventh (Arts)': '11 Arts',
      'Eleventh (Commerce)': '11 Commerce',
      'Eleventh (Science)': '11 Science',
      'Twelfth (Arts)': '12 Arts',
      'Twelfth (Commerce)': '12 Commerce',
      'Twelfth (Science)': '12 Science'
    };

    const mapHindi = {
      'All Classes': 'सभी कक्षाएं',
      'PP.3+': 'पूर्व प्राथमिक-3',
      'PP.4+': 'पूर्व प्राथमिक-4',
      'PP.5+': 'पूर्व प्राथमिक-5',
      'First': '1',
      'Second': '2',
      'Third': '3',
      'Fourth': '4',
      'Fifth': '5',
      'Sixth': '6',
      'Seventh': '7',
      'Eighth': '8',
      'Ninth': '9',
      'Tenth': '10',
      'Eleventh (Arts)': '11 (कला)',
      'Eleventh (Commerce)': '11 (वाणिज्य)',
      'Eleventh (Science)': '11 (विज्ञान)',
      'Twelfth (Arts)': '12 (कला)',
      'Twelfth (Commerce)': '12 (वाणिज्य)',
      'Twelfth (Science)': '12 (विज्ञान)'
    };

    if (medium === 'Hindi' || medium === 'हिंदी' || medium === 'संस्कृत') {
      return mapHindi[cls] || cls;
    } else if (medium === 'English') {
      return mapEnglish[cls] || cls;
    } else {
      return `${mapEnglish[cls] || cls} / ${mapHindi[cls] || cls}`;
    }
  };

  const getSubjectLabelByMedium = (subject, medium) => {
    if (!subject) return '';
    if (medium === 'Hindi' || medium === 'हिंदी' || medium === 'संस्कृत') {
      const hindiMap = {
        'Mathematics': 'गणित',
        'Maths': 'गणित',
        'Science': 'विज्ञान',
        'Social Science': 'सामाजिक विज्ञान',
        'Sanskrit': 'संस्कृतम्',
        'Hindi': 'हिन्दी',
        'English': 'अंग्रेज़ी',
        'Computer': 'कम्प्यूटर',
        'Drawing': 'चित्रकला',
        'GK': 'सामान्य ज्ञान',
        'Moral Science': 'नैतिक शिक्षा',
        'History': 'इतिहास',
        'Civics': 'नागरिक शास्त्र',
        'Geography': 'भूगोल',
        'Physics': 'भौतिक विज्ञान',
        'Chemistry': 'रसायन विज्ञान',
        'Biology': 'जीव विज्ञान',
        'Economics': 'अर्थशास्त्र',
        'Accountancy': 'लेखाशास्त्र',
        'Business Studies': 'व्याव्यवसायिक अध्ययन'
      };
      return hindiMap[subject] || subject;
    }
    return subject;
  };

  const mediumList = ['English', 'Hindi', 'Both'];

  // Smart Flexible Question Type Matching Helper
  const isMatchType = (qType, targetKey) => {
    if (!qType) return false;
    const qt = qType.trim().toLowerCase();
    
    switch (targetKey) {
      case 'MCQ':
        return qt.includes('mcq') || qt.includes('objective') || qt.includes('multiple choice') || qt.includes('tick') || qt.includes('सही विकल्प') || qt.includes('वस्तुनिष्ठ') || qt.includes('बहुविकल्प') || qt.includes('बहु विकल्पात्मक');
      case 'Blank Space':
        return qt.includes('blank') || qt.includes('fill in') || qt.includes('रिक्त स्थान');
      case 'Matchings':
        return qt.includes('match') || qt.includes('मिलान');
      case 'True/False':
        return qt.includes('true') || qt.includes('false') || qt.includes('सत्य') || qt.includes('असत्य');
      case 'Who Said To Whom':
        return qt.includes('who said') || qt.includes('किसने किससे कहा');
      case 'Very Short':
        return qt.includes('very short') || qt.includes('अतिलघूत्तरात्मक');
      case 'Short':
        return (qt.includes('short') && !qt.includes('very')) || qt.includes('लघूत्तरात्मक');
      case 'Long':
        return qt.includes('long') || qt.includes('essay') || qt.includes('दीर्घ') || qt.includes('निबन्धात्मक');
      default:
        return qt === targetKey.toLowerCase();
    }
  };

  const getSectionHeaderLabel = (qType, medium, index = 0) => {
    const khandLetters = ['अ', 'ब', 'स', 'द', 'य', 'र', 'ल', 'व'];
    const letter = khandLetters[index] || 'अ';
    const num = index + 1;

    if (medium === 'Hindi' || medium === 'हिंदी' || medium === 'संस्कृत') {
      return `${num}. खण्ड - ${letter} : ${qType}`;
    } else if (medium === 'English') {
      return `${num}. Section - ${String.fromCharCode(65 + index)}: ${qType}`;
    } else {
      return `${num}. Section / खण्ड: ${qType}`;
    }
  };

  const getOptionLetter = (idx, medium) => {
    const englishOpts = ['A', 'B', 'C', 'D', 'E', 'F'];
    const hindiOpts = ['अ', 'ब', 'स', 'द', 'य', 'र'];
    if (medium === 'Hindi' || medium === 'हिंदी' || medium === 'संस्कृत') {
      return hindiOpts[idx] || hindiOpts[0];
    }
    return englishOpts[idx] || englishOpts[0];
  };

  const getQuestionPrefix = (idx, medium) => {
    return (medium === 'Hindi' || medium === 'हिंदी' || medium === 'संस्कृत') ? `प्रश्न - ${idx + 1}` : `Q. ${idx + 1}`;
  };

  const normalizeChapterName = (name) => {
    if (!name) return "";
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u2010-\u2015]/g, '-')
      .toLowerCase();
  };

  const formatChapterTitle = (rawChapter, prefix = '', num = '') => {
    if (!rawChapter) return '';
    if (prefix && num) {
      return `${prefix} - ${num} ${rawChapter.trim()}`;
    }
    return rawChapter.trim();
  };

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

  const sortChapters = (chaptersArray) => {
    return Array.from(chaptersArray).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  const fetchClassSubjects = async (className, isManual = false, isSuggest = false, isBulk = false) => {
    if (!className) {
      setAvailableSubjects([]);
      if (isManual) {
        setManualData(prev => ({ ...prev, subject_name: '', selectedBook: '', selectedChapter: '', selectedQuestionType: 'All' }));
        setLoadedQuestions([]);
      } else if (isSuggest) {
        setSuggestData(prev => ({ ...prev, subject_name: '', book_name_en: 'Main Book', book_name_hi: 'मुख्य पुस्तक', chapter_name_en: '', chapter_name_hi: '' }));
      } else if (isBulk) {
        setBulkSubject('');
        setBulkBook('Main Book');
        setIsCustomBulkBook(false);
        setCustomBulkBook('');
      } else {
        setFormData(prev => ({ ...prev, subject: '', selectedBooks: [], selectedChapters: [] }));
      }
      return;
    }

    const { data, error } = await supabase
      .from('class_subjects')
      .select('subject_name')
      .eq('class_name', className);

    if (!error && data) {
      const subs = data.map(item => item.subject_name);
      setAvailableSubjects(subs);
      if (subs.length > 0) {
        if (isManual) {
          setManualData(prev => ({ ...prev, subject_name: subs[0], selectedBook: '', selectedChapter: '', selectedQuestionType: 'All' }));
          handleLoadAllManualQuestionsForSubject(className, subs[0], manualData.medium, manualData.sourceType);
        } else if (isSuggest) {
          setSuggestData(prev => ({ ...prev, subject_name: subs[0], book_name_en: 'Main Book', book_name_hi: 'मुख्य पुस्तक', chapter_name_en: '', chapter_name_hi: '' }));
        } else if (isBulk) {
          setBulkSubject(subs[0]);
          setBulkBook('Main Book');
          setIsCustomBulkBook(false);
          setCustomBulkBook('');
        } else {
          setFormData(prev => ({ ...prev, subject: subs[0], selectedBooks: [], selectedChapters: [] }));
        }
      } else {
        if (isManual) {
          setManualData(prev => ({ ...prev, subject_name: '', selectedBook: '', selectedChapter: '', selectedQuestionType: 'All' }));
          setLoadedQuestions([]);
        } else if (isSuggest) {
          setSuggestData(prev => ({ ...prev, subject_name: '', book_name_en: 'Main Book', book_name_hi: 'मुख्य पुस्तक', chapter_name_en: '', chapter_name_hi: '' }));
        } else if (isBulk) {
          setBulkSubject('');
          setBulkBook('Main Book');
          setIsCustomBulkBook(false);
          setCustomBulkBook('');
        } else {
          setFormData(prev => ({ ...prev, subject: '', selectedBooks: [], selectedChapters: [] }));
        }
      }
    }
  };

  const fetchBankQuestions = async () => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*');

    if (!error && data) {
      setAllBankQuestions(data);
    }
  };

  useEffect(() => {
    fetchBankQuestions();
  }, []);

  const handleClassChange = (e, target = 'generator') => {
    const cls = e.target.value;
    if (target === 'generator') {
      setFormData(prev => ({ ...prev, selectedClass: cls, subject: '', selectedBooks: [], selectedChapters: [] }));
      fetchClassSubjects(cls, false, false, false);
    } else if (target === 'manual') {
      setManualData(prev => ({ ...prev, selectedClass: cls, subject_name: '', selectedBook: '', selectedChapter: '', selectedQuestionType: 'All' }));
      fetchClassSubjects(cls, true, false, false);
    } else if (target === 'suggest') {
      setSuggestData(prev => ({ ...prev, class_name: cls, subject_name: '', book_name_en: 'Main Book', book_name_hi: 'मुख्य पुस्तक', chapter_name_en: '', chapter_name_hi: '' }));
      fetchClassSubjects(cls, false, true, false);
    } else if (target === 'bulk') {
      setBulkClass(cls);
      setBulkSubject('');
      setBulkBook('Main Book');
      setIsCustomBulkBook(false);
      setCustomBulkBook('');
      fetchClassSubjects(cls, false, false, true);
    }
  };

  const getBooksForClassSubject = (cls, sub) => {
    if (!cls || !sub) return ['Main Book'];
    const filtered = allBankQuestions.filter(q => 
      q.class_name && q.class_name.trim().toLowerCase() === cls.trim().toLowerCase() && 
      q.subject_name && q.subject_name.trim().toLowerCase() === sub.trim().toLowerCase()
    );
    const booksSet = new Set(filtered.map(q => q.book_name ? q.book_name.trim() : 'Main Book'));
    return booksSet.size > 0 ? Array.from(booksSet) : ['Main Book'];
  };

  const getChaptersForSelection = (cls, sub, books) => {
    if (!cls || !sub) return [];
    const booksList = Array.isArray(books) ? books.map(b => b.trim().toLowerCase()) : [books.trim().toLowerCase()];
    const filtered = allBankQuestions.filter(q => 
      q.class_name && q.class_name.trim().toLowerCase() === cls.trim().toLowerCase() && 
      q.subject_name && q.subject_name.trim().toLowerCase() === sub.trim().toLowerCase() &&
      booksList.includes((q.book_name ? q.book_name.trim() : 'Main Book').toLowerCase())
    );
    const chaptersSet = new Set();
    filtered.forEach(q => {
      if (q.chapter_name) chaptersSet.add(q.chapter_name.trim());
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
    const { name, value, type, checked } = e.target;
    setManualConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSuggestChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setSuggestData(prev => {
      let updated = { ...prev, [name]: val };

      if (updated.auto_sync) {
        if (name === 'book_name_en') updated.book_name_hi = value;
        else if (name === 'custom_book_en') updated.custom_book_hi = value;
        else if (name === 'chapter_prefix_en') updated.chapter_prefix_hi = value;
        else if (name === 'chapter_num') updated.chapter_num_hi = value;
        else if (name === 'chapter_name_en') updated.chapter_name_hi = value;
        else if (name === 'custom_chapter_en') updated.custom_chapter_hi = value;
        else if (name === 'question_text') updated.question_text_hi = value;
        else if (name === 'option_a') updated.option_a_hi = value;
        else if (name === 'option_b') updated.option_b_hi = value;
        else if (name === 'option_c') updated.option_c_hi = value;
        else if (name === 'option_d') updated.option_d_hi = value;
        else if (name === 'correct_answer') updated.correct_answer_hi = value;
      }

      if (name === 'book_name_en') {
        if (value === '__ADD_NEW_BOOK__') {
          updated.is_custom_book_en = true;
          updated.book_name_en = '';
          if (updated.auto_sync) updated.is_custom_book_hi = true;
        } else {
          updated.is_custom_book_en = false;
          if (updated.auto_sync) updated.is_custom_book_hi = false;
        }
      } else if (name === 'book_name_hi') {
        if (value === '__ADD_NEW_BOOK__') {
          updated.is_custom_book_hi = true;
          updated.book_name_hi = '';
        } else {
          updated.is_custom_book_hi = false;
        }
      } else if (name === 'chapter_name_en') {
        if (value === '__ADD_NEW_CHAPTER__') {
          updated.is_custom_chapter_en = true;
          updated.chapter_name_en = '';
          if (updated.auto_sync) updated.is_custom_chapter_hi = true;
        } else {
          updated.is_custom_chapter_en = false;
          if (updated.auto_sync) updated.is_custom_chapter_hi = false;
        }
      } else if (name === 'chapter_name_hi') {
        if (value === '__ADD_NEW_CHAPTER__') {
          updated.is_custom_chapter_hi = true;
          updated.chapter_name_hi = '';
        } else {
          updated.is_custom_chapter_hi = false;
        }
      } else if (name === 'question_type_en') {
        if (value === '__ADD_NEW_Q_TYPE_EN__') {
          updated.is_custom_q_type_en = true;
          updated.question_type_en = '';
        } else {
          updated.is_custom_q_type_en = false;
        }
      } else if (name === 'question_type_hi') {
        if (value === '__ADD_NEW_Q_TYPE_HI__') {
          updated.is_custom_q_type_hi = true;
          updated.question_type_hi = '';
        } else {
          updated.is_custom_q_type_hi = false;
        }
      }

      return updated;
    });
  };

  const handleBulkBookChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW_BOOK__') {
      setIsCustomBulkBook(true);
      setBulkBook('');
      setCustomBulkBook('');
    } else {
      setIsCustomBulkBook(false);
      setBulkBook(val);
    }
  };

  const handleManualChange = async (e) => {
    const { name, value } = e.target;
    const updatedManualData = { ...manualData, [name]: value };
    
    if (name === 'subject_name') {
      updatedManualData.selectedBook = '';
      updatedManualData.selectedChapter = '';
      updatedManualData.selectedQuestionType = 'All';
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
    if (!cls || !sub) {
      setLoadedQuestions([]);
      return;
    }

    let query = supabase
      .from('question_bank')
      .select('*')
      .ilike('class_name', cls.trim())
      .ilike('subject_name', sub.trim());

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
      const books = Array.from(new Set(data.map(q => q.book_name ? q.book_name.trim() : 'Main Book')));
      const firstBook = books.length > 0 ? books[0] : '';
      const chapters = sortChapters(new Set(data.filter(q => (q.book_name ? q.book_name.trim() : 'Main Book') === firstBook).map(q => q.chapter_name ? q.chapter_name.trim() : 'General Chapter')));
      const firstChap = chapters.length > 0 ? chapters[0] : '';

      setManualData(prev => ({
        ...prev,
        selectedBook: firstBook,
        selectedChapter: firstChap,
        selectedQuestionType: 'All'
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

  const selectedQuestionsObjects = loadedQuestions.filter(q => selectedManualQuestions.includes(q.id));
  const countMCQ = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'MCQ')).length;
  const countBlank = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Blank Space')).length;
  const countMatching = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Matchings')).length;
  const countTF = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'True/False')).length;
  const countWhoSaid = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Who Said To Whom')).length;
  const countVShort = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Very Short')).length;
  const countShort = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Short')).length;
  const countLong = selectedQuestionsObjects.filter(q => isMatchType(q.question_type, 'Long')).length;

  const totalGenerateMaxMarks = 
    (Number(formData.mcqQty) * Number(formData.mcqMarks)) +
    (Number(formData.blankQty) * Number(formData.blankMarks)) +
    (Number(formData.matchingQty) * Number(formData.matchingMarks)) +
    (Number(formData.tfQty) * Number(formData.tfMarks)) +
    (Number(formData.whoSaidQty) * Number(formData.whoSaidMarks)) +
    (Number(formData.vShortQty) * Number(formData.vShortMarks)) +
    (Number(formData.shortQty) * Number(formData.shortMarks)) +
    (Number(formData.longQty) * Number(formData.longMarks));

  const totalManualMaxMarks = 
    (Number(manualConfig.mcqQty) * Number(manualConfig.mcqMarks)) +
    (Number(manualConfig.blankQty) * Number(manualConfig.blankMarks)) +
    (Number(manualConfig.matchingQty) * Number(manualConfig.matchingMarks)) +
    (Number(manualConfig.tfQty) * Number(manualConfig.tfMarks)) +
    (Number(manualConfig.whoSaidQty) * Number(manualConfig.whoSaidMarks)) +
    (Number(manualConfig.vShortQty) * Number(manualConfig.vShortMarks)) +
    (Number(manualConfig.shortQty) * Number(manualConfig.shortMarks)) +
    (Number(manualConfig.longQty) * Number(manualConfig.longMarks));

  const totalSelectedMarks = selectedQuestionsObjects.reduce((acc, q) => {
    let eachMarks = 1;
    if (isMatchType(q.question_type, 'MCQ')) eachMarks = Number(manualConfig.mcqMarks);
    else if (isMatchType(q.question_type, 'Blank Space')) eachMarks = Number(manualConfig.blankMarks);
    else if (isMatchType(q.question_type, 'Matchings')) eachMarks = Number(manualConfig.matchingMarks);
    else if (isMatchType(q.question_type, 'True/False')) eachMarks = Number(manualConfig.tfMarks);
    else if (isMatchType(q.question_type, 'Who Said To Whom')) eachMarks = Number(manualConfig.whoSaidMarks);
    else if (isMatchType(q.question_type, 'Very Short')) eachMarks = Number(manualConfig.vShortMarks);
    else if (isMatchType(q.question_type, 'Short')) eachMarks = Number(manualConfig.shortMarks);
    else if (isMatchType(q.question_type, 'Long')) eachMarks = Number(manualConfig.longMarks);
    else eachMarks = q.marks || 1;
    return acc + eachMarks;
  }, 0);

  const getMaxQtyForType = (qType) => {
    if (isMatchType(qType, 'MCQ')) return manualConfig.mcqQty;
    if (isMatchType(qType, 'Blank Space')) return manualConfig.blankQty;
    if (isMatchType(qType, 'Matchings')) return manualConfig.matchingQty;
    if (isMatchType(qType, 'True/False')) return manualConfig.tfQty;
    if (isMatchType(qType, 'Who Said To Whom')) return manualConfig.whoSaidQty;
    if (isMatchType(qType, 'Very Short')) return manualConfig.vShortQty;
    if (isMatchType(qType, 'Short')) return manualConfig.shortQty;
    if (isMatchType(qType, 'Long')) return manualConfig.longQty;
    return 99;
  };

  const toggleManualQuestionSelection = (q) => {
    const isSelected = selectedManualQuestions.includes(q.id);
    if (!isSelected) {
      const currentCount = selectedQuestionsObjects.filter(item => isMatchType(item.question_type, q.question_type)).length;
      const maxAllowed = getMaxQtyForType(q.question_type);
      if (currentCount >= maxAllowed) {
        alert(`Aap ${q.question_type} keval ${maxAllowed} hi select kar sakte hain! Kripya pehle koi dusra select kiya huva question uncheck karein.`);
        return;
      }
      setSelectedManualQuestions(prev => [...prev, q.id]);
    } else {
      setSelectedManualQuestions(prev => prev.filter(id => id !== q.id));
    }
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestData.class_name) {
      alert('Kripya Class select karein!');
      return;
    }

    const finalBookNameEn = suggestData.is_custom_book_en ? suggestData.custom_book_en : suggestData.book_name_en;
    const finalBookNameHi = suggestData.is_custom_book_hi ? suggestData.custom_book_hi : suggestData.book_name_hi;

    const rawChapterValEn = suggestData.is_custom_chapter_en ? suggestData.custom_chapter_en : suggestData.chapter_name_en;
    const rawChapterValHi = suggestData.is_custom_chapter_hi ? suggestData.custom_chapter_hi : suggestData.chapter_name_hi;

    const finalChapterNameEn = formatChapterTitle(rawChapterValEn, suggestData.chapter_prefix_en, suggestData.chapter_num);
    const finalChapterNameHi = formatChapterTitle(rawChapterValHi, suggestData.chapter_prefix_hi, suggestData.chapter_num_hi);

    const finalQuestionTypeEn = suggestData.is_custom_q_type_en ? suggestData.custom_question_type_en : suggestData.question_type_en;
    const finalQuestionTypeHi = suggestData.is_custom_q_type_hi ? suggestData.custom_question_type_hi : suggestData.question_type_hi;

    if (!finalBookNameEn || !finalBookNameEn.trim()) {
      alert('Kripya Book Name (English) chuney ya type karein!');
      return;
    }

    if (!finalChapterNameEn || !finalChapterNameEn.trim()) {
      alert('Kripya Chapter Name (English) chuney ya type karein!');
      return;
    }

    const { error } = await supabase.from('question_bank').insert([
      {
        class_name: suggestData.class_name,
        subject_name: suggestData.subject_name,
        book_name: finalBookNameEn.trim(),
        book_name_hi: finalBookNameHi ? finalBookNameHi.trim() : 'मुख्य पुस्तक',
        chapter_name: finalChapterNameEn.trim(),
        chapter_name_hi: finalChapterNameHi ? finalChapterNameHi.trim() : null,
        question_type: finalQuestionTypeEn || finalQuestionTypeHi || 'MCQ',
        question_text: suggestData.question_text || null,
        question_text_hi: suggestData.question_text_hi || null,
        option_a: suggestData.option_a || null,
        option_b: suggestData.option_b || null,
        option_c: suggestData.option_c || null,
        option_d: suggestData.option_d || null,
        option_a_hi: suggestData.option_a_hi || null,
        option_b_hi: suggestData.option_b_hi || null,
        option_c_hi: suggestData.option_c_hi || null,
        option_d_hi: suggestData.option_d_hi || null,
        correct_answer: suggestData.correct_answer || null,
        correct_answer_hi: suggestData.correct_answer_hi || null,
        image_url: suggestData.image_url ? suggestData.image_url.trim() : null,
        marks: parseInt(suggestData.marks) || 1,
        medium: 'Both',
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
        question_text_hi: '',
        option_a: '', 
        option_b: '', 
        option_c: '', 
        option_d: '', 
        option_a_hi: '',
        option_b_hi: '',
        option_c_hi: '',
        option_d_hi: '',
        correct_answer: '',
        correct_answer_hi: '',
        image_url: ''
      }));
      fetchBankQuestions();
    }
  };

  const handleJsonBulkInsert = async () => {
    if (!bulkClass) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya Target Class select karein!' });
      return;
    }

    if (!jsonInput.trim()) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya JSON data paste karein!' });
      return;
    }

    const finalBulkBookName = isCustomBulkBook ? customBulkBook : bulkBook;

    setBulkLoading(true);
    setBulkStatusMsg({ type: '', text: '' });

    try {
      let parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('JSON data ek valid Array [...] hona chahiye.');
      }

      const formattedQuestions = parsedData.map((q) => ({
        subject_name: bulkSubject || 'General',
        class_name: bulkClass,
        book_name: finalBulkBookName.trim(),
        book_name_hi: 'मुख्य पुस्तक',
        chapter_name: q.chapter_name || 'Chapter - 1',
        chapter_name_hi: q.chapter_name_hi || null,
        question_type: q.question_type || 'MCQ',
        question_text: q.question_text || q.question || null,
        question_text_hi: q.question_text_hi || null,
        option_a: q.option_a || null,
        option_b: q.option_b || null,
        option_c: q.option_c || null,
        option_d: q.option_d || null,
        option_a_hi: q.option_a_hi || null,
        option_b_hi: q.option_b_hi || null,
        option_c_hi: q.option_c_hi || null,
        option_d_hi: q.option_d_hi || null,
        correct_answer: q.correct_answer || null,
        correct_answer_hi: q.correct_answer_hi || null,
        image_url: q.image_url || null,
        marks: q.marks || 1,
        medium: bulkMedium,
        is_global: false,
        status: 'pending',
        school_name: 'BLUE HEAVEN KIDS ACADEMY'
      }));

      const { error } = await supabase.from('question_bank').insert(formattedQuestions);
      if (error) throw error;

      setBulkStatusMsg({ type: 'success', text: `✅ Total ${formattedQuestions.length} questions successfully add ho gaye!` });
      setJsonInput('');
      fetchBankQuestions();
    } catch (error) {
      setBulkStatusMsg({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCsvFileUpload = async () => {
    if (!bulkClass || !selectedFile) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya Class aur CSV file select karein!' });
      return;
    }

    const finalBulkBookName = isCustomBulkBook ? customBulkBook : bulkBook;
    setBulkLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error('CSV file khali hai.');

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const getIdx = (names) => headers.findIndex(h => names.includes(h));

        const chapIdx = getIdx(['chapter_name', 'chapter']);
        const typeIdx = getIdx(['question_type', 'type']);
        const textIdx = getIdx(['question_text', 'question']);
        const ansIdx = getIdx(['correct_answer', 'answer']);
        const imgIdx = getIdx(['image_url', 'image']);
        const marksIdx = getIdx(['marks']);

        const formattedQuestions = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(val => val.trim());
          if (row.length >= 2) {
            formattedQuestions.push({
              subject_name: bulkSubject || 'General',
              class_name: bulkClass,
              book_name: finalBulkBookName.trim(),
              book_name_hi: 'मुख्य पुस्तक',
              chapter_name: chapIdx !== -1 ? row[chapIdx] : 'Chapter - 1',
              question_type: typeIdx !== -1 ? row[typeIdx] : 'MCQ',
              question_text: textIdx !== -1 ? row[textIdx] : null,
              correct_answer: ansIdx !== -1 ? row[ansIdx] : null,
              image_url: imgIdx !== -1 ? row[imgIdx] : null,
              marks: marksIdx !== -1 ? parseInt(row[marksIdx]) || 1 : 1,
              medium: bulkMedium,
              is_global: false,
              status: 'pending',
              school_name: 'BLUE HEAVEN KIDS ACADEMY'
            });
          }
        }

        const { error } = await supabase.from('question_bank').insert(formattedQuestions);
        if (error) throw error;

        setBulkStatusMsg({ type: 'success', text: `✅ Total ${formattedQuestions.length} questions uploaded successfully!` });
        setSelectedFile(null);
        fetchBankQuestions();
      } catch (err) {
        setBulkStatusMsg({ type: 'error', text: `CSV Error: ${err.message}` });
      } finally {
        setBulkLoading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  const fetchPendingQuestions = async () => {
    const { data, error } = await supabase.from('question_bank').select('*').eq('status', 'pending');
    if (!error) setPendingQuestions(data || []);
  };

  useEffect(() => {
    if (activeTab === 'admin-approvals') fetchPendingQuestions();
  }, [activeTab]);

  const handleGenerateManualPaper = () => {
    if (!manualData.selectedClass || selectedManualQuestions.length === 0) {
      alert('Kripya Class aur kam se kam ek question select karein!');
      return;
    }

    const selectedList = loadedQuestions.filter(q => selectedManualQuestions.includes(q.id));
    const grouped = {};
    selectedList.forEach(q => {
      const qType = q.question_type || 'General Questions';
      if (!grouped[qType]) grouped[qType] = [];
      grouped[qType].push(q);
    });

    const sections = Object.keys(grouped).map((qType, idx) => ({
      question_type: qType,
      questions: grouped[qType],
      index: idx
    }));

    setGeneratedPaper({
      sections,
      config: {
        schoolName: formData.schoolName,
        showSchoolName: formData.showSchoolName,
        examName: formData.examName,
        session: formData.session,
        timeAllowed: formData.timeAllowed,
        selectedClass: manualData.selectedClass,
        subject: manualData.subject_name,
        selectedBooks: [manualData.selectedBook],
        medium: manualData.medium
      }
    });
    setPaperPrintMode('student');
  };

  const handleGeneratePaper = async () => {
    if (!formData.selectedClass) {
      alert('Kripya Class select karein!');
      return;
    }

    setIsGenerating(true);
    let query = supabase.from('question_bank').select('*').ilike('class_name', formData.selectedClass.trim()).ilike('subject_name', formData.subject.trim());

    if (formData.selectedBooks.length > 0) query = query.in('book_name', formData.selectedBooks);
    if (formData.selectedChapters.length > 0) query = query.in('chapter_name', formData.selectedChapters);
    if (formData.medium !== 'Both') query = query.eq('medium', formData.medium);

    if (formData.sourceType === 'Global Question Bank') query = query.eq('status', 'approved');
    else if (formData.sourceType === 'School Custom Questions') query = query.eq('is_global', false);

    const { data, error } = await query;
    setIsGenerating(false);

    if (error || !data || data.length === 0) {
      alert('Is criteria ke anusaar koi question nahi mila!');
      return;
    }

    const grouped = {};
    data.forEach(q => {
      const qType = q.question_type || 'General Questions';
      if (!grouped[qType]) grouped[qType] = [];
      grouped[qType].push(q);
    });

    const sections = Object.keys(grouped).map((qType, idx) => ({
      question_type: qType,
      questions: grouped[qType],
      index: idx
    }));

    setGeneratedPaper({ sections, config: { ...formData } });
    setPaperPrintMode('student');
  };

  const suggestAvailableBooksEn = getBooksForClassSubject(suggestData.class_name, suggestData.subject_name);
  const suggestAvailableChaptersEn = getChaptersForSelection(suggestData.class_name, suggestData.subject_name, [suggestData.book_name_en]);
  const bulkAvailableBooks = getBooksForClassSubject(bulkClass, bulkSubject);
  const availableManualBooks = getBooksForClassSubject(manualData.selectedClass, manualData.subject_name);
  const availableManualChapters = getChaptersForSelection(manualData.selectedClass, manualData.subject_name, [manualData.selectedBook]);

  const filteredManualQuestions = loadedQuestions.filter(q => {
    const book = q.book_name ? q.book_name.trim() : 'Main Book';
    const chap = q.chapter_name ? q.chapter_name.trim() : 'General Chapter';
    if (manualData.selectedBook && book.toLowerCase() !== manualData.selectedBook.trim().toLowerCase()) return false;
    if (manualData.selectedChapter && chap.toLowerCase() !== manualData.selectedChapter.trim().toLowerCase()) return false;
    if (manualData.selectedQuestionType !== 'All' && q.question_type !== manualData.selectedQuestionType) return false;
    return true;
  });

  const renderQuestionImages = (q) => {
    if (!q.image_url) return null;
    const urls = q.image_url.split(/[\s,]+/).filter(Boolean);
    if (urls.length === 0) return null;
    return (
      <div className="mt-2 mb-2 flex flex-wrap gap-2">
        {urls.map((url, idx) => (
          <img key={idx} src={url.trim()} alt="Question" className="max-h-40 max-w-full rounded border object-contain shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
        ))}
      </div>
    );
  };

  const renderQuestionText = (q) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') {
      return <div><div>{q.question_text_hi || q.question_text}</div>{renderQuestionImages(q)}</div>;
    } else if (med === 'Both') {
      return <div><div>{q.question_text}</div>{q.question_text_hi && <div className="text-gray-700 mt-0.5">{q.question_text_hi}</div>}{renderQuestionImages(q)}</div>;
    }
    return <div><div>{q.question_text || q.question_text_hi}</div>{renderQuestionImages(q)}</div>;
  };

  const renderAnswerText = (q) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') return q.correct_answer_hi || q.correct_answer;
    if (med === 'Both') return `${q.correct_answer || ''} ${q.correct_answer_hi ? `/ ${q.correct_answer_hi}` : ''}`;
    return q.correct_answer || q.correct_answer_hi;
  };

  const renderOptionText = (q, optKey, optKeyHi) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    const valEng = q[optKey], valHi = q[optKeyHi];
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') return valHi || valEng;
    if (med === 'Both') return valEng && valHi ? `${valEng} / ${valHi}` : (valEng || valHi);
    return valEng || valHi;
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 font-sans print:p-0 print:bg-white">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        
        {/* Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 bg-white p-4 gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white shadow-sm shrink-0">
              <FileText size={16} />
            </div>
            <h2 className="text-lg font-bold text-[#1B3A6B]">Question Paper Generator & Bank</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setActiveTab('generate'); setGeneratedPaper(null); }} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase ${activeTab === 'generate' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'}`}>🔥 Generate Paper</button>
            <button onClick={() => setActiveTab('suggest')} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase ${activeTab === 'suggest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>💡 Suggest / Add</button>
            <button onClick={() => setActiveTab('bulk-import')} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase ${activeTab === 'bulk-import' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>📁 Bulk Import</button>
            <button onClick={() => setActiveTab('admin-approvals')} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase ${activeTab === 'admin-approvals' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}>✅ Approvals</button>
            <button onClick={() => setActiveTab('manual')} className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase ${activeTab === 'manual' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>🔍 Manual Picker</button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 print:p-0">
          {generatedPaper ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#F0F4F8] p-4 rounded-xl border print:hidden">
                <button onClick={() => setGeneratedPaper(null)} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
                <div className="flex gap-2">
                  <button onClick={() => { setPaperPrintMode('student'); setTimeout(() => window.print(), 100); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><Printer size={14} /> Print Paper</button>
                  <button onClick={() => { setPaperPrintMode('teacher'); setTimeout(() => window.print(), 100); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><Printer size={14} /> Print Answer Key</button>
                </div>
              </div>

              {/* Printable Area */}
              <div id="printable-paper" className="bg-white border-2 border-gray-800 p-6 rounded-lg shadow-xl text-black max-w-4xl mx-auto space-y-4 print:border-none print:shadow-none print:p-0">
                <div className="border-b-2 border-gray-800 pb-3 space-y-2 text-center">
                  {generatedPaper.config.showSchoolName && <h1 className="text-xl font-black uppercase text-[#1B3A6B]">{generatedPaper.config.schoolName}</h1>}
                  <h2 className="text-sm font-bold uppercase text-gray-800">{generatedPaper.config.examName} {paperPrintMode === 'teacher' ? '- ANSWER KEY' : ''} ({generatedPaper.config.session})</h2>
                  
                  <div className="grid grid-cols-3 text-xs font-bold pt-2 text-gray-800">
                    <div className="text-left">Roll No.: ____________</div>
                    <div className="text-center">Class: {generatedPaper.config.selectedClass} | Subject: {generatedPaper.config.subject}</div>
                    <div className="text-right">Max Marks: {generatedPaper.sections.reduce((sum, s) => sum + s.questions.reduce((a, q) => a + Number(q.marks || 1), 0), 0)}</div>
                  </div>
                </div>

                {generatedPaper.sections.map((sec, idx) => (
                  <div key={sec.question_type} className="space-y-2">
                    <div className="bg-gray-100 p-2 font-bold text-xs uppercase border-l-4 border-blue-900">{getSectionHeaderLabel(sec.question_type, generatedPaper.config.medium, idx)}</div>
                    <div className="space-y-2 pl-2">
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id} className="text-xs space-y-1">
                          <div className="font-semibold">
                            <span className="font-bold mr-2">{getQuestionPrefix(qIdx, generatedPaper.config.medium)}</span>
                            <span>{renderQuestionText(q)}</span>
                            <span className="float-right font-bold">[{fmtMarks(q.marks || 1)} Mark]</span>
                          </div>
                          {(q.option_a || q.option_a_hi) && (
                            <div className="grid grid-cols-2 gap-2 pl-6 font-semibold">
                              <div>({getOptionLetter(0, generatedPaper.config.medium)}) {renderOptionText(q, 'option_a', 'option_a_hi')}</div>
                              <div>({getOptionLetter(1, generatedPaper.config.medium)}) {renderOptionText(q, 'option_b', 'option_b_hi')}</div>
                              <div>({getOptionLetter(2, generatedPaper.config.medium)}) {renderOptionText(q, 'option_c', 'option_c_hi')}</div>
                              <div>({getOptionLetter(3, generatedPaper.config.medium)}) {renderOptionText(q, 'option_d', 'option_d_hi')}</div>
                            </div>
                          )}
                          {paperPrintMode === 'teacher' && <div className="pl-6 text-emerald-700 font-bold bg-emerald-50 p-1 rounded">Ans: {renderAnswerText(q)}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* SUGGEST TAB */}
              {activeTab === 'suggest' && (
                <form onSubmit={handleSuggestSubmit} className="space-y-4">
                  <div className="bg-[#F0F4F8] p-3 rounded flex justify-between items-center text-xs font-bold">
                    <span>Add New Question with Medium & Book Support</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" name="auto_sync" checked={suggestData.auto_sync} onChange={handleSuggestChange} /> Auto-Sync English to Hindi</label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold">Class</label>
                      <select name="class_name" value={suggestData.class_name} onChange={(e) => handleClassChange(e, 'suggest')} className="w-full border p-2 rounded text-xs font-bold">
                        <option value="">Select Class</option>
                        {classList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold">Subject</label>
                      <select name="subject_name" value={suggestData.subject_name} onChange={(e) => setSuggestData(prev => ({ ...prev, subject_name: e.target.value }))} className="w-full border p-2 rounded text-xs font-bold">
                        {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                    <div>
                      <label className="text-xs font-bold">Book Name (English)</label>
                      <input type="text" name="book_name_en" value={suggestData.book_name_en} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Chapter Name (English)</label>
                      <input type="text" name="chapter_name_en" value={suggestData.chapter_name_en} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold">Question Text (English)</label>
                      <textarea name="question_text" rows="2" value={suggestData.question_text} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Question Text (Hindi)</label>
                      <textarea name="question_text_hi" rows="2" value={suggestData.question_text_hi} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold">Correct Answer (Eng)</label>
                      <input type="text" name="correct_answer" value={suggestData.correct_answer} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Correct Answer (Hindi)</label>
                      <input type="text" name="correct_answer_hi" value={suggestData.correct_answer_hi} onChange={handleSuggestChange} className="w-full border p-2 rounded text-xs" />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold text-xs uppercase">Submit Question</button>
                </form>
              )}

              {/* BULK IMPORT TAB */}
              {activeTab === 'bulk-import' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <select value={bulkClass} onChange={(e) => handleClassChange(e, 'bulk')} className="border p-2 rounded text-xs font-bold">
                      <option value="">Select Class</option>
                      {classList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} className="border p-2 rounded text-xs font-bold">
                      {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={bulkBook} onChange={(e) => setBulkBook(e.target.value)} placeholder="Book Name" className="border p-2 rounded text-xs font-bold" />
                  </div>
                  <textarea rows="6" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder="Paste JSON array here..." className="w-full border p-3 rounded font-mono text-xs" />
                  <button onClick={handleJsonBulkInsert} disabled={bulkLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded font-bold text-xs uppercase">Upload JSON</button>
                </div>
              )}

              {/* ADMIN APPROVALS */}
              {activeTab === 'admin-approvals' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-emerald-700">Pending Approvals</h3>
                  <table className="w-full text-left text-xs border">
                    <thead><tr className="bg-gray-100 border-b"><th className="p-2">Class / Subject</th><th className="p-2">Chapter</th><th className="p-2">Question</th><th className="p-2">Status</th></tr></thead>
                    <tbody>
                      {pendingQuestions.map(q => (
                        <tr key={q.id} className="border-b"><td className="p-2 font-bold">{q.class_name} / {q.subject_name}</td><td className="p-2">{q.chapter_name}</td><td className="p-2">{q.question_text || q.question_text_hi}</td><td className="p-2 text-amber-600 font-bold">Pending</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MANUAL PICKER */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded text-xs font-bold">
                    <select name="selectedClass" value={manualData.selectedClass} onChange={(e) => handleClassChange(e, 'manual')} className="border p-2 rounded">
                      <option value="">Select Class</option>
                      {classList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="subject_name" value={manualData.subject_name} onChange={handleManualChange} className="border p-2 rounded">
                      {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="selectedBook" value={manualData.selectedBook} onChange={handleManualChange} className="border p-2 rounded">
                      {availableManualBooks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select name="medium" value={manualData.medium} onChange={handleManualChange} className="border p-2 rounded">
                      {mediumList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <table className="w-full text-left text-xs border">
                    <thead><tr className="bg-gray-100 border-b"><th className="p-2 w-10">Select</th><th className="p-2">Type</th><th className="p-2">Question Text</th></tr></thead>
                    <tbody>
                      {filteredManualQuestions.map(q => (
                        <tr key={q.id} className="border-b">
                          <td className="p-2 text-center"><input type="checkbox" checked={selectedManualQuestions.includes(q.id)} onChange={() => toggleManualQuestionSelection(q)} /></td>
                          <td className="p-2 font-bold">{q.question_type}</td>
                          <td className="p-2">{renderQuestionText(q)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button onClick={handleGenerateManualPaper} className="bg-emerald-600 text-white w-full py-3 rounded font-bold text-xs uppercase">Generate Paper ({selectedManualQuestions.length} Selected)</button>
                </div>
              )}

              {/* GENERATE PAPER TAB */}
              {activeTab === 'generate' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <select name="selectedClass" value={formData.selectedClass} onChange={(e) => handleClassChange(e, 'generator')} className="border p-2 rounded text-xs font-bold">
                      <option value="">Select Class</option>
                      {classList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="subject" value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} className="border p-2 rounded text-xs font-bold">
                      {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="medium" value={formData.medium} onChange={handleChange} className="border p-2 rounded text-xs font-bold">
                      {mediumList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-xs font-bold space-y-2">
                    <label className="block">Select Book(s):</label>
                    <div className="flex gap-3">
                      {getBooksForClassSubject(formData.selectedClass, formData.subject).map(b => (
                        <label key={b} className="flex items-center gap-1"><input type="checkbox" checked={formData.selectedBooks.includes(b)} onChange={() => toggleBookSelection(b, false)} /> {b}</label>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleGeneratePaper} disabled={isGenerating} className="w-full bg-amber-500 text-white p-3 rounded font-bold text-xs uppercase">Generate Paper (Auto)</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}