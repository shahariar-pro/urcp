"use client";

import { useState, useActionState } from "react";
import { Meeting, MeetingStatus } from "@/types/database.types";
import {
  proposeMeetingAction,
  updateMeetingStatusAction,
} from "@/app/actions/communication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  User,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  projectId: string;
  initialMeetings: Meeting[];
  currentUserId: string;
}

export function CalendarClient({
  projectId,
  initialMeetings,
  currentUserId,
}: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [isProposeOpen, setIsProposeOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(proposeMeetingAction, {
    error: null,
    success: null,
  });

  const handleStatusChange = async (
    meetingId: string,
    newStatus: MeetingStatus
  ) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m))
    );
    await updateMeetingStatusAction(meetingId, projectId, newStatus);
  };

  const confirmedMeetings = meetings.filter((m) => m.status === "confirmed");
  const pendingMeetings = meetings.filter((m) => m.status === "pending");
  const pastOrDeclined = meetings.filter((m) => m.status === "declined");

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">
              {confirmedMeetings.length} Confirmed Meetings
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">
              {pendingMeetings.length} Awaiting Confirmation
            </span>
          </div>
        </div>

        <Button
          onClick={() => setIsProposeOpen(true)}
          className="gap-1.5 text-xs h-9 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Propose Meeting Slot
        </Button>
      </div>

      {/* Propose Meeting Modal */}
      {isProposeOpen && (
        <Card className="border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Propose Research Meeting Slot
            </CardTitle>
            <button
              onClick={() => setIsProposeOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              action={formAction}
              onSubmit={() => setTimeout(() => setIsProposeOpen(false), 500)}
              className="space-y-4"
            >
              <input type="hidden" name="projectId" value={projectId} />
              {state?.error && (
                <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Proposed Date & Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  name="proposedTime"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Meeting Location / Mode
                </label>
                <Input
                  name="location"
                  placeholder="e.g. Faculty Room 1122, Annex-1 or Microsoft Teams"
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProposeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Sending Proposal..." : "Propose Slot"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Meetings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Confirmed Meetings
        </h3>

        {confirmedMeetings.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-dashed dark:border-slate-800 text-center">
            No confirmed meetings scheduled yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedMeetings.map((m) => (
              <Card
                key={m.id}
                className="bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 shadow-2xs"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {formatDateTime(m.proposed_time)}
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      Confirmed
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{m.location || "Online"}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Arranged by: {m.proposer?.full_name || "Member"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Confirmation Slots */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Slots Awaiting Confirmation
        </h3>

        {pendingMeetings.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-dashed dark:border-slate-800 text-center">
            No pending meeting slots.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMeetings.map((m) => (
              <Card
                key={m.id}
                className="bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 shadow-2xs"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {formatDateTime(m.proposed_time)}
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      Pending
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{m.location || "Online"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Proposed by {m.proposer?.full_name || "Member"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(m.id, "declined")}
                        className="text-xs h-7 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(m.id, "confirmed")}
                        className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Confirm Slot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
