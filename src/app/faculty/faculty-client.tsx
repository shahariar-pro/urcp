"use client";

import { useState, useMemo } from "react";
import { FacultyDirectoryItem } from "@/types/database.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MapPin, Sparkles, ArrowRight, User } from "lucide-react";
import Link from "next/link";

interface Props {
  initialFaculty: FacultyDirectoryItem[];
}

const POPULAR_TAGS = [
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "NLP",
  "Data Mining",
  "Internet of Things",
  "Cybersecurity",
  "Blockchain",
  "Software Engineering",
  "Computer Vision",
];

export function FacultyDirectoryClient({ initialFaculty }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredFaculty = useMemo(() => {
    return initialFaculty.filter((f) => {
      const matchesSearch =
        !searchTerm ||
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.designation &&
          f.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (f.research_interests &&
          f.research_interests.some((ri) =>
            ri.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesTag =
        !selectedTag ||
        (f.research_interests &&
          f.research_interests.some((ri) =>
            ri.toLowerCase().includes(selectedTag.toLowerCase())
          )) ||
        (f.academic_interests &&
          f.academic_interests.some((ai) =>
            ai.toLowerCase().includes(selectedTag.toLowerCase())
          ));

      const matchesDept =
        departmentFilter === "all" ||
        (f.department &&
          f.department.toLowerCase().includes(departmentFilter.toLowerCase()));

      return matchesSearch && matchesTag && matchesDept;
    });
  }, [initialFaculty, searchTerm, selectedTag, departmentFilter]);

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Input
              placeholder="Search faculty by name, keyword, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <option value="all">All Departments</option>
              <option value="computer science">Department of Computer Science</option>
              <option value="computer engineering">Department of Computer Engineering</option>
            </select>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Popular Research Tags:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                selectedTag === null
                  ? "bg-blue-600 text-white border-blue-600 font-semibold"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Topics
            </button>
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing {filteredFaculty.length} of {initialFaculty.length} faculty members
        </span>
        {(searchTerm || selectedTag || departmentFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedTag(null);
              setDepartmentFilter("all");
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Faculty Cards Grid */}
      {filteredFaculty.length === 0 ? (
        <Card className="border-dashed bg-white">
          <CardContent className="p-12 text-center text-slate-500 space-y-2">
            <User className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No faculty members found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or removing research tag filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((f) => (
            <Card
              key={f.id}
              className="bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {f.name}
                    </h3>
                  </div>
                  {f.position && (
                    <p className="text-xs font-semibold text-blue-600">
                      {f.position}
                    </p>
                  )}
                  {f.designation && (
                    <p className="text-xs text-slate-500">{f.designation}</p>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${f.email}`}
                      className="hover:text-blue-600 truncate"
                    >
                      {f.email}
                    </a>
                  </div>
                  {(f.room_no || f.building_no) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Room {f.room_no || "TBA"}, {f.building_no || "Campus"}
                      </span>
                    </div>
                  )}
                </div>

                {f.research_interests && f.research_interests.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Research Interests
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {f.research_interests.slice(0, 5).map((interest, idx) => (
                        <span
                          key={idx}
                          onClick={() => setSelectedTag(interest)}
                          className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 rounded-b-lg flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {f.department}
                </span>
                <Link href="/proposals/new">
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-8 text-blue-600 hover:bg-blue-50">
                    Propose Topic
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
