import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Schools ────────────────────────────────────────────────────────────────────
const SCHOOLS = [
  { name: 'School of Engineering and Technology', abbreviation: 'SET' },
  { name: 'School of Health Science',             abbreviation: 'HS'  },
  { name: 'School of Management Science',         abbreviation: 'MGT' },
  { name: 'School of Agriculture',                abbreviation: 'AGT' },
  { name: 'School of Education',                  abbreviation: 'EDC' },
];

// ── SET Departments ────────────────────────────────────────────────────────────
const SET_DEPARTMENTS = [
  { name: 'General Education',                         code: 'GEN' },
  { name: 'Computer Engineering',                      code: 'CEB' },
  { name: 'Telecommunications',  code: 'CTB' },
  { name: 'Electrical Engineering',                    code: 'EEB' },
  { name: 'Mechanical Engineering',                    code: 'MEB' },
  { name: 'Mechanical Technology',                     code: 'MTB' },
  { name: 'Civil Engineering',                         code: 'CIB' },
  { name: 'Building and Construction Engineering',     code: 'BCB' },
  { name: 'Public Works Engineering',                  code: 'PWB' },
  { name: 'Urban Planning',                            code: 'UPB' },
];

// ── Courses ────────────────────────────────────────────────────────────────────
// [code, name, deptCode, level, credits, isShared]
type CourseRow = [string, string, string, string, number, boolean];

const COURSES: CourseRow[] = [
  // GENERAL EDUCATION — universal courses all L200 students attend
  ['FRE101', 'Functional French I',   'GEN', 'L200', 2, false],
  ['FRE102', 'Functional French II',  'GEN', 'L200', 2, false],
  ['ENG101', 'Use of English I',      'GEN', 'L200', 2, false],
  ['ENG102', 'Use of English II',     'GEN', 'L200', 2, false],
  ['SPT100', 'Sports',                'GEN', 'L200', 1, false],
  ['CVE102', 'Civics and Ethics',     'GEN', 'L200', 2, false],

  // CEB — Computer Engineering
  ['CEB201', 'Analysis',                                               'CEB', 'L200', 3, false],
  ['CEB203', 'General Algebra',                                        'CEB', 'L200', 3, false],
  ['CEB205', 'Introduction to Algorithms and Programming',             'CEB', 'L200', 3, true],
  ['CEB207', 'Boolean Algebra and Logic Circuits',                     'CEB', 'L200', 3, false],
  ['CEB202', 'Java Programming',                                       'CEB', 'L200', 3, false],
  ['CEB204', 'Computer Architecture',                                  'CEB', 'L200', 3, false],
  ['CEB206', 'Discrete Mathematics',                                   'CEB', 'L200', 3, false],
  ['CEB210', 'Linear Algebra',                                         'CEB', 'L200', 3, false],
  ['CEB301', 'Probability and Statistics',                             'CEB', 'L300', 3, true],
  ['CEB303', 'Data Structures and Algorithms',                         'CEB', 'L300', 3, true],
  ['CEB305', 'Operating Systems',                                      'CEB', 'L300', 3, false],
  ['CEB307', 'Computer Networks',                                      'CEB', 'L300', 3, false],
  ['CEB309', 'Hardware and Software Maintenance',                      'CEB', 'L300', 3, false],
  ['CEB311', 'Operations Research',                                    'CEB', 'L300', 3, false],
  ['CEB313', 'Object Oriented Programming (Java/C++)',                 'CEB', 'L300', 3, false],
  ['CEB315', 'Database Fundamentals and Design',                       'CEB', 'L300', 3, false],
  ['CEB302', 'Computer Security and Cryptosystems',                    'CEB', 'L300', 3, false],
  ['CEB304', 'Analysis and Design of Algorithms',                      'CEB', 'L300', 3, false],
  ['CEB306', 'Tools and Numerical Methods for Engineering',            'CEB', 'L300', 3, false],
  ['CEB312', 'System Administration (Unix, Linux, Windows)',           'CEB', 'L300', 3, false],
  ['CEB401', 'Software Engineering Process and Requirement Engineering','CEB', 'L400', 3, false],
  ['CEB403', 'Object Oriented Modeling and UML',                       'CEB', 'L400', 3, false],
  ['CEB405', 'Database Practice',                                      'CEB', 'L400', 3, true],
  ['CEB407', 'Software Engineering and Design',                        'CEB', 'L400', 3, true],
  ['CEB409', 'Advanced Operating Systems',                             'CEB', 'L400', 3, false],
  ['CEB411', 'Analysis and Design of Information Systems',             'CEB', 'L400', 3, false],
  ['CEB413', 'Security of Information Systems and Cyber Security',     'CEB', 'L400', 3, true],
  ['CEB415', 'Software Development Tools (IDE and Frameworks)',        'CEB', 'L400', 3, false],
  ['CEB421', 'Switching and Routing Protocols I',                      'CEB', 'L400', 3, false],
  ['CEB423', 'Networks and Protocols',                                 'CEB', 'L400', 3, false],
  ['CEB425', 'Data Communication and Computer Networks',               'CEB', 'L400', 3, false],
  ['CEB427', 'Optical Network Communication',                          'CEB', 'L400', 3, true],
  ['CEB429', 'Mobile Networks and Wireless Communication',             'CEB', 'L400', 3, true],
  ['CEB431', 'Network Security Fundamentals',                          'CEB', 'L400', 3, false],
  ['CEB433', 'Computer Network Laboratory II',                         'CEB', 'L400', 2, false],
  ['CEB435', 'Network Architectures and Dimensioning',                 'CEB', 'L400', 3, false],
  ['CEB437', 'Enterprise IP Telephony and Video Network',              'CEB', 'L400', 3, false],
  ['CEB404', 'Data Warehouse and Data Mining',                         'CEB', 'L400', 3, false],
  ['CEB406', 'Cloud Computing and Big Data Analytics',                 'CEB', 'L400', 3, false],
  ['CEB408', 'XML and Document Content Description',                   'CEB', 'L400', 3, false],
  ['CEB410', 'Software Verification and Validation Techniques',        'CEB', 'L400', 3, false],
  ['CEB414', 'Software Quality: Tools and Methods',                    'CEB', 'L400', 3, false],
  ['CEB416', 'Artificial Intelligence and Machine Learning',           'CEB', 'L400', 3, false],
  ['CEB418', 'Human Computer Interface',                               'CEB', 'L400', 3, false],
  ['CEB422', 'Switching and Routing Protocols II',                     'CEB', 'L400', 3, false],
  ['CEB424', 'Storage Network Technologies and Security',              'CEB', 'L400', 3, false],
  ['CEB434', 'Network Administration',                                 'CEB', 'L400', 3, false],

  // CTB — Computer Technology (Telecommunications)
  ['CTB201', 'Mathematics for Engineering (Algebra and Analysis)',     'CTB', 'L200', 3, false],
  ['CTB203', 'Fundamentals of Computer Programming',                   'CTB', 'L200', 3, true],
  ['CTB205', 'Local Area Computer Networks',                           'CTB', 'L200', 3, false],
  ['CTB207', 'Information Systems and Concepts',                       'CTB', 'L200', 3, false],
  ['CTB209', 'Fundamentals of Database and Design',                    'CTB', 'L200', 3, false],
  ['CTB211', 'Switching and Routing',                                  'CTB', 'L200', 3, false],
  ['CTB213', 'Signals and Systems',                                    'CTB', 'L200', 3, true],
  ['CTB202', 'Discrete Structures',                                    'CTB', 'L200', 3, false],
  ['CTB204', 'Computer Organisation and Architecture',                 'CTB', 'L200', 3, false],
  ['CTB208', 'Object Oriented Programming',                            'CTB', 'L200', 3, false],
  ['CTB212', 'Operating Systems',                                      'CTB', 'L200', 3, false],
  ['CTB220', 'Basic Telecommunication',                                'CTB', 'L200', 3, false],
  ['CTB301', 'Probability and Statistics',                             'CTB', 'L300', 3, true],
  ['CTB303', 'Embedded Systems',                                       'CTB', 'L300', 3, true],
  ['CTB305', 'Systems Engineering and Industry Practice',              'CTB', 'L300', 3, false],
  ['CTB307', 'Data Structures and Algorithms',                         'CTB', 'L300', 3, true],
  ['CTB309', 'Dynamic Web Programming and JEE',                       'CTB', 'L300', 3, false],
  ['CTB311', 'Analysis and Design of Information Systems',             'CTB', 'L300', 3, false],
  ['CTB313', 'Scripting Languages',                                    'CTB', 'L300', 3, false],
  ['CTB315', 'Object Oriented Modelling and UML',                      'CTB', 'L300', 3, false],
  ['CTB317', 'Computer Graphics Design and Concepts',                  'CTB', 'L300', 3, false],
  ['CTB321', 'CTB321 (Course name to be confirmed)',                   'CTB', 'L300', 3, false],
  ['CTB323', 'CTB323 (Course name to be confirmed)',                   'CTB', 'L300', 3, false],
  ['CTB325', 'Digital Signal Processing',                              'CTB', 'L300', 3, false],
  ['CTB306', 'Mobile Application Development',                         'CTB', 'L300', 3, false],
  ['CTB308', 'Software Testing Methodologies',                         'CTB', 'L300', 3, false],
  ['CTB310', 'Analysis and Design of Algorithms',                      'CTB', 'L300', 3, false],
  ['CTB312', 'Software Process and Quality',                           'CTB', 'L300', 3, false],
  ['CTB314', 'Enterprise Systems and Architectures',                   'CTB', 'L300', 3, false],
  ['CTB401', 'System Administration (Linux, Unix, Windows)',           'CTB', 'L400', 3, false],
  ['CTB403', 'Cloud Computing and Concepts',                           'CTB', 'L400', 3, false],
  ['CTB405', 'Software Construction and Evolution',                    'CTB', 'L400', 3, true],
  ['CTB407', 'Full Stack Web Development Technologies',                'CTB', 'L400', 3, false],
  ['CTB409', 'Information Systems Security',                           'CTB', 'L400', 3, true],
  ['CTB411', 'Database Administration',                                'CTB', 'L400', 3, true],
  ['CTB413', 'Data Analysis and Machine Learning',                     'CTB', 'L400', 3, false],
  ['CTB415', 'Mobile Communications and Protocols',                    'CTB', 'L400', 3, true],
  ['CTB417', 'Analog and Digital Communication',                       'CTB', 'L400', 3, false],
  ['CTB419', 'Optical Network Communication',                          'CTB', 'L400', 3, true],
  ['CTB423', 'Digital Radio and TV',                                   'CTB', 'L400', 3, false],
  ['CTB402', 'Fundamentals of Big Data Analytics',                     'CTB', 'L400', 3, false],
  ['CTB404', 'Data Warehouse and Data Mining',                         'CTB', 'L400', 3, false],
  ['CTB406', 'Artificial Intelligence and Expert Systems',             'CTB', 'L400', 3, false],
  ['CTB408', 'Data Storage and Management Technologies',               'CTB', 'L400', 3, false],
  ['CTB410', 'Human Computer Interface',                               'CTB', 'L400', 3, false],
  ['CTB412', 'Transmission Networks and Technologies',                 'CTB', 'L400', 3, false],
  ['CTB416', 'Telecommunication Network Management',                   'CTB', 'L400', 3, false],
  ['CTB420', 'Remote Sensing and Internet of Things',                  'CTB', 'L400', 3, false],

  // EEB — Electrical Engineering
  ['EEB201', 'Circuit Analysis',                                       'EEB', 'L200', 3, true],
  ['EEB203', 'Digital Electronics I',                                  'EEB', 'L200', 3, true],
  ['EEB205', 'Signals and Systems',                                    'EEB', 'L200', 3, true],
  ['EEB207', 'Fundamentals of Electrical Engineering',                 'EEB', 'L200', 3, true],
  ['EEB209', 'Physics for Engineering I',                              'EEB', 'L200', 3, true],
  ['EEB202', 'Analog Electronics I',                                   'EEB', 'L200', 3, false],
  ['EEB204', 'Physics for Engineering II',                             'EEB', 'L200', 3, false],
  ['EEB206', 'Control Engineering and Instrumentation',                'EEB', 'L200', 3, false],
  ['EEB208', 'Digital Electronics II',                                 'EEB', 'L200', 3, false],
  ['EEB301', 'Measurement and Instrumentation',                        'EEB', 'L300', 3, false],
  ['EEB303', 'Analog Electronics II',                                  'EEB', 'L300', 3, false],
  ['EEB305', 'Microcontrollers and Microprocessors',                   'EEB', 'L300', 3, true],
  ['EEB307', 'Technical Drawing and Introduction to CAD',              'EEB', 'L300', 3, false],
  ['EEB309', 'Fundamentals of Electrical Machines',                    'EEB', 'L300', 3, true],
  ['EEB311', 'Introduction to Renewable Energy',                       'EEB', 'L300', 3, false],
  ['EEB310', 'Sequence Control',                                       'EEB', 'L300', 3, false],
  ['EEB401', 'Electric Machines I',                                    'EEB', 'L400', 3, false],
  ['EEB403', 'Power Electronics and Control',                          'EEB', 'L400', 3, false],
  ['EEB407', 'Feedback Systems',                                       'EEB', 'L400', 3, false],
  ['EEB409', 'Electrical Power Systems Engineering I',                 'EEB', 'L400', 3, false],
  ['EEB413', 'Renewable Energy Components and Technologies',           'EEB', 'L400', 3, false],
  ['EEB415', 'Electrical Transmission Lines',                          'EEB', 'L400', 3, false],

  // ETB — Electrical Technology
  ['ETB201', 'Circuit Analysis',                                       'ETB', 'L200', 3, true],
  ['ETB203', 'Analog Electronics',                                     'ETB', 'L200', 3, false],
  ['ETB205', 'Digital Electronics I',                                  'ETB', 'L200', 3, true],
  ['ETB207', 'Fundamentals of Electrical Engineering',                 'ETB', 'L200', 3, true],
  ['ETB209', 'Physics for Engineering I',                              'ETB', 'L200', 3, true],
  ['ETB303', 'Fundamentals of Electrical Machines',                    'ETB', 'L300', 3, true],

  // MEB — Mechanical Engineering
  ['MEB201', 'Fundamentals of Mechanical Engineering',                 'MEB', 'L200', 3, false],
  ['MEB203', 'Mechanics I',                                            'MEB', 'L200', 3, true],
  ['MEB205', 'Introduction to Engineering Drawing',                    'MEB', 'L200', 3, true],
  ['MEB204', 'Mechanics II',                                           'MEB', 'L200', 3, false],
  ['MEB206', 'Introduction to Thermodynamics',                         'MEB', 'L200', 3, false],
  ['MEB303', 'Electrical Engineering for Mechanical Engineers I',      'MEB', 'L300', 3, false],
  ['MEB305', 'Thermodynamics',                                         'MEB', 'L300', 3, false],
  ['MEB307', 'Mechanical Vibrations',                                  'MEB', 'L300', 3, false],
  ['MEB309', 'Fluid Mechanics I',                                      'MEB', 'L300', 3, true],
  ['MEB311', 'Mechanics of Machine Elements',                          'MEB', 'L300', 3, true],
  ['MEB304', 'Electrical Engineering for Mechanical Engineers II',     'MEB', 'L300', 3, false],
  ['MEB308', 'Heat Transfer',                                          'MEB', 'L300', 3, false],
  ['MEB310', 'Fluid Mechanics II',                                     'MEB', 'L300', 3, false],
  ['MEB316', 'Machine Design I',                                       'MEB', 'L300', 3, false],
  ['MEB322', 'Microcomputer Systems I',                                'MEB', 'L300', 3, false],
  ['MEB401', 'Hydraulics and Pneumatics Systems',                      'MEB', 'L400', 3, false],
  ['MEB403', 'Cutting and Abrasive Machining of Materials',            'MEB', 'L400', 3, false],
  ['MEB405', 'Mechanics of Materials',                                 'MEB', 'L400', 3, false],
  ['MEB407', 'Composite Materials',                                    'MEB', 'L400', 3, false],
  ['MEB409', 'Principles of Plant Maintenance',                        'MEB', 'L400', 3, false],
  ['MEB413', 'Finite Element Analysis',                                'MEB', 'L400', 3, false],

  // MTB — Mechanical Technology
  ['MTB201', 'Mechanics I',                                            'MTB', 'L200', 3, true],
  ['MTB203', 'Engineering Graphics and CAD I',                         'MTB', 'L200', 3, true],
  ['MTB301', 'Machine Drawing Laboratory',                             'MTB', 'L300', 2, false],
  ['MTB303', 'Mechanics of Machine Elements',                          'MTB', 'L300', 3, true],
  ['MTB305', 'Manufacturing Technology',                               'MTB', 'L300', 3, false],
  ['MTB307', 'Thermodynamics I',                                       'MTB', 'L300', 3, false],
  ['MTB309', 'Fluid Mechanics I',                                      'MTB', 'L300', 3, true],
  ['MTB302', 'Mechatronics Systems',                                   'MTB', 'L300', 3, false],
  ['MTB304', 'Machine Element Design',                                 'MTB', 'L300', 3, false],
  ['MTB306', 'Thermodynamics II',                                      'MTB', 'L300', 3, false],
  ['MTB308', 'Fluid Mechanics II',                                     'MTB', 'L300', 3, false],

  // CIB — Civil Engineering
  ['CIB201', 'Fundamentals of Civil Engineering',                      'CIB', 'L200', 3, false],
  ['CIB203', 'Chemistry for Engineering',                              'CIB', 'L200', 3, false],
  ['CIB202', 'Material Science and Technology',                        'CIB', 'L200', 3, false],
  ['CIB301', 'Affine and Euclidean Geometry',                          'CIB', 'L300', 3, false],
  ['CIB303', 'Construction Materials',                                 'CIB', 'L300', 3, false],
  ['CIB305', 'Electrochemistry',                                       'CIB', 'L300', 3, false],
  ['CIB307', 'Strength of Materials',                                  'CIB', 'L300', 3, true],
  ['CIB309', 'Applied Geology and Hydrogeology',                       'CIB', 'L300', 3, false],
  ['CIB311', 'Basic Electrical Engineering',                           'CIB', 'L300', 3, false],
  ['CIB302', 'Hydraulics',                                             'CIB', 'L300', 3, false],
  ['CIB306', 'Geometric and Wave Optics',                              'CIB', 'L300', 3, false],
  ['CIB310', 'Quality, Safety and Environmental Management',           'CIB', 'L300', 3, false],
  ['CIB313', 'Construction Materials (Semester 2)',                    'CIB', 'L300', 3, false],
  ['CIB401', 'Introduction to Geomatics',                              'CIB', 'L400', 3, false],
  ['CIB403', 'Soil Mechanics (Geotechnics)',                           'CIB', 'L400', 3, false],
  ['CIB405', 'Foundations, Earthworks and Slope Stability',            'CIB', 'L400', 3, false],
  ['CIB407', 'Hydrology and Water Resource Engineering',               'CIB', 'L400', 3, false],
  ['CIB411', 'Acoustic and Thermal Comfort in Buildings',              'CIB', 'L400', 3, false],
  ['CIB413', 'Design of Timber and Steel Structures',                  'CIB', 'L400', 3, false],
  ['CIB415', 'Reinforced Concrete I',                                  'CIB', 'L400', 3, false],

  // BCB — Building and Construction Engineering
  ['BCB201', 'BCB201 (Course name to be confirmed)',                   'BCB', 'L200', 3, false],
  ['BCB203', 'BCB203 (Course name to be confirmed)',                   'BCB', 'L200', 3, true],
  ['BCB205', 'BCB205 (Course name to be confirmed)',                   'BCB', 'L200', 3, false],
  ['BCB207', 'Engineering Drawing and Graphics',                       'BCB', 'L200', 3, true],
  ['BCB307', 'Strength of Materials',                                  'BCB', 'L300', 3, true],
  ['BCB304', 'Soil Mechanics',                                         'BCB', 'L300', 3, false],
  ['BCB306', 'Concrete Technology',                                    'BCB', 'L300', 3, false],
  ['BCB308', 'Structural Analysis',                                    'BCB', 'L300', 3, false],
  ['BCB313', 'Building Construction Materials',                        'BCB', 'L300', 3, false],
  ['BCB401', 'Construction Technique',                                 'BCB', 'L400', 3, false],
  ['BCB405', 'Applied Engineering Geology',                            'BCB', 'L400', 3, false],
  ['BCB407', 'Design and Planning of Urban and Regional Landscape',    'BCB', 'L400', 3, false],
  ['BCB409', 'Design and Construction of Timber and Steel Structures', 'BCB', 'L400', 3, false],

  // PWB — Public Works Engineering
  ['PWB201', 'PWB201 (Course name to be confirmed)',                   'PWB', 'L200', 3, false],
  ['PWB304', 'Traffic and Transport Planning II',                      'PWB', 'L300', 3, false],
  ['PWB310', 'Hydraulics',                                             'PWB', 'L300', 3, false],
  ['PWB312', 'Foundation and Slope Stability',                         'PWB', 'L300', 3, false],

  // UPB — Urban Planning
  ['UPB201', 'UPB201 (Course name to be confirmed)',                   'UPB', 'L200', 3, false],
  ['UPB203', 'UPB203 (Course name to be confirmed)',                   'UPB', 'L200', 3, true],
];

// ── Lecturers ──────────────────────────────────────────────────────────────────
// Extracted from L200, L300, L400 SET timetable PDFs.
// departmentId left null — assign via the admin UI after seeding.
const SET_LECTURERS = [
  { staffId: 'STF002', firstName: 'Eugene',           lastName: 'Aban',                email: 'eugene.aban@buib.edu' },
  { staffId: 'STF003', firstName: 'Valery',           lastName: 'Nkemeni',             email: 'valery.nkemeni@buib.edu' },
  { staffId: 'STF004', firstName: 'Basil',            lastName: 'Wirnkar',             email: 'basil.wirnkar@buib.edu' },
  { staffId: 'STF005', firstName: 'Edwin',            lastName: 'Ajia',                email: 'edwin.ajia@buib.edu' },
  { staffId: 'STF006', firstName: 'Valery',           lastName: 'Ayuk',                email: 'valery.ayuk@buib.edu' },
  { staffId: 'STF007', firstName: 'Rostand Frank',    lastName: 'Mbapte',              email: 'rostand.mbapte@buib.edu' },
  { staffId: 'STF008', firstName: 'Kole',             lastName: 'Nkome',               email: 'kole.nkome@buib.edu' },
  { staffId: 'STF009', firstName: 'Benita Tata',      lastName: 'Fokem',               email: 'benita.fokem@buib.edu' },
  { staffId: 'STF010', firstName: 'Eya',              lastName: 'Olouge',              email: 'eya.olouge@buib.edu' },
  { staffId: 'STF011', firstName: 'Nelson',           lastName: 'Tydze Nsaidzeka',     email: 'nelson.tydze@buib.edu' },
  { staffId: 'STF012', firstName: 'Forjong',          lastName: 'Tarcicius Dewingong', email: 'forjong.tarcicius@buib.edu' },
  { staffId: 'STF013', firstName: 'Ajebua',           lastName: 'Andropov',            email: 'ajebua.andropov@buib.edu' },
  { staffId: 'STF014', firstName: 'Louis',            lastName: 'Musong',              email: 'louis.musong@buib.edu' },
  { staffId: 'STF015', firstName: 'Brian',            lastName: 'Nkapie Ngomjon',      email: 'brian.nkapie@buib.edu' },
  { staffId: 'STF016', firstName: 'Eric',             lastName: 'Mbia Sampson',        email: 'eric.mbia@buib.edu' },
  { staffId: 'STF017', firstName: 'Justin',           lastName: 'Fomanka',             email: 'justin.fomanka@buib.edu' },
  { staffId: 'STF018', firstName: 'Belsica',          lastName: 'Makogah',             email: 'belsica.makogah@buib.edu' },
  { staffId: 'STF019', firstName: 'Samuel',           lastName: 'Nemkul',              email: 'samuel.nemkul@buib.edu' },
  { staffId: 'STF020', firstName: 'Elvice',           lastName: 'Suh',                 email: 'elvice.suh@buib.edu' },
  { staffId: 'STF021', firstName: 'Prudence',         lastName: 'Nteubou',             email: 'prudence.nteubou@buib.edu' },
  { staffId: 'STF022', firstName: 'Richard',          lastName: 'Kamgang',             email: 'richard.kamgang@buib.edu' },
  { staffId: 'STF023', firstName: 'Acho',             lastName: 'Abongwa',             email: 'acho.abongwa@buib.edu' },
  { staffId: 'STF024', firstName: 'Taza',             lastName: 'Tala',                email: 'taza.tala@buib.edu' },
  { staffId: 'STF025', firstName: 'Keith',            lastName: 'Yengolo Yoh Peyechu', email: 'keith.yengolo@buib.edu' },
  { staffId: 'STF026', firstName: 'Esso',             lastName: 'Ngondy',              email: 'esso.ngondy@buib.edu' },
  { staffId: 'STF027', firstName: 'Francis',          lastName: 'Nkweya',              email: 'francis.nkweya@buib.edu' },
  { staffId: 'STF028', firstName: 'Leslie',           lastName: 'Kimbung Kukeng',      email: 'leslie.kimbung@buib.edu' },
  { staffId: 'STF029', firstName: 'Rex',              lastName: 'Ntungwe Etomes',      email: 'rex.ntungwe@buib.edu' },
  { staffId: 'STF030', firstName: 'God-Promise',      lastName: 'Mbuh Atanga',         email: 'godpromise.mbuh@buib.edu' },
  { staffId: 'STF031', firstName: 'Brice',            lastName: 'Noumsi',              email: 'brice.noumsi@buib.edu' },
  { staffId: 'STF032', firstName: 'Leslie',           lastName: 'Njume',               email: 'leslie.njume@buib.edu' },
  { staffId: 'STF033', firstName: 'Modeste',          lastName: 'Kang',                email: 'modeste.kang@buib.edu' },
  { staffId: 'STF034', firstName: 'Thiery',           lastName: 'Chin Berinyuy',       email: 'thiery.chin@buib.edu' },
  { staffId: 'STF035', firstName: 'William',          lastName: 'Shu',                 email: 'william.shu@buib.edu' },
  { staffId: 'STF036', firstName: 'Mbwoge',           lastName: 'Ntiege',              email: 'mbwoge.ntiege@buib.edu' },
  { staffId: 'STF037', firstName: 'Sebastien',        lastName: 'Yunkaavi',            email: 'sebastien.yunkaavi@buib.edu' },
  { staffId: 'STF038', firstName: 'George',           lastName: 'Ebot Etta',           email: 'george.etta@buib.edu' },
  { staffId: 'STF039', firstName: 'Wankie',           lastName: 'Mbitekambo',          email: 'wankie.mbitekambo@buib.edu' },
  { staffId: 'STF040', firstName: 'Gilbert',          lastName: 'Oben Ayuk',           email: 'gilbert.oben@buib.edu' },
  { staffId: 'STF041', firstName: 'Ceverine',         lastName: 'Mopock Thalita',      email: 'ceverine.mopock@buib.edu' },
  { staffId: 'STF042', firstName: 'Remmy',            lastName: 'Obia',                email: 'remmy.obia@buib.edu' },
  { staffId: 'STF043', firstName: 'Arantes',          lastName: 'Dam',                 email: 'arantes.dam@buib.edu' },
  { staffId: 'STF044', firstName: 'Columbus',         lastName: 'Ajua',                email: 'columbus.ajua@buib.edu' },
  { staffId: 'STF045', firstName: 'Ebenezer',         lastName: 'Tanyi',               email: 'ebenezer.tanyi@buib.edu' },
  { staffId: 'STF046', firstName: 'Steve',            lastName: 'Ngomba Nyadjroh',     email: 'steve.ngomba@buib.edu' },
  { staffId: 'STF047', firstName: 'Daring',           lastName: 'Boyom Nzussouo',      email: 'daring.boyom@buib.edu' },
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding database...\n');

  // 1. Schools
  for (const s of SCHOOLS) {
    await prisma.school.upsert({
      where:  { abbreviation: s.abbreviation },
      update: {},
      create: s,
    });
  }
  console.log(`✓ ${SCHOOLS.length} schools`);

  const setSchool = await prisma.school.findUniqueOrThrow({
    where: { abbreviation: 'SET' },
  });

  // 2. SET Departments
  const deptMap: Record<string, string> = {};
  for (const d of SET_DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where:  { code: d.code },
      update: { schoolId: setSchool.id },
      create: { name: d.name, code: d.code, schoolId: setSchool.id, programType: 'UNDERGRADUATE' },
    });
    deptMap[d.code] = dept.id;
  }

  // Keep the demo CS department for demo users
  const csDept = await prisma.department.upsert({
    where:  { code: 'CS' },
    update: { schoolId: setSchool.id },
    create: { name: 'Computer Science', code: 'CS', schoolId: setSchool.id, programType: 'UNDERGRADUATE' },
  });
  console.log(`✓ ${SET_DEPARTMENTS.length + 1} departments`);

  // 3. Courses
  let courseCount = 0;
  for (const [code, name, deptCode, level, credits, isShared] of COURSES) {
    const departmentId = deptMap[deptCode];
    if (!departmentId) {
      console.warn(`  ⚠ Unknown dept code "${deptCode}" for course ${code} — skipped`);
      continue;
    }
    await prisma.course.upsert({
      where:  { code },
      update: { name, credits, isShared },
      create: {
        code,
        name,
        credits,
        isShared,
        departmentId,
        level: level as any,
      },
    });
    courseCount++;
  }
  console.log(`✓ ${courseCount} courses`);

  // 3b. Migrate any existing 'Computer Science' (CS) demo timetables to CEB so they can auto-generate
  const cebDept = await prisma.department.findUniqueOrThrow({ where: { code: 'CEB' } });
  const migratedTT = await prisma.timetable.updateMany({
    where: { departmentId: csDept.id },
    data:  { departmentId: cebDept.id },
  });
  if (migratedTT.count > 0) {
    console.log(`✓ Migrated ${migratedTT.count} CS timetable(s) → CEB (Computer Engineering)`);
  }

  // 4. Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@timely.edu' },
    update: {},
    create: {
      email:    'admin@timely.edu',
      password: adminPassword,
      role:     'ADMIN',
      admin: { create: { firstName: 'Super', lastName: 'Admin' } },
    },
  });
  console.log(`✓ Admin: ${admin.email}`);

  // 5. Demo lecturer (kept for UI testing) — belongs to CEB (Computer Engineering)
  const lecPassword = await bcrypt.hash('lecturer123', 10);
  await prisma.user.upsert({
    where:  { email: 'lecturer@timely.edu' },
    update: {},
    create: {
      email:    'lecturer@timely.edu',
      password: lecPassword,
      role:     'LECTURER',
      lecturer: {
        create: { firstName: 'James', lastName: 'Brown', staffId: 'STF001', departmentId: cebDept.id },
      },
    },
  });
  await prisma.lecturer.updateMany({ where: { staffId: 'STF001' }, data: { departmentId: cebDept.id } });

  // 6. SET Lecturers
  const lecPw = await bcrypt.hash('lecturer123', 10);
  let lecCount = 0;
  for (const l of SET_LECTURERS) {
    await prisma.user.upsert({
      where:  { email: l.email },
      update: {},
      create: {
        email:    l.email,
        password: lecPw,
        role:     'LECTURER',
        lecturer: {
          create: {
            staffId:   l.staffId,
            firstName: l.firstName,
            lastName:  l.lastName,
          },
        },
      },
    });
    lecCount++;
  }
  console.log(`✓ ${lecCount + 1} lecturers (${lecCount} SET + 1 demo)`);

  // 7. Demo student (kept for UI testing)
  const stuPassword = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where:  { email: 'student@timely.edu' },
    update: {},
    create: {
      email:    'student@timely.edu',
      password: stuPassword,
      role:     'STUDENT',
      student: {
        create: {
          firstName:    'Alice',
          lastName:     'Smith',
          studentId:    'STU001',
          departmentId: cebDept.id,
          level:        'L300',
        },
      },
    },
  });
  await prisma.student.updateMany({ where: { studentId: 'STU001' }, data: { departmentId: cebDept.id } });
  console.log(`✓ Demo student: student@timely.edu`);

  // 8. System settings
  const existing = await prisma.systemSettings.findFirst();
  if (!existing) {
    await prisma.systemSettings.create({
      data: {
        academicYear:    '2025/2026',
        currentSemester: 'FIRST',
        slotDuration:    60,
        slotStartTime:   '07:00',
        slotEndTime:     '19:00',
      },
    });
    console.log('✓ System settings initialised (2025/2026, Semester 1)');
  } else {
    console.log('✓ System settings already exist — skipped');
  }

  console.log('\n── Login credentials ─────────────────────────────');
  console.log('  Admin:    admin@timely.edu    / admin123');
  console.log('  Lecturer: lecturer@timely.edu / lecturer123');
  console.log('  Student:  student@timely.edu  / student123');
  console.log('  All SET lecturers use password: lecturer123');
  console.log('──────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
