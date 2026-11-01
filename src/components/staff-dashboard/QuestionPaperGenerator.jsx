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

  // Section Header Label with exact sequential order (1 to 8) and Dark Bold Styling
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

  const getQuestionTypesForClassSubject = (cls, sub) => {
    const defaultTypes = ['MCQ', 'Blank Space', 'Matchings', 'True/False', 'Who Said To Whom', 'Very Short', 'Short', 'Long'];
    if (!cls || !sub) return defaultTypes;
    const filtered = allBankQuestions.filter(q => 
      q.class_name && q.class_name.trim().toLowerCase() === cls.trim().toLowerCase() && 
      q.subject_name && q.subject_name.trim().toLowerCase() === sub.trim().toLowerCase()
    );
    const qTypesSet = new Set(defaultTypes);
    filtered.forEach(q => {
      if (q.question_type) qTypesSet.add(q.question_type.trim());
    });
    return Array.from(qTypesSet);
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

      // Handle Auto-Sync for Hindi & Sanskrit papers where English & Hindi entries are mirrored
      if (updated.auto_sync) {
        if (name === 'book_name_en') {
          updated.book_name_hi = value;
        } else if (name === 'custom_book_en') {
          updated.custom_book_hi = value;
        } else if (name === 'chapter_prefix_en') {
          updated.chapter_prefix_hi = value;
        } else if (name === 'chapter_num') {
          updated.chapter_num_hi = value;
        } else if (name === 'chapter_name_en') {
          updated.chapter_name_hi = value;
        } else if (name === 'custom_chapter_en') {
          updated.custom_chapter_hi = value;
        } else if (name === 'question_text') {
          updated.question_text_hi = value;
        } else if (name === 'option_a') {
          updated.option_a_hi = value;
        } else if (name === 'option_b') {
          updated.option_b_hi = value;
        } else if (name === 'option_c') {
          updated.option_c_hi = value;
        } else if (name === 'option_d') {
          updated.option_d_hi = value;
        } else if (name === 'correct_answer') {
          updated.correct_answer_hi = value;
        }
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

    const finalBookNameEn = suggestData.is_custom_book_en 
      ? suggestData.custom_book_en 
      : suggestData.book_name_en;

    const finalBookNameHi = suggestData.is_custom_book_hi 
      ? suggestData.custom_book_hi 
      : suggestData.book_name_hi;

    const rawChapterValEn = suggestData.is_custom_chapter_en 
      ? suggestData.custom_chapter_en 
      : suggestData.chapter_name_en;

    const rawChapterValHi = suggestData.is_custom_chapter_hi 
      ? suggestData.custom_chapter_hi 
      : suggestData.chapter_name_hi;

    const finalChapterNameEn = formatChapterTitle(rawChapterValEn, suggestData.chapter_prefix_en, suggestData.chapter_num);
    const finalChapterNameHi = formatChapterTitle(rawChapterValHi, suggestData.chapter_prefix_hi, suggestData.chapter_num_hi);

    const finalQuestionTypeEn = suggestData.is_custom_q_type_en 
      ? suggestData.custom_question_type_en 
      : suggestData.question_type_en;

    const finalQuestionTypeHi = suggestData.is_custom_q_type_hi 
      ? suggestData.custom_question_type_hi 
      : suggestData.question_type_hi;

    if (!finalBookNameEn || !finalBookNameEn.trim()) {
      alert('Kripya Book Name (English) chuney ya type karein!');
      return;
    }

    if (!finalChapterNameEn || !finalChapterNameEn.trim()) {
      alert('Kripya Chapter Name (English) chuney ya type karein!');
      return;
    }

    if ((!suggestData.question_text && !suggestData.question_text_hi && !suggestData.image_url) || (!suggestData.correct_answer && !suggestData.correct_answer_hi && !suggestData.image_url)) {
      alert('Kripya Sawaal aur Jawab ya Image URL bharein!');
      return;
    }

    const { error } = await supabase.from('question_bank').insert([
      {
        class_name: suggestData.class_name,
        subject_name: suggestData.subject_name,
        book_name: finalBookNameEn.trim(),
        book_name_hi: finalBookNameHi.trim(),
        chapter_name: finalChapterNameEn.trim(),
        chapter_name_hi: finalChapterNameHi.trim(),
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
        marks: parseInt(suggestData.marks),
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
        image_url: '',
        custom_book_en: '',
        custom_book_hi: '',
        is_custom_book_en: false,
        is_custom_book_hi: false,
        custom_chapter_en: '',
        custom_chapter_hi: '',
        is_custom_chapter_en: false,
        is_custom_chapter_hi: false,
        custom_question_type_en: '',
        is_custom_q_type_en: false,
        custom_question_type_hi: '',
        is_custom_q_type_hi: false
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

    if (!finalBulkBookName || !finalBulkBookName.trim()) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya Book Name select karein ya new type karein!' });
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

      const chapterMap = new Map();

      parsedData.forEach((q) => {
        const rawChapterName = q.chapter_name || 'Chapter - 1 General';
        const normalizedKey = normalizeChapterName(rawChapterName);

        if (!chapterMap.has(normalizedKey)) {
          chapterMap.set(normalizedKey, {
            displayName: rawChapterName.trim().replace(/\s+/g, ' '),
            questions: []
          });
        }

        chapterMap.get(normalizedKey).questions.push({
          ...q,
          chapter_name: chapterMap.get(normalizedKey).displayName
        });
      });

      const formattedQuestions = [];
      chapterMap.forEach((chapterObj) => {
        chapterObj.questions.forEach((q) => {
          formattedQuestions.push({
            subject_name: bulkSubject || 'General',
            class_name: bulkClass,
            book_name: finalBulkBookName.trim(),
            chapter_name: q.chapter_name,
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
            marks: q.marks || q.max_marks || 1,
            medium: bulkMedium,
            is_global: false,
            status: 'pending',
            school_name: 'BLUE HEAVEN KIDS ACADEMY'
          });
        });
      });

      const { error } = await supabase.from('question_bank').insert(formattedQuestions);
      if (error) throw error;

      setBulkStatusMsg({ type: 'success', text: `✅ Shandaar! Total ${formattedQuestions.length} questions successfully add ho gaye with normalized chapters!` });
      setJsonInput('');
      fetchBankQuestions();
    } catch (error) {
      setBulkStatusMsg({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCsvFileUpload = async () => {
    if (!bulkClass) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya Target Class select karein!' });
      return;
    }

    if (!selectedFile) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya pehle CSV file select karein!' });
      return;
    }

    const finalBulkBookName = isCustomBulkBook ? customBulkBook : bulkBook;

    if (!finalBulkBookName || !finalBulkBookName.trim()) {
      setBulkStatusMsg({ type: 'error', text: 'Kripya Book Name select karein ya new type karein!' });
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
        const textHiIdx = getColIdx(['question_text_hi', 'question_hi']);
        const optAIdx = getColIdx(['option_a', 'a']);
        const optBIdx = getColIdx(['option_b', 'b']);
        const optCIdx = getColIdx(['option_c', 'c']);
        const optDIdx = getColIdx(['option_d', 'd']);
        const optAHiIdx = getColIdx(['option_a_hi', 'a_hi']);
        const optBHiIdx = getColIdx(['option_b_hi', 'b_hi']);
        const optCHiIdx = getColIdx(['option_c_hi', 'c_hi']);
        const optDHiIdx = getColIdx(['option_d_hi', 'd_hi']);
        const ansIdx = getColIdx(['correct_answer', 'answer', 'ans']);
        const ansHiIdx = getColIdx(['correct_answer_hi', 'answer_hi']);
        const imgIdx = getColIdx(['image_url', 'image', 'img']);
        const marksIdx = getColIdx(['marks', 'mark']);

        const rawQuestionsArray = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(val => val.trim());
          if (row.length >= 2) {
            rawQuestionsArray.push({
              chapter_name: chapIdx !== -1 && row[chapIdx] ? row[chapIdx] : 'Chapter - 1',
              question_type: typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'MCQ',
              question_text: textIdx !== -1 && row[textIdx] ? row[textIdx] : null,
              question_text_hi: textHiIdx !== -1 ? row[textHiIdx] : null,
              option_a: optAIdx !== -1 ? row[optAIdx] : null,
              option_b: optBIdx !== -1 ? row[optBIdx] : null,
              option_c: optCIdx !== -1 ? row[optCIdx] : null,
              option_d: optDIdx !== -1 ? row[optDIdx] : null,
              option_a_hi: optAHiIdx !== -1 ? row[optAHiIdx] : null,
              option_b_hi: optBHiIdx !== -1 ? row[optBHiIdx] : null,
              option_c_hi: optCHiIdx !== -1 ? row[optCHiIdx] : null,
              option_d_hi: optDHiIdx !== -1 ? row[optDHiIdx] : null,
              correct_answer: ansIdx !== -1 ? row[ansIdx] : null,
              correct_answer_hi: ansHiIdx !== -1 ? row[ansHiIdx] : null,
              image_url: imgIdx !== -1 ? row[imgIdx] : null,
              marks: marksIdx !== -1 && parseInt(row[marksIdx]) ? parseInt(row[marksIdx]) : 1
            });
          }
        }

        const chapterMap = new Map();
        rawQuestionsArray.forEach((q) => {
          const rawChapterName = q.chapter_name || 'Chapter - 1';
          const normalizedKey = normalizeChapterName(rawChapterName);

          if (!chapterMap.has(normalizedKey)) {
            chapterMap.set(normalizedKey, {
              displayName: rawChapterName.trim().replace(/\s+/g, ' '),
              questions: []
            });
          }

          chapterMap.get(normalizedKey).questions.push({
            ...q,
            chapter_name: chapterMap.get(normalizedKey).displayName
          });
        });

        const formattedQuestions = [];
        chapterMap.forEach((chapterObj) => {
          chapterObj.questions.forEach((q) => {
            formattedQuestions.push({
              subject_name: bulkSubject || 'General',
              class_name: bulkClass,
              book_name: finalBulkBookName.trim(),
              chapter_name: q.chapter_name,
              question_type: q.question_type,
              question_text: q.question_text,
              question_text_hi: q.question_text_hi,
              option_a: q.option_a,
              option_b: q.option_b,
              option_c: q.option_c,
              option_d: q.option_d,
              option_a_hi: q.option_a_hi,
              option_b_hi: q.option_b_hi,
              option_c_hi: q.option_c_hi,
              option_d_hi: q.option_d_hi,
              correct_answer: q.correct_answer,
              correct_answer_hi: q.correct_answer_hi,
              image_url: q.image_url,
              marks: q.marks,
              medium: bulkMedium,
              is_global: false,
              status: 'pending',
              school_name: 'BLUE HEAVEN KIDS ACADEMY'
            });
          });
        });

        const { error } = await supabase.from('question_bank').insert(formattedQuestions);
        if (error) throw error;

        setBulkStatusMsg({ type: 'success', text: `✅ File Upload Successful! Total ${formattedQuestions.length} questions added across chapters with normalization.` });
        setSelectedFile(null);
        fetchBankQuestions();
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
    if (!manualData.selectedClass) {
      alert('Kripya Class select karein!');
      return;
    }

    if (selectedManualQuestions.length === 0) {
      alert('Kripya kam se kam ek question select karein!');
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
        medium: manualData.medium,
        mcqMarks: manualConfig.mcqMarks,
        blankMarks: manualConfig.blankMarks,
        matchingMarks: manualConfig.matchingMarks,
        tfMarks: manualConfig.tfMarks,
        whoSaidMarks: manualConfig.whoSaidMarks,
        vShortMarks: manualConfig.vShortMarks,
        shortMarks: manualConfig.shortMarks,
        longMarks: manualConfig.longMarks
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

    let query = supabase
      .from('question_bank')
      .select('*')
      .ilike('class_name', formData.selectedClass.trim())
      .ilike('subject_name', formData.subject.trim());

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

    const grouped = {};
    data.forEach(q => {
      const qType = q.question_type || 'General Questions';
      if (!grouped[qType]) grouped[qType] = [];
      grouped[qType].push(q);
    });

    const sections = Object.keys(grouped).map((qType, idx) => {
      let limit = 999;
      if (isMatchType(qType, 'MCQ')) limit = parseInt(formData.mcqQty) || 999;
      else if (isMatchType(qType, 'Blank Space')) limit = parseInt(formData.blankQty) || 999;
      else if (isMatchType(qType, 'Matchings')) limit = parseInt(formData.matchingQty) || 999;
      else if (isMatchType(qType, 'True/False')) limit = parseInt(formData.tfQty) || 999;
      else if (isMatchType(qType, 'Who Said To Whom')) limit = parseInt(formData.whoSaidQty) || 999;
      else if (isMatchType(qType, 'Very Short')) limit = parseInt(formData.vShortQty) || 999;
      else if (isMatchType(qType, 'Short')) limit = parseInt(formData.shortQty) || 999;
      else if (isMatchType(qType, 'Long')) limit = parseInt(formData.longQty) || 999;

      return {
        question_type: qType,
        questions: grouped[qType].slice(0, limit),
        index: idx
      };
    }).filter(sec => sec.questions.length > 0);

    setGeneratedPaper({
      sections,
      config: { ...formData }
    });
    setPaperPrintMode('student');
    setIsGenerating(false);
  };

  const suggestAvailableBooksEn = getBooksForClassSubject(suggestData.class_name, suggestData.subject_name);
  const suggestAvailableChaptersEn = getChaptersForSelection(
    suggestData.class_name, 
    suggestData.subject_name, 
    suggestData.book_name_en ? [suggestData.book_name_en.trim()] : ['Main Book']
  );
  const suggestAvailableQuestionTypes = getQuestionTypesForClassSubject(suggestData.class_name, suggestData.subject_name);

  const bulkAvailableBooks = getBooksForClassSubject(bulkClass, bulkSubject);

  const availableManualBooks = getBooksForClassSubject(manualData.selectedClass, manualData.subject_name);
  const availableManualChapters = getChaptersForSelection(
    manualData.selectedClass, 
    manualData.subject_name, 
    manualData.selectedBook ? [manualData.selectedBook] : []
  );

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
          <img 
            key={idx}
            src={url.trim()} 
            alt={`Question Image ${idx + 1}`} 
            className="max-h-40 max-w-full rounded-md border border-gray-300 object-contain shadow-sm"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ))}
      </div>
    );
  };

  const renderQuestionText = (q) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') {
      return (
        <div>
          <div>{q.question_text_hi || q.question_text}</div>
          {renderQuestionImages(q)}
        </div>
      );
    } else if (med === 'Both') {
      return (
        <div>
          <div>{q.question_text}</div>
          {q.question_text_hi && <div className="text-gray-700 mt-0.5">{q.question_text_hi}</div>}
          {renderQuestionImages(q)}
        </div>
      );
    }
    return (
      <div>
        <div>{q.question_text || q.question_text_hi}</div>
        {renderQuestionImages(q)}
      </div>
    );
  };

  const renderAnswerText = (q) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') {
      return q.correct_answer_hi || q.correct_answer;
    } else if (med === 'Both') {
      return `${q.correct_answer || ''} ${q.correct_answer_hi ? `/ ${q.correct_answer_hi}` : ''}`;
    }
    return q.correct_answer || q.correct_answer_hi;
  };

  const renderOptionText = (q, optKey, optKeyHi) => {
    const med = generatedPaper?.config?.medium || formData.medium || manualData.medium;
    const valEng = q[optKey];
    const valHi = q[optKeyHi];
    if (med === 'Hindi' || med === 'हिंदी' || med === 'संस्कृत') {
      return valHi || valEng;
    } else if (med === 'Both') {
      if (valEng && valHi) return `${valEng} / ${valHi}`;
      return valEng || valHi;
    }
    return valEng || valHi;
  };

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
                
                {/* STANDARDIZED PROFESSIONAL HEADER */}
                <div className="border-b-2 border-gray-800 pb-3 space-y-2">
                  {generatedPaper.config.showSchoolName && (
                    <h1 className="text-2xl font-black uppercase tracking-wide text-[#1B3A6B] text-center">
                      {generatedPaper.config.schoolName}
                    </h1>
                  )}
                  <h2 className="text-base font-bold uppercase tracking-wider text-gray-800 text-center">
                    {generatedPaper.config.examName} {paperPrintMode === 'teacher' ? '- ANSWER KEY (TEACHERS COPY)' : ''} ({generatedPaper.config.session})
                  </h2>
                  
                  {/* UNIFORM & BALANCED 3-COLUMN HEADER SECTION */}
                  <div className="grid grid-cols-3 items-start text-sm font-bold pt-2 px-2 text-gray-800 gap-y-1.5 leading-snug">
                    
                    {/* Left Column */}
                    <div className="text-left space-y-1">
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? 'अनुक्रमांक (Roll No.): ____________' 
                          : 'Roll No.: ____________'}
                      </div>
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? `समय - ${generatedPaper.config.timeAllowed}` 
                          : `Time Allowed: ${generatedPaper.config.timeAllowed}`}
                      </div>
                    </div>

                    {/* Center Column */}
                    <div className="text-center space-y-1">
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? `विषय - ${getSubjectLabelByMedium(generatedPaper.config.subject, 'Hindi')}` 
                          : `Subject - ${generatedPaper.config.subject}`} 
                        {generatedPaper.config.selectedBooks && generatedPaper.config.selectedBooks.length > 0 ? ` (${generatedPaper.config.selectedBooks.join(', ')})` : ''}
                      </div>
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? `कक्षा - ${getClassLabelByMedium(generatedPaper.config.selectedClass, 'Hindi')}` 
                          : `Class - ${getClassLabelByMedium(generatedPaper.config.selectedClass, 'English')}`}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="text-right space-y-1">
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? `माध्यम - हिंदी` 
                          : `Medium - ${generatedPaper.config.medium}`}
                      </div>
                      <div>
                        {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत'
                          ? `पूर्णांक - ${
                              fmtTotalMarks(
                                generatedPaper.sections.reduce((totalSum, sec) => totalSum + sec.questions.reduce((secSum, q) => secSum + Number(q.marks || 1), 0), 0)
                              )
                            } अंक` 
                          : `Max Marks - ${
                              fmtTotalMarks(
                                generatedPaper.sections.reduce((totalSum, sec) => totalSum + sec.questions.reduce((secSum, q) => secSum + Number(q.marks || 1), 0), 0)
                              )
                            }`}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="text-xs border border-gray-400 p-2.5 rounded bg-gray-50 print:bg-white">
                  <p className="font-bold underline">{generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत' ? 'सामान्य निर्देश:' : 'General Instructions:'}</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 text-gray-700">
                    {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत' ? (
                      <>
                        <li>सभी प्रश्न अनिवार्य हैं।</li>
                        <li>प्रत्येक प्रश्न को ध्यानपूर्वक पढ़कर उत्तर दें।</li>
                        <li>प्रत्येक प्रश्न के अंक उनके सम्मुख अंकित हैं।</li>
                      </>
                    ) : (
                      <>
                        <li>All questions are compulsory.</li>
                        <li>Read each question carefully before answering.</li>
                        <li>Marks for each question are indicated against it.</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* DYNAMIC SECTIONS GROUPED BY SUPABASE QUESTION HEADINGS */}
                {generatedPaper.sections && generatedPaper.sections.map((sec, secIdx) => {
                  const secTotalMarks = sec.questions.reduce((sum, q) => sum + Number(q.marks || 1), 0);
                  return (
                    <div key={sec.question_type} className="space-y-3">
                      <div className="bg-gray-100 p-2.5 border-l-4 border-blue-900 font-black text-sm uppercase text-blue-950 print:bg-white print:border-black tracking-wide">
                        {getSectionHeaderLabel(sec.question_type, generatedPaper.config.medium, secIdx)} ({sec.questions.length} Questions = {fmtTotalMarks(secTotalMarks)} {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत' ? 'अंक' : 'Marks'})
                      </div>
                      <div className="space-y-3 pl-2">
                        {sec.questions.map((q, idx) => (
                          <div key={q.id} className="text-sm space-y-1.5">
                            <div className="font-semibold text-gray-900">
                              <div>
                                <span className="font-black mr-2">{getQuestionPrefix(idx, generatedPaper.config.medium)}</span> 
                                <span className="inline-block">{renderQuestionText(q)}</span>
                                <span className="float-right text-xs font-extrabold text-gray-600">[{fmtMarks(q.marks || 1)} {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत' ? 'अंक' : 'Mark'}]</span>
                              </div>
                            </div>
                            {(q.option_a || q.option_a_hi || q.option_b || q.option_b_hi || q.option_c || q.option_c_hi || q.option_d || q.option_d_hi) && (
                              <div className="grid grid-cols-2 gap-2 pl-6 text-xs text-gray-900 font-bold">
                                <div>({getOptionLetter(0, generatedPaper.config.medium)}) {renderOptionText(q, 'option_a', 'option_a_hi')}</div>
                                <div>({getOptionLetter(1, generatedPaper.config.medium)}) {renderOptionText(q, 'option_b', 'option_b_hi')}</div>
                                <div>({getOptionLetter(2, generatedPaper.config.medium)}) {renderOptionText(q, 'option_c', 'option_c_hi')}</div>
                                <div>({getOptionLetter(3, generatedPaper.config.medium)}) {renderOptionText(q, 'option_d', 'option_d_hi')}</div>
                              </div>
                            )}
                            {paperPrintMode === 'teacher' && (
                              <div className="pl-6 text-xs font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                                Ans: {renderAnswerText(q)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="text-center pt-6 text-xs text-gray-600 font-extrabold border-t border-gray-300">
                  {generatedPaper.config.medium === 'Hindi' || generatedPaper.config.medium === 'हिंदी' || generatedPaper.config.medium === 'संस्कृत' ? '*** शुभकामनाएँ / सर्वदा विजयी भव ***' : '*** All the Best ***'}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* TAB: SUGGEST / ADD QUESTION */}
              {activeTab === 'suggest' && (
                <form onSubmit={handleSuggestSubmit} className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-sm font-bold text-[#1B3A6B] flex items-center gap-2">
                      <PlusCircle size={18} className="text-[#00AEEF]" /> Add New Question with Multiple Image URLs & Dual Medium Support
                    </h3>
                    <label className="flex items-center gap-2 text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1.5 rounded-lg border border-indigo-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="auto_sync" 
                        checked={suggestData.auto_sync} 
                        onChange={handleSuggestChange} 
                        className="rounded text-indigo-600 focus:ring-0 w-4 h-4" 
                      /> 
                      🔄 Auto-Sync English to Hindi (Best for Hindi / Sanskrit Papers)
                    </label>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Class (कक्षा)</label>
                        <select name="class_name" value={suggestData.class_name} onChange={(e) => handleClassChange(e, 'suggest')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          <option value="">-- Select Class / कक्षा चुनें --</option>
                          {classList.map((cls) => <option key={cls} value={cls}>{getClassLabelByMedium(cls, 'English')}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject (विषय / Subject: Hindi / Sanskrit / etc.)</label>
                        <select name="subject_name" value={suggestData.subject_name} onChange={(e) => {
                          const val = e.target.value;
                          setSuggestData(prev => ({ ...prev, subject_name: val, book_name_en: 'Main Book', book_name_hi: 'मुख्य पुस्तक', chapter_name_en: '', chapter_name_hi: '' }));
                        }} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub} {getSubjectLabelByMedium(sub, 'Hindi') !== sub ? `(${getSubjectLabelByMedium(sub, 'Hindi')})` : ''}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* DUAL BOOK & CHAPTER SELECTION (SEPARATE FOR ENGLISH & HINDI/SANSKRIT WITH CHAPTER & LESSON OPTIONS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      
                      {/* English Book & Chapter Column */}
                      <div className="space-y-4">
                        <h4 className="font-black text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          🇬🇧 English Book & Chapter
                        </h4>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Book Name (English)</label>
                          {!suggestData.is_custom_book_en ? (
                            <select 
                              name="book_name_en" 
                              value={suggestData.book_name_en} 
                              onChange={handleSuggestChange} 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700 cursor-pointer"
                            >
                              <option value="">-- Select Book --</option>
                              {suggestAvailableBooksEn.map((book) => (
                                <option key={book} value={book}>{book}</option>
                              ))}
                              <option value="__ADD_NEW_BOOK__" className="text-emerald-700 font-black">➕ Add New Book...</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                name="custom_book_en" 
                                value={suggestData.custom_book_en} 
                                onChange={handleSuggestChange} 
                                placeholder="e.g. Vasant / Shemushi" 
                                className="w-full bg-white border-2 border-emerald-500 rounded-md px-3 py-2 text-sm font-bold text-gray-800" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setSuggestData(prev => ({ ...prev, is_custom_book_en: false, custom_book_en: '' }))}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-2 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Chapter Name (English - Chapter / Lesson / Unit)</label>
                          {!suggestData.is_custom_chapter_en ? (
                            <select 
                              name="chapter_name_en" 
                              value={suggestData.chapter_name_en} 
                              onChange={handleSuggestChange} 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700 cursor-pointer"
                            >
                              <option value="">-- Select Chapter --</option>
                              {suggestAvailableChaptersEn.map((chap) => (
                                <option key={chap} value={chap}>{chap}</option>
                              ))}
                              <option value="__ADD_NEW_CHAPTER__" className="text-emerald-700 font-black">➕ Add New Chapter...</option>
                            </select>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <select 
                                  name="chapter_prefix_en" 
                                  value={suggestData.chapter_prefix_en} 
                                  onChange={handleSuggestChange}
                                  className="bg-emerald-50 border border-emerald-400 rounded-md px-2 py-1.5 text-xs font-bold text-emerald-900"
                                >
                                  <option value="Chapter">Chapter</option>
                                  <option value="Lesson">Lesson</option>
                                  <option value="Unit">Unit</option>
                                </select>
                                <input 
                                  type="text" 
                                  name="chapter_num" 
                                  value={suggestData.chapter_num} 
                                  onChange={handleSuggestChange}
                                  placeholder="1"
                                  className="w-12 bg-white border border-emerald-400 rounded-md px-2 py-1.5 text-xs font-bold text-center"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  name="custom_chapter_en" 
                                  value={suggestData.custom_chapter_en} 
                                  onChange={handleSuggestChange} 
                                  placeholder="e.g. Subhashitam" 
                                  className="w-full bg-white border-2 border-emerald-500 rounded-md px-3 py-2 text-sm font-bold text-gray-800" 
                                />
                                <button 
                                  type="button" 
                                  onClick={() => setSuggestData(prev => ({ ...prev, is_custom_chapter_en: false, custom_chapter_en: '' }))}
                                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-2 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hindi / Sanskrit Book & Chapter Column */}
                      <div className="space-y-4">
                        <h4 className="font-black text-xs text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                          🇮🇳 हिंदी / संस्कृत पुस्तक एवं अध्याय (Hindi / Sanskrit Book & Chapter)
                        </h4>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">पुस्तक का नाम (Book Name - Hindi / Sanskrit)</label>
                          {!suggestData.is_custom_book_hi ? (
                            <input 
                              type="text" 
                              name="book_name_hi" 
                              value={suggestData.book_name_hi} 
                              onChange={handleSuggestChange} 
                              placeholder="जैसे: रुचिरा प्रथमो भागः / वसंत" 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-orange-900" 
                            />
                          ) : (
                            <input 
                              type="text" 
                              name="book_name_hi" 
                              value={suggestData.book_name_hi} 
                              onChange={handleSuggestChange} 
                              placeholder="कस्टम पुस्तक नाम..." 
                              className="w-full bg-white border-2 border-orange-500 rounded-md px-3 py-2 text-sm font-bold text-gray-800" 
                            />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">अध्याय / पाठ का नाम (Chapter Name - Hindi / Sanskrit)</label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <select 
                                name="chapter_prefix_hi" 
                                value={suggestData.chapter_prefix_hi} 
                                onChange={handleSuggestChange}
                                className="bg-orange-50 border border-orange-400 rounded-md px-2 py-1.5 text-xs font-bold text-orange-900"
                              >
                                <option value="अध्याय">अध्याय</option>
                                <option value="पाठ">पाठ</option>
                                <option value="प्रथमः पाठः">प्रथमः पाठः</option>
                              </select>
                              <input 
                                type="text" 
                                name="chapter_num_hi" 
                                value={suggestData.chapter_num_hi} 
                                onChange={handleSuggestChange}
                                placeholder="1"
                                className="w-12 bg-white border border-orange-400 rounded-md px-2 py-1.5 text-xs font-bold text-center"
                              />
                            </div>
                            <input 
                              type="text" 
                              name="chapter_name_hi" 
                              value={suggestData.chapter_name_hi} 
                              onChange={handleSuggestChange} 
                              placeholder="जैसे: सुभाषितानि / मातृभूमि" 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-orange-900" 
                            />
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* MULTIPLE IMAGE URLS SUPPORT FIELD */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                      <label className="block text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                        <ImageIcon size={16} /> Question Image URL(s) - (Multiple URLs separated by commas or spaces)
                      </label>
                      <textarea 
                        name="image_url" 
                        rows="2"
                        value={suggestData.image_url} 
                        onChange={handleSuggestChange} 
                        placeholder="https://example.com/img1.png, https://example.com/img2.png" 
                        className="w-full bg-white border border-emerald-300 rounded-md px-3 py-2 text-xs font-medium text-emerald-950" 
                      />
                      {suggestData.image_url && (
                        <div className="mt-2 p-2 bg-white rounded border border-emerald-200">
                          <p className="text-[10px] font-bold text-gray-500 mb-1">Image Preview(s):</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestData.image_url.split(/[\s,]+/).filter(Boolean).map((url, i) => (
                              <img 
                                key={i}
                                src={url.trim()} 
                                alt={`Preview ${i+1}`} 
                                className="h-20 object-contain rounded border border-gray-200"
                                onError={(e) => { e.target.style.display = 'none'; }} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SIDE-BY-SIDE SEPARATE ENGLISH AND HINDI MEDIUM & QUESTION TYPE SECTIONS WITH EXACT 1 TO 8 HEADINGS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3 border-t border-gray-200">
                      
                      {/* LEFT COLUMN: ENGLISH MEDIUM SETUP */}
                      <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                          <h4 className="font-black text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                            🇬🇧 English Question Type & Heading Setup
                          </h4>
                          <span className="text-xs bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded">Medium: English</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Select Heading / Question Type (English & Sub-Headings)</label>
                          {!suggestData.is_custom_q_type_en ? (
                            <select 
                              name="question_type_en" 
                              value={suggestData.question_type_en} 
                              onChange={handleSuggestChange} 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-bold text-blue-900 cursor-pointer"
                            >
                              <optgroup label="1. MCQ">
                                <option value="MCQ">MCQ</option>
                                <option value="Multiple Choice Questions">Multiple Choice Questions</option>
                                <option value="Objective Type Questions">Objective Type Questions</option>
                                <option value="Tick (✓) the correct option">Tick (✓) the correct option</option>
                              </optgroup>
                              <optgroup label="2. Blank Space">
                                <option value="Blank Space">Blank Space</option>
                                <option value="Fill in the blanks">Fill in the blanks</option>
                              </optgroup>
                              <optgroup label="3. Matchings">
                                <option value="Matchings">Matchings</option>
                                <option value="Match the Following">Match the Following</option>
                              </optgroup>
                              <optgroup label="4. True / False">
                                <option value="True/False">True/False</option>
                              </optgroup>
                              <optgroup label="5. Who Said To Whom">
                                <option value="Who Said To Whom ?">Who Said To Whom ?</option>
                              </optgroup>
                              <optgroup label="6. Very Short">
                                <option value="Very Short">Very Short</option>
                                <option value="Very Short Answer Type Questions">Very Short Answer Type Questions</option>
                              </optgroup>
                              <optgroup label="7. Short">
                                <option value="Short">Short</option>
                                <option value="Short Answer Type Questions">Short Answer Type Questions</option>
                              </optgroup>
                              <optgroup label="8. Long">
                                <option value="Long">Long</option>
                                <option value="Long Answer Type Questions">Long Answer Type Questions</option>
                                <option value="Essay Type Questions">Essay Type Questions</option>
                              </optgroup>
                              <option value="__ADD_NEW_Q_TYPE_EN__" className="text-emerald-700 font-black">➕ Add New English Type / Sub-Heading...</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                name="custom_question_type_en" 
                                value={suggestData.custom_question_type_en} 
                                onChange={handleSuggestChange} 
                                placeholder="Custom English Question Type or Sub-Heading..." 
                                className="w-full bg-white border-2 border-blue-500 rounded-md px-3 py-2 text-xs font-bold text-gray-800" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setSuggestData(prev => ({ ...prev, is_custom_q_type_en: false, custom_question_type_en: '' }))}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-1.5 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Question Text (English)</label>
                          <textarea 
                            name="question_text" 
                            rows="2" 
                            value={suggestData.question_text} 
                            onChange={handleSuggestChange} 
                            placeholder="Enter question in English / Sanskrit..." 
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-medium"
                          ></textarea>
                        </div>

                        <div className="space-y-2 bg-white p-3 rounded-lg border border-blue-200">
                          <label className="block text-[11px] font-bold text-blue-900 uppercase">English Options (A, B, C, D)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" name="option_a" value={suggestData.option_a} onChange={handleSuggestChange} placeholder="Option A" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_b" value={suggestData.option_b} onChange={handleSuggestChange} placeholder="Option B" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_c" value={suggestData.option_c} onChange={handleSuggestChange} placeholder="Option C" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_d" value={suggestData.option_d} onChange={handleSuggestChange} placeholder="Option D" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Correct Answer (English)</label>
                          <input type="text" name="correct_answer" value={suggestData.correct_answer} onChange={handleSuggestChange} placeholder="Correct Answer (Eng)" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-bold" />
                        </div>
                      </div>

                      {/* RIGHT COLUMN: HINDI / SANSKRIT MEDIUM SETUP */}
                      <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                          <h4 className="font-black text-xs text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                            🇮🇳 हिंदी / संस्कृत प्रश्न प्रकार एवं शीर्षक (Hindi / Sanskrit Medium Setup)
                          </h4>
                          <span className="text-xs bg-orange-600 text-white font-bold px-2.5 py-0.5 rounded">Medium: Hindi / Sanskrit</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">शीर्षक / प्रश्न प्रकार चुनें (Hindi / Sanskrit & Sub-Headings)</label>
                          {!suggestData.is_custom_q_type_hi ? (
                            <select 
                              name="question_type_hi" 
                              value={suggestData.question_type_hi} 
                              onChange={handleSuggestChange} 
                              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-bold text-orange-900 cursor-pointer"
                            >
                              <optgroup label="1. वस्तुनिष्ठ प्रश्न">
                                <option value="बहुविकल्पात्मक प्रश्न">बहुविकल्पात्मक प्रश्न</option>
                                <option value="वस्तुनिष्ठ प्रश्न">वस्तुनिष्ठ प्रश्न</option>
                                <option value="सही विकल्प पर (✓) निशान लगाएँ">सही विकल्प पर (✓) निशान लगाएँ</option>
                              </optgroup>
                              <optgroup label="2. रिक्त स्थान">
                                <option value="रिक्त स्थान भरिए">रिक्त स्थान भरिए</option>
                                <option value="रिक्त स्थानों की पूर्ति कीजिए">रिक्त स्थानों की पूर्ति कीजिए</option>
                              </optgroup>
                              <optgroup label="3. मिलान करने वाले प्रश्न">
                                <option value="सही मिलान कीजिए">सही मिलान कीजिए</option>
                                <option value="मिलान कीजिए">मिलान कीजिए</option>
                              </optgroup>
                              <optgroup label="4. सत्य / असत्य">
                                <option value="सत्य / असत्य">सत्य / असत्य</option>
                                <option value="सत्य या असत्य लिखिए">सत्य या असत्य लिखिए</option>
                              </optgroup>
                              <optgroup label="5. किसने किससे कहा?">
                                <option value="किसने किससे कहा?">किसने किससे कहा?</option>
                              </optgroup>
                              <optgroup label="6. अतिलघूत्तरात्मक प्रश्न">
                                <option value="अतिलघूत्तरात्मक प्रश्न">अतिलघूत्तरात्मक प्रश्न</option>
                              </optgroup>
                              <optgroup label="7. लघूत्तरात्मक प्रश्न">
                                <option value="लघूत्तरात्मक प्रश्न">लघूत्तरात्मक प्रश्न</option>
                              </optgroup>
                              <optgroup label="8. दीर्घउत्तरात्मक / निबन्धात्मक प्रश्न">
                                <option value="दीर्घउत्तरात्मक प्रश्न">दीर्घउत्तरात्मक प्रश्न</option>
                                <option value="निबन्धात्मक प्रश्न">निबन्धात्मक प्रश्न</option>
                              </optgroup>
                              <option value="__ADD_NEW_Q_TYPE_HI__" className="text-emerald-700 font-black">➕ Add New Hindi Type / Sub-Heading...</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                name="custom_question_type_hi" 
                                value={suggestData.custom_question_type_hi} 
                                onChange={handleSuggestChange} 
                                placeholder="नया हिंदी/संस्कृत प्रश्न प्रकार या उप-शीर्षक..." 
                                className="w-full bg-white border-2 border-orange-500 rounded-md px-3 py-2 text-xs font-bold text-gray-800" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setSuggestData(prev => ({ ...prev, is_custom_q_type_hi: false, custom_question_type_hi: '' }))}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-1.5 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Question Text (प्रश्न हिंदी / संस्कृत में)</label>
                          <textarea 
                            name="question_text_hi" 
                            rows="2" 
                            value={suggestData.question_text_hi} 
                            onChange={handleSuggestChange} 
                            placeholder="हिंदी या संस्कृत में प्रश्न लिखें..." 
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-medium"
                          ></textarea>
                        </div>

                        <div className="space-y-2 bg-white p-3 rounded-lg border border-orange-200">
                          <label className="block text-[11px] font-bold text-orange-900 uppercase">Hindi Options (विकल्प अ, ब, स, द)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" name="option_a_hi" value={suggestData.option_a_hi} onChange={handleSuggestChange} placeholder="विकल्प (अ)" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_b_hi" value={suggestData.option_b_hi} onChange={handleSuggestChange} placeholder="विकल्प (ब)" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_c_hi" value={suggestData.option_c_hi} onChange={handleSuggestChange} placeholder="विकल्प (स)" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                            <input type="text" name="option_d_hi" value={suggestData.option_d_hi} onChange={handleSuggestChange} placeholder="विकल्प (द)" className="w-full bg-slate-50 border border-gray-300 rounded px-2 py-1 text-xs" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-700">Correct Answer (सही उत्तर)</label>
                          <input type="text" name="correct_answer_hi" value={suggestData.correct_answer_hi} onChange={handleSuggestChange} placeholder="सही उत्तर (हिंदी/संस्कृत)" className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs font-bold" />
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Marks (अंक)</label>
                        <input type="number" name="marks" value={suggestData.marks} onChange={handleSuggestChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:to-cyan-800 text-white font-extrabold px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 border-b-6 border-teal-950 active:border-b-0 active:translate-y-1.5 transition-all shadow-xl text-sm uppercase tracking-wider ring-2 ring-emerald-300 cursor-pointer">
                        <Send size={18} /> Send for Super Admin Approval
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* BULK IMPORT TAB */}
              {activeTab === 'bulk-import' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 font-sans">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800">Advanced Multi-Chapter Question Bank Importer</h2>
                        <p className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
                          Class, Subject, Book aur Medium ek baar select karein aur sabhi chapters के questions ek sath upload karein.
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

                    {bulkStatusMsg.text && (
                      <div className={`p-4 rounded-2xl mb-6 font-bold text-sm flex items-center gap-3 shadow-sm ${
                        bulkStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200' : 'bg-rose-50 text-rose-800 border-2 border-rose-200'
                      }`}>
                        {bulkStatusMsg.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
                        <span>{bulkStatusMsg.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Target Class</label>
                        <select value={bulkClass} onChange={(e) => handleClassChange(e, 'bulk')} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 cursor-pointer">
                          <option value="">-- Select Class / कक्षा चुनें --</option>
                          {classList.map((cls) => <option key={cls} value={cls}>{getClassLabelByMedium(cls, 'English')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Subject Name</label>
                        <select value={bulkSubject} onChange={(e) => {
                          const sub = e.target.value;
                          setBulkSubject(sub);
                          setBulkBook('Main Book');
                          setIsCustomBulkBook(false);
                          setCustomBulkBook('');
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 cursor-pointer">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Select Book (किताब)</label>
                        {!isCustomBulkBook ? (
                          <select 
                            value={bulkBook} 
                            onChange={handleBulkBookChange} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 cursor-pointer"
                          >
                            <option value="">-- Select Book --</option>
                            {bulkAvailableBooks.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                            <option value="__ADD_NEW_BOOK__" className="text-emerald-700 font-black">➕ Add New Book...</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="text" 
                              value={customBulkBook} 
                              onChange={(e) => setCustomBulkBook(e.target.value)} 
                              placeholder="Type New Book..." 
                              className="w-full bg-white border-2 border-emerald-500 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 shadow-inner"
                            />
                            <button 
                              type="button" 
                              onClick={() => { setIsCustomBulkBook(false); setBulkBook('Main Book'); setCustomBulkBook(''); }}
                              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-2 rounded-xl"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Medium</label>
                        <select value={bulkMedium} onChange={(e) => setBulkMedium(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 cursor-pointer">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    {bulkSubTab === 'excel' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-center mb-3">
                            <div className="bg-indigo-100 text-indigo-700 p-4 rounded-full">
                              <Upload size={32} />
                            </div>
                          </div>
                          <h3 className="text-base font-black text-slate-800">Upload Multi-Chapter CSV File</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1 mb-4">CSV Format: [chapter_name, question_type, question_text, image_url, correct_answer, marks]</p>
                          
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

                    {bulkSubTab === 'json' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                              Paste JSON Array Format [...] (Include <code className="text-indigo-600 font-bold">&quot;chapter_name&quot;</code> and <code className="text-indigo-600 font-bold">&quot;image_url&quot;</code>)
                            </label>
                            <span className="text-[11px] font-bold text-indigo-600">All Chapters & Question Types Supported</span>
                          </div>

                          <textarea
                            rows={10}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder={`[\n  {\n    "chapter_name": "अध्याय - 1",\n    "question_type": "बहुविकल्पात्मक प्रश्न",\n    "question_text": "Observe image:",\n    "image_url": "url1.jpg, url2.jpg",\n    "correct_answer": "A",\n    "marks": 1\n  }\n]`}
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

              {/* ADMIN APPROVALS TAB WITH OPTIONS SHOWN */}
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
                          <th className="p-3.5">Chapter Name</th>
                          <th className="p-3.5">Question, Options & Images</th>
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
                                {getClassLabelByMedium(q.class_name, 'English')} <br/>
                                <span className="text-xs text-gray-500">{q.subject_name} ({q.book_name || 'Main Book'})</span><br/>
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">{q.medium || 'English'}</span>
                              </td>
                              <td className="p-3.5 text-gray-600">{q.chapter_name}</td>
                              <td className="p-3.5 text-gray-800 space-y-1.5">
                                <p className="font-semibold">{q.question_text} {q.question_text_hi ? `/ ${q.question_text_hi}` : ''} <span className="text-xs text-indigo-600 font-bold">[{q.question_type}]</span></p>
                                
                                {/* Options Display in Admin Approval */}
                                {(q.option_a || q.option_a_hi || q.option_b || q.option_b_hi || q.option_c || q.option_c_hi || q.option_d || q.option_d_hi) && (
                                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-bold">
                                    {q.option_a && <div>A) {q.option_a}</div>}
                                    {q.option_b && <div>B) {q.option_b}</div>}
                                    {q.option_c && <div>C) {q.option_c}</div>}
                                    {q.option_d && <div>D) {q.option_d}</div>}
                                    {q.option_a_hi && <div>अ) {q.option_a_hi}</div>}
                                    {q.option_b_hi && <div>ब) {q.option_b_hi}</div>}
                                    {q.option_c_hi && <div>स) {q.option_c_hi}</div>}
                                    {q.option_d_hi && <div>द) {q.option_d_hi}</div>}
                                  </div>
                                )}

                                {renderQuestionImages(q)}
                              </td>
                              <td className="p-3.5 text-green-600 font-semibold">{q.correct_answer} {q.correct_answer_hi ? `/ ${q.correct_answer_hi}` : ''}</td>
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

              {/* MANUAL PICKER TAB WITH CONFIGURATION */}
              {activeTab === 'manual' && (
                <div className="space-y-6">
                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5">
                    <h3 className="text-sm font-bold text-[#1B3A6B] flex items-center gap-2">
                      <Search size={18} className="text-[#2F6690]" /> Manual Question Picker
                    </h3>
                  </div>

                  <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 border border-purple-500/30">
                    <div className="flex items-center gap-3 font-extrabold text-sm uppercase tracking-wide">
                      <CheckSquare size={20} className="text-yellow-400" />
                      <div>
                        <div>SELECTED QUESTIONS: <span className="text-yellow-300 text-lg">{selectedManualQuestions.length}</span></div>
                        <div className="text-xs text-cyan-200 mt-0.5">
                          TOTAL MARKS SELECTED: <span className="text-yellow-300 font-bold">{totalSelectedMarks}</span> / <span className="text-white font-bold">{totalManualMaxMarks} MARKS</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">MCQ: {countMCQ}/{manualConfig.mcqQty} ({countMCQ * manualConfig.mcqMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Blank: {countBlank}/{manualConfig.blankQty} ({countBlank * manualConfig.blankMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Matching: {countMatching}/{manualConfig.matchingQty} ({countMatching * manualConfig.matchingMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">T/F: {countTF}/{manualConfig.tfQty} ({countTF * manualConfig.tfMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Who Said: {countWhoSaid}/{manualConfig.whoSaidQty} ({countWhoSaid * manualConfig.whoSaidMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">V.Short: {countVShort}/{manualConfig.vShortQty} ({countVShort * manualConfig.vShortMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Short: {countShort}/{manualConfig.shortQty} ({countShort * manualConfig.shortMarks}m)</span>
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Long: {countLong}/{manualConfig.longQty} ({countLong * manualConfig.longMarks}m)</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Select Class (कक्षा)</label>
                        <select name="selectedClass" value={manualData.selectedClass} onChange={(e) => handleClassChange(e, 'manual')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          <option value="">-- Select Class / कक्षा चुनें --</option>
                          {classList.map((cls) => <option key={cls} value={cls}>{getClassLabelByMedium(cls, 'English')}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject Name (विषय)</label>
                        <select name="subject_name" value={manualData.subject_name} onChange={handleManualChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Medium (माध्यम)</label>
                        <select name="medium" value={manualData.medium} onChange={handleManualChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-blue-700">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">📚 Select Book (किताब)</label>
                        <select name="selectedBook" value={manualData.selectedBook} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          {availableManualBooks.length === 0 ? <option value="">No Books Available</option> : null}
                          {availableManualBooks.map((book) => <option key={book} value={book}>{book}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">📖 Select Chapter Name (अध्याय / पाठ)</label>
                        <select name="selectedChapter" value={manualData.selectedChapter} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          {availableManualChapters.length === 0 ? <option value="">No Chapters Available</option> : null}
                          {availableManualChapters.map((chap) => <option key={chap} value={chap}>{chap}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">⚡ Question Type (प्रश्न प्रकार)</label>
                        <select name="selectedQuestionType" value={manualData.selectedQuestionType} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-indigo-700">
                          <option value="All">All Types (सभी)</option>
                          {Array.from(new Set(loadedQuestions.map(q => q.question_type ? q.question_type.trim() : '').filter(Boolean))).map((qType) => (
                            <option key={qType} value={qType}>{qType}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase">🔍 Source Type</label>
                        <select name="sourceType" value={manualData.sourceType} onChange={handleManualChange} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          <option value="Global Question Bank">Global Question Bank</option>
                          <option value="School Custom Questions">School Custom Questions</option>
                          <option value="Both">Both (दोनों)</option>
                        </select>
                      </div>
                    </div>

                    {/* MANUAL CONFIGURATION FIELDS (RESTORED) */}
                    <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-4 space-y-3">
                      <h4 className="text-xs font-black text-[#1B3A6B] uppercase tracking-wider">
                        Manual Section-wise Quantity & Marks Setup (Target limits for Manual Picker)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">1. MCQ</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="mcqQty" value={manualConfig.mcqQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="mcqMarks" value={manualConfig.mcqMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">2. Blank Space</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="blankQty" value={manualConfig.blankQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="blankMarks" value={manualConfig.blankMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">3. Matchings</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="matchingQty" value={manualConfig.matchingQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="matchingMarks" value={manualConfig.matchingMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">4. True/False</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="tfQty" value={manualConfig.tfQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="tfMarks" value={manualConfig.tfMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">5. Who Said To Whom</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="whoSaidQty" value={manualConfig.whoSaidQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="whoSaidMarks" value={manualConfig.whoSaidMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">6. Very Short</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="vShortQty" value={manualConfig.vShortQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="vShortMarks" value={manualConfig.vShortMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">7. Short</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="shortQty" value={manualConfig.shortQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="shortMarks" value={manualConfig.shortMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded border border-slate-200">
                          <span className="text-[11px] font-bold text-blue-950 block mb-1">8. Long</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[9px] text-gray-500 block">Qty</label>
                              <input type="number" name="longQty" value={manualConfig.longQty} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-500 block">Marks</label>
                              <input type="number" step="0.5" name="longMarks" value={manualConfig.longMarks} onChange={handleManualConfigChange} className="w-16 bg-slate-50 border rounded px-1.5 py-0.5 text-xs font-bold" />
                            </div>
                          </div>
                        </div>
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
                        Is book, chapter ya question type ke anusaar koi question nahi mila.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
                              <th className="p-3.5 w-16 text-center">Select</th>
                              <th className="p-3.5 w-48">Type (प्रकार)</th>
                              <th className="p-3.5">Question Text & Images (प्रश्न)</th>
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
                                  <div className="font-medium">{renderQuestionText(q)}</div>
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

              {/* GENERATE PAPER TAB */}
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
                        <label className="block text-xs font-semibold text-gray-700">Select Class (कक्षा)</label>
                        <select name="selectedClass" value={formData.selectedClass} onChange={(e) => handleClassChange(e, 'generator')} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          <option value="">-- Select Class / कक्षा चुनें --</option>
                          {classList.map((cls) => <option key={cls} value={cls}>{getClassLabelByMedium(cls, 'English')}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Subject (विषय)</label>
                        <select name="subject" value={formData.subject} onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, subject: val, selectedBooks: [], selectedChapters: [] }));
                        }} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-800">
                          {availableSubjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Medium (माध्यम)</label>
                        <select name="medium" value={formData.medium} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-blue-700">
                          {mediumList.map((med) => <option key={med} value={med}>{med}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase">Select Book (किताब):</label>
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
                        <label className="block text-xs font-bold text-gray-700 uppercase">Select Chapter Name (अध्याय / पाठ):</label>
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

                  <div className="bg-[#F0F4F8] border border-[#CBD5E1] rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#1B3A6B] uppercase tracking-wider">
                        Section-wise Question Quantity & Marks Setup (Numbered Headings 1 to 8)
                      </h3>
                      <div className="bg-blue-900 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold shadow">
                        Total Paper Max Marks: <span className="text-yellow-300 text-sm">{totalGenerateMaxMarks}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['MCQ', 'Blank Space', 'Matchings', 'True/False', 'Who Said To Whom', 'Very Short', 'Short', 'Long'].map((qTypeKey, idx) => {
                        const qtyKey = qTypeKey === 'MCQ' ? 'mcqQty' : qTypeKey === 'Blank Space' ? 'blankQty' : qTypeKey === 'Matchings' ? 'matchingQty' : qTypeKey === 'True/False' ? 'tfQty' : qTypeKey === 'Who Said To Whom' ? 'whoSaidQty' : qTypeKey === 'Very Short' ? 'vShortQty' : qTypeKey === 'Short' ? 'shortQty' : 'longQty';
                        const marksKey = qTypeKey === 'MCQ' ? 'mcqMarks' : qTypeKey === 'Blank Space' ? 'blankMarks' : qTypeKey === 'Matchings' ? 'matchingMarks' : qTypeKey === 'True/False' ? 'tfMarks' : qTypeKey === 'Who Said To Whom' ? 'whoSaidMarks' : qTypeKey === 'Very Short' ? 'vShortMarks' : qTypeKey === 'Short' ? 'shortMarks' : 'longMarks';

                        return (
                          <div key={qTypeKey} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                            <span className="text-xs font-black text-blue-950 block">{getSectionHeaderLabel(qTypeKey, formData.medium, idx)}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase">Quantity (मात्रा)</label>
                                <input type="number" name={qtyKey} value={formData[qtyKey]} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-2 py-1 text-sm font-bold" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase">Marks/Q (अंक)</label>
                                <input type="number" step="0.5" name={marksKey} value={formData[marksKey]} onChange={handleChange} className="w-full bg-[#F8FAFC] border border-gray-300 rounded px-2 py-1 text-xs font-bold" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={handleGeneratePaper} 
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 border-b-8 border-red-900 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-2xl text-base ring-4 ring-orange-300 cursor-pointer disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />} 
                        Generate Question Paper (Auto Select)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}