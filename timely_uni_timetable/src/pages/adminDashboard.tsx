import React, { useState } from "react";
import Bubble from "../components/ui/Bubble";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { SlidersHorizontal, CheckCircle, X, ArrowRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CourseSlot {
    courseCode: string;
    courseName: string;
    lecturerName: string;
    level: string;
}

interface FeedbackItem {
    studentName: string;
    level: string;
    description: string;
    teacherName: string;
    done: boolean;
}

interface EditingCell {
    slot: string;
    day: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_SLOTS = [
    "7:00 – 9:00",
    "9:00 – 11:00",
    "11:00 – 13:00",
    "13:00 – 15:00",
    "15:00 – 17:00",
    "17:00 – 19:00",
];

const LEVELS = [
    { label: "L200",           value: "L200" },
    { label: "L300",           value: "L300" },
    { label: "L400",           value: "L400" },
    { label: "L500",           value: "L500" },
    { label: "Masters Year 1", value: "Masters Year 1" },
    { label: "Masters Year 2", value: "Masters Year 2" },
];

const buildEmptySchedule = (): Record<string, Record<string, CourseSlot | null>> => {
    const s: Record<string, Record<string, CourseSlot | null>> = {};
    TIME_SLOTS.forEach(slot => {
        s[slot] = {};
        DAYS.forEach(day => { s[slot][day] = null; });
    });
    return s;
};

const INITIAL_FEEDBACKS: FeedbackItem[] = [
    { studentName: "Alice Njoku", level: "L300", description: "Complaint: CCB 210 and 214 are clashing on Thursday afternoon.", teacherName: "Dr. Mbeki",  done: false },
    { studentName: "Brian Tanyi", level: "L200", description: "The lab sessions for PHY 201 keep getting cancelled without notice.",  teacherName: "Prof. Tabi", done: true  },
];

const EMPTY_FORM: CourseSlot = { courseCode: "", courseName: "", lecturerName: "", level: "" };

// ── CourseCell ────────────────────────────────────────────────────────────────

const CourseCell = ({ slot, onClick }: { slot: CourseSlot; onClick: () => void }) => (
    <Bubble variant="course" className="w-full" onClick={onClick}>
        <p className="font-semibold text-[var(--primary-400)] text-[10px]">{slot.courseCode}</p>
        <p className="text-[var(--gray-dark)] font-medium text-[10px] leading-tight">{slot.courseName}</p>
        <div className="flex items-center gap-1 mt-1">
            <div className="w-3 h-3 rounded-full bg-[var(--gray-150)] flex items-center justify-center">
                <span className="text-[7px] text-[var(--gray-600)]">A</span>
            </div>
            <p className="text-[9px] text-[var(--gray-500)] truncate">{slot.lecturerName}</p>
        </div>
        <span className="inline-block mt-1 text-[8px] bg-[var(--gray-100)] text-[var(--gray-500)] px-1.5 py-0.5 rounded-full">
            {slot.level}
        </span>
    </Bubble>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
    const [schedule,      setSchedule]      = useState(buildEmptySchedule);
    const [showFilter,    setShowFilter]    = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [appliedLevel,  setAppliedLevel]  = useState<string>("");
    const [editingCell,   setEditingCell]   = useState<EditingCell | null>(null);
    const [formData,      setFormData]      = useState<CourseSlot>(EMPTY_FORM);
    const [feedbacks,     setFeedbacks]     = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);

    const handleApplyFilter = () => { setAppliedLevel(selectedLevel); setShowFilter(false); };
    const handleClearFilter = () => { setSelectedLevel(""); setAppliedLevel(""); setShowFilter(false); };
    const isVisible = (slot: CourseSlot | null) => !!slot && (!appliedLevel || slot.level === appliedLevel);

    const openEdit = (timeSlot: string, day: string) => {
        setEditingCell({ slot: timeSlot, day });
        setFormData(schedule[timeSlot][day] ?? EMPTY_FORM);
    };
    const closeEdit = () => { setEditingCell(null); setFormData(EMPTY_FORM); };

    const handleSave = () => {
        if (!editingCell) return;
        const { slot, day } = editingCell;
        const isEmpty = !formData.courseCode && !formData.courseName && !formData.lecturerName;
        setSchedule(prev => ({
            ...prev,
            [slot]: { ...prev[slot], [day]: isEmpty ? null : formData },
        }));
        closeEdit();
    };

    const handleResolve = (idx: number) => {
        setFeedbacks(prev =>
            prev.map((fb, i) => i === idx ? { ...fb, done: true } : fb)
        );
    };

    const isEditing = editingCell ? !!schedule[editingCell.slot]?.[editingCell.day] : false;

    return (
        <div className="min-h-screen bg-[var(--gray-light)] px-6 py-8 font-sans relative">

            {/* ── Filter backdrop ── */}
            {showFilter && <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowFilter(false)} />}

            {/* ── Filter Modal ── */}
            {showFilter && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
                            <h3 className="text-lg font-semibold text-[var(--gray-dark)]">Filter Schedule</h3>
                            <button onClick={() => setShowFilter(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--gray-100)]">
                                <X className="w-4 h-4 text-[var(--gray-600)]" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-xs font-semibold text-[var(--gray-600)] uppercase tracking-widest">Year / Level</p>
                            <div className="grid grid-cols-2 gap-2">
                                {LEVELS.map(lvl => (
                                    <button
                                        key={lvl.value}
                                        onClick={() => setSelectedLevel(prev => prev === lvl.value ? "" : lvl.value)}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                                            selectedLevel === lvl.value
                                                ? "bg-[var(--primary-400)] border-[var(--primary-400)] text-white"
                                                : "bg-white border-[var(--gray-200)] text-[var(--gray-700)] hover:border-[var(--primary-200)] hover:text-[var(--primary-400)]"
                                        }`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs text-[var(--gray-400)] mb-2">or pick from dropdown</p>
                                <Select selectedValue={selectedLevel} onValueChange={v => setSelectedLevel(v as string)} options={LEVELS} placeholder="Choose a level..." />
                            </div>
                            {appliedLevel && (
                                <div className="flex items-center gap-2 bg-[var(--gray-100)] rounded-xl px-3 py-2">
                                    <span className="text-xs text-[var(--gray-600)]">Active:</span>
                                    <span className="text-xs font-semibold text-[var(--primary-400)]">{appliedLevel}</span>
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={handleClearFilter} className="flex-1 py-2.5 rounded-xl border border-[var(--gray-200)] text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)]">Clear</button>
                            <Button onClick={handleApplyFilter} className="flex-1 py-2.5 text-sm">Apply</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Course Edit / Add Modal ── */}
            {editingCell && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gray-150)]">
                            <h3 className="text-lg font-semibold text-[var(--gray-dark)]">{isEditing ? "Edit Course" : "Add Course"}</h3>
                            <button onClick={closeEdit} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--gray-100)]">
                                <X className="w-4 h-4 text-[var(--gray-600)]" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-xs text-[var(--gray-500)]">{editingCell.day} · {editingCell.slot}</p>
                            <div>
                                <Label className="text-xs">Course Code</Label>
                                <Input type="text" value={formData.courseCode} onChange={e => setFormData(prev => ({ ...prev, courseCode: e.target.value }))} placeholder="e.g. CSC 201" />
                            </div>
                            <div>
                                <Label className="text-xs">Course Name</Label>
                                <Input type="text" value={formData.courseName} onChange={e => setFormData(prev => ({ ...prev, courseName: e.target.value }))} placeholder="e.g. Data Structures" />
                            </div>
                            <div>
                                <Label className="text-xs">Lecturer</Label>
                                <Input type="text" value={formData.lecturerName} onChange={e => setFormData(prev => ({ ...prev, lecturerName: e.target.value }))} placeholder="e.g. Dr. Mbeki" />
                            </div>
                            <div>
                                <Label className="text-xs">Level</Label>
                                <Select selectedValue={formData.level} onValueChange={v => setFormData(prev => ({ ...prev, level: v as string }))} options={LEVELS} placeholder="Select level" />
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--gray-200)] text-[var(--gray-700)] hover:bg-[var(--success)] hover:text-white transition-all duration-200"
                            >
                                {isEditing ? "Save Changes" : "Add Course"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-xs text-[var(--gray-500)] uppercase tracking-widest font-medium mb-0.5">Admin</p>
                    <h1 className="text-3xl font-bold text-[var(--gray-dark)]">
                        Welcome, <span className="text-[var(--primary-400)]">User Name</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {appliedLevel && (
                        <span className="flex items-center gap-1.5 bg-[var(--primary-400)] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            {appliedLevel}
                            <button onClick={handleClearFilter}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    <button
                        onClick={() => setShowFilter(true)}
                        className={`flex items-center gap-2 border bg-white rounded-xl px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all ${appliedLevel ? "border-[var(--primary-200)] text-[var(--primary-400)]" : "border-[var(--gray-200)] text-[var(--gray-700)]"}`}
                    >
                        <SlidersHorizontal className="w-4 h-4 text-[var(--primary-200)]" />
                        Filter
                    </button>
                </div>
            </div>

            {/* ── Schedule ── */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-[var(--gray-dark)] tracking-tight">Schedule</h2>
                    {appliedLevel && <p className="text-xs text-[var(--gray-500)]">Showing: <span className="font-semibold text-[var(--primary-400)]">{appliedLevel}</span></p>}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[var(--gray-150)] bg-white shadow-sm">
                    <div className="min-w-[700px]">
                        <div className="grid grid-cols-[120px_repeat(6,1fr)] border-b border-[var(--gray-150)]">
                            <div className="px-4 py-3" />
                            {DAYS.map(day => (
                                <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-[var(--gray-600)] uppercase tracking-widest">{day}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-[var(--gray-100)]">
                            {TIME_SLOTS.map(timeSlot => (
                                <div key={timeSlot} className="grid grid-cols-[120px_repeat(6,1fr)] items-center py-2 px-2 gap-2">
                                    <span className="text-[11px] text-[var(--gray-500)] font-medium pl-2 whitespace-nowrap">{timeSlot}</span>
                                    {DAYS.map(day => {
                                        const data = schedule[timeSlot]?.[day];
                                        const visible = isVisible(data);
                                        return (
                                            <div key={day} className="min-h-[56px] flex items-center">
                                                {visible && data
                                                    ? <CourseCell slot={data} onClick={() => openEdit(timeSlot, day)} />
                                                    : <Bubble variant="empty" className="w-full min-h-[48px] cursor-pointer" onClick={() => openEdit(timeSlot, day)} />
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feedback ── */}
            <section>
                <h2 className="text-lg font-semibold text-[var(--gray-dark)] mb-3 tracking-tight">Feedback</h2>
                <div className="flex flex-col gap-4">
                    {feedbacks.map((fb, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4">

                            {/* Student bubble */}
                            <Bubble variant="feedback" className="flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[var(--gray-150)] flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-[var(--gray-600)]">{fb.studentName.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[var(--gray-dark)]">{fb.studentName}</p>
                                        <p className="text-[11px] text-[var(--gray-500)] mb-1">{fb.level}</p>
                                        <p className="text-xs text-[var(--gray-700)] leading-snug">
                                            <span className="font-medium text-[var(--gray-dark)]">Description: </span>{fb.description}
                                        </p>

                                        {/* Bottom row — resolved badge OR resolve button, always at bottom-right */}
                                        <div className="flex justify-end mt-4">
                                            {fb.done ? (
                                                <div className="flex items-center gap-1.5 text-[var(--success)] text-xs font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Resolved
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleResolve(idx)}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--gray-150)] text-[var(--gray-700)] hover:bg-[var(--success)] hover:text-white transition-all duration-200"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Mark as Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Bubble>

                            {/* Teacher bubble */}
                            <Bubble variant="feedback" className="sm:w-48 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-[var(--gray-100)] flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-[var(--primary-400)]">{fb.teacherName.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[var(--gray-500)] mb-0.5">Teacher</p>
                                    <p className="text-sm font-semibold text-[var(--gray-dark)]">{fb.teacherName}</p>
                                </div>
                            </Bubble>

                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default AdminDashboard;