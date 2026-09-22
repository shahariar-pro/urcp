export type UserRole = "student" | "faculty" | "admin";
export type ProjectStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "needs_attention"
  | "completed"
  | "archived";

export type MemberRole = "owner" | "co_author" | "supervisor";

export type ProposalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "changes_requested"
  | "rejected";

export type DecisionType = "approved" | "changes_requested" | "rejected";

export type MilestoneStatus = "pending" | "in_progress" | "done";
export type TaskStatus = "pending" | "in_progress" | "complete";
export type LiteratureStatus = "unread" | "reviewed" | "possible_duplicate";
export type CommentStatus = "open" | "resolved";
export type MeetingStatus = "pending" | "confirmed" | "declined";
export type NotificationType =
  | "proposal_decision"
  | "new_comment"
  | "meeting_update"
  | "task_due"
  | "role_change";

export interface Profile {
  id: string;
  full_name: string;
  university_email: string;
  role: UserRole;
  department: string;
  research_interests?: string[] | null;
  short_bio?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  abstract: string;
  objectives?: string | null;
  supervisor_id: string;
  status: ProjectStatus;
  progress_percent: number;
  created_at: string;
  archived_at?: string | null;
}

export interface ProjectMember {
  id?: string;
  project_id: string;
  user_id: string;
  member_role: MemberRole;
  invited_at: string;
  accepted_at?: string | null;
  profile?: Profile;
}

export interface Proposal {
  id: string;
  project_id?: string | null;
  submitted_by: string;
  supervisor_id: string;
  title: string;
  abstract: string;
  objectives?: string | null;
  status: ProposalStatus;
  submitted_at: string;
  decided_at?: string | null;
  submitter?: Profile;
  supervisor?: Profile;
  attachments?: ProposalAttachment[];
  decisions?: ProposalDecision[];
}

export interface ProposalAttachment {
  id: string;
  proposal_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface ProposalDecision {
  id: string;
  proposal_id: string;
  decided_by: string;
  decision: DecisionType;
  feedback: string;
  decided_at: string;
  decider?: Profile;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  status: MilestoneStatus;
}

export interface Task {
  id: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  assignee_id?: string | null;
  due_date?: string | null;
  status: TaskStatus;
  assignee?: Profile;
}

export interface LiteratureItem {
  id: string;
  project_id: string;
  title: string;
  authors: string;
  file_url?: string | null;
  folder_tag?: string | null;
  uploaded_by: string;
  status: LiteratureStatus;
  uploaded_at: string;
  uploader?: Profile;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  current_version_id?: string | null;
  created_at?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  saved_by: string;
  change_summary?: string | null;
  created_at: string;
  author?: Profile;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  version_id?: string | null;
  author_id: string;
  section_ref?: string | null;
  body: string;
  status: CommentStatus;
  created_at: string;
  author?: Profile;
}

export interface Message {
  id: string;
  project_id?: string | null;
  sender_id: string;
  recipient_id?: string | null;
  body: string;
  created_at: string;
  sender?: Profile;
}

export interface Meeting {
  id: string;
  project_id: string;
  proposed_by: string;
  proposed_time: string;
  location?: string | null;
  status: MeetingStatus;
  proposer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_table: string;
  target_id: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile;
}

export interface FacultyDirectoryItem {
  id: string;
  name: string;
  email: string;
  faculty?: string | null;
  department: string;
  designation?: string | null;
  position?: string | null;
  room_no?: string | null;
  building_no?: string | null;
  academic_interests?: string[] | null;
  research_interests?: string[] | null;
  photo_url?: string | null;
  created_at?: string;
}
