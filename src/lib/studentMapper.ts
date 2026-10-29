export interface PSPStudentRecord {
  s_no: string;
  session: string;
  student_nic_id: string;
  sr_no: string;
  aadhar_number: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  gender: string;
  social_category: string;
  religion: string;
  mother_tongue: string;
  rural_urban: string;
  habitation_or_locality: string;
  date_of_admission: string;
  admission_number: string;
  belong_to_bpl: string;
  belong_to_disadvantaged_group: string;
  getting_free_education: string;
  studying_in_class: string;
  class_studied_in_prev_year: string;
  class_1_prev_status: string;
  days_attended_prev_year: string;
  medium_of_instruction: string;
  type_of_disability: string;
  cwsn_facilities: string;
  no_of_uniform_sets: string;
  free_text_books: string;
  free_transport: string;
  free_escort: string;
  mdm_beneficiary: string;
  free_hostel_facility: string;
  special_training_attended: string;
  last_exam_appeared: string;
  last_exam_passed: string;
  last_exam_percentage: string;
  stream_11_12: string;
  trade_sector_9_to_12: string;
  iron_folic_acid_tablets: string;
  deworming_tablets: string;
  vitamin_a_supplement: string;
  mobile_number: string;
  email_address: string;
}

export function mapHtmlRowToPSPStudent(cols: NodeListOf<HTMLTableCellElement>): PSPStudentRecord {
  return {
    s_no: cols[0]?.innerText?.trim() || '',
    session: cols[1]?.innerText?.trim() || '',
    student_nic_id: cols[2]?.innerText?.trim() || '',
    sr_no: cols[3]?.innerText?.trim() || '',
    aadhar_number: cols[4]?.innerText?.trim() || '',
    student_name: cols[5]?.innerText?.trim() || '',
    father_name: cols[6]?.innerText?.trim() || '',
    mother_name: cols[7]?.innerText?.trim() || '',
    dob: cols[8]?.innerText?.trim() || '',
    gender: cols[9]?.innerText?.trim() || '',
    social_category: cols[10]?.innerText?.trim() || '',
    religion: cols[11]?.innerText?.trim() || '',
    mother_tongue: cols[12]?.innerText?.trim() || '',
    rural_urban: cols[13]?.innerText?.trim() || '',
    habitation_or_locality: cols[14]?.innerText?.trim() || '',
    date_of_admission: cols[15]?.innerText?.trim() || '',
    admission_number: cols[16]?.innerText?.trim() || '',
    belong_to_bpl: cols[17]?.innerText?.trim() || '',
    belong_to_disadvantaged_group: cols[18]?.innerText?.trim() || '',
    getting_free_education: cols[19]?.innerText?.trim() || '',
    studying_in_class: cols[20]?.innerText?.trim() || '',
    class_studied_in_prev_year: cols[21]?.innerText?.trim() || '',
    class_1_prev_status: cols[22]?.innerText?.trim() || '',
    days_attended_prev_year: cols[23]?.innerText?.trim() || '',
    medium_of_instruction: cols[24]?.innerText?.trim() || '',
    type_of_disability: cols[25]?.innerText?.trim() || '',
    cwsn_facilities: cols[26]?.innerText?.trim() || '',
    no_of_uniform_sets: cols[27]?.innerText?.trim() || '',
    free_text_books: cols[28]?.innerText?.trim() || '',
    free_transport: cols[29]?.innerText?.trim() || '',
    free_escort: cols[30]?.innerText?.trim() || '',
    mdm_beneficiary: cols[31]?.innerText?.trim() || '',
    free_hostel_facility: cols[32]?.innerText?.trim() || '',
    special_training_attended: cols[33]?.innerText?.trim() || '',
    last_exam_appeared: cols[34]?.innerText?.trim() || '',
    last_exam_passed: cols[35]?.innerText?.trim() || '',
    last_exam_percentage: cols[36]?.innerText?.trim() || '',
    stream_11_12: cols[37]?.innerText?.trim() || '',
    trade_sector_9_to_12: cols[38]?.innerText?.trim() || '',
    iron_folic_acid_tablets: cols[39]?.innerText?.trim() || '',
    deworming_tablets: cols[40]?.innerText?.trim() || '',
    vitamin_a_supplement: cols[41]?.innerText?.trim() || '',
    mobile_number: cols[42]?.innerText?.trim() || '',
    email_address: cols[43]?.innerText?.trim() || '',
  };
}