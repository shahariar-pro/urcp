"use client";

import { useState, useActionState } from "react";
import { Milestone, Task, TaskStatus, ProjectMember } from "@/types/database.types";
import {
  createMilestoneAction,
  createTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Trash2,
  Clock,
  CheckCircle2,
  Flag,
  X,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  projectId: string;
  initialMilestones: Milestone[];
  initialTasks: Task[];
  members: ProjectMember[];
}

export function TasksClient({
  projectId,
  initialMilestones,
  initialTasks,
  members,
}: Props) {
  const [milestones] = useState<Milestone[]>(initialMilestones);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  const [milestoneState, milestoneFormAction, isMilestonePending] =
    useActionState(createMilestoneAction, { error: null, success: null });

  const [taskState, taskFormAction, isTaskPending] = useActionState(
    createTaskAction,
    { error: null, success: null }
  );

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await updateTaskStatusAction(taskId, projectId, newStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteTaskAction(taskId, projectId);
  };

  // Group tasks by status
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completeTasks = tasks.filter((t) => t.status === "complete");

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Flag className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">{milestones.length} Milestones</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CheckSquare className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">
              {completeTasks.length} / {tasks.length} Tasks Finished
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMilestoneOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Milestone
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTaskOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* New Milestone Modal */}
      {isMilestoneOpen && (
        <Card className="border-blue-200 bg-white shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Flag className="h-4 w-4 text-blue-600" />
              Create Project Milestone
            </CardTitle>
            <button
              onClick={() => setIsMilestoneOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              action={milestoneFormAction}
              onSubmit={() => setTimeout(() => setIsMilestoneOpen(false), 500)}
              className="space-y-4"
            >
              <input type="hidden" name="projectId" value={projectId} />
              {milestoneState?.error && (
                <p className="text-xs text-red-600">{milestoneState.error}</p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Milestone Title
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Phase 1: Literature Review & Dataset Preprocessing"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Target Due Date
                </label>
                <Input type="date" name="dueDate" required className="text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMilestoneOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isMilestonePending}>
                  {isMilestonePending ? "Creating..." : "Save Milestone"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* New Task Modal */}
      {isTaskOpen && (
        <Card className="border-blue-200 bg-white shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              Add Research Task
            </CardTitle>
            <button
              onClick={() => setIsTaskOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              action={taskFormAction}
              onSubmit={() => setTimeout(() => setIsTaskOpen(false), 500)}
              className="space-y-4"
            >
              <input type="hidden" name="projectId" value={projectId} />
              {taskState?.error && (
                <p className="text-xs text-red-600">{taskState.error}</p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Task Title
                </label>
                <Input
                  name="title"
                  placeholder="e.g. Annotate 500 dataset samples or draft related work section"
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Milestone (Optional)
                  </label>
                  <select
                    name="milestoneId"
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <option value="">None / Standalone</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Assignee
                  </label>
                  <select
                    name="assigneeId"
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.profile?.full_name} ({m.member_role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Due Date
                  </label>
                  <Input type="date" name="dueDate" className="text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isTaskPending}>
                  {isTaskPending ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Milestones Row */}
      {milestones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Project Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((m) => (
              <Card key={m.id} className="bg-white border-slate-200 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">
                      {m.title}
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      Due {formatDate(m.due_date)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Pending */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Pending
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {pendingTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed rounded-lg">
                No pending tasks.
              </p>
            )}
          </div>
        </div>

        {/* Col 2: In Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                In Progress
              </span>
            </div>
            <Badge variant="default" className="text-xs">
              {inProgressTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed rounded-lg">
                No tasks in progress.
              </p>
            )}
          </div>
        </div>

        {/* Col 3: Complete */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                Completed
              </span>
            </div>
            <Badge variant="success" className="text-xs">
              {completeTasks.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {completeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
            {completeTasks.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6 border border-dashed rounded-lg">
                No completed tasks yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="bg-white hover:border-slate-300 transition-all shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
            {task.title}
          </h4>
          <button
            onClick={() => onDelete(task.id)}
            className="text-slate-300 hover:text-red-500 cursor-pointer p-0.5"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {task.assignee?.full_name || "Unassigned"}
            </span>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        {/* Status quick mover */}
        <div className="flex items-center justify-end gap-1 pt-1">
          {task.status !== "pending" && (
            <button
              onClick={() => onStatusChange(task.id, "pending")}
              className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
            >
              To Pending
            </button>
          )}
          {task.status !== "in_progress" && (
            <button
              onClick={() => onStatusChange(task.id, "in_progress")}
              className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded cursor-pointer"
            >
              In Progress
            </button>
          )}
          {task.status !== "complete" && (
            <button
              onClick={() => onStatusChange(task.id, "complete")}
              className="text-[10px] text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded cursor-pointer font-medium"
            >
              Complete ✓
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
