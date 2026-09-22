import fs from "fs";
import path from "path";
import { FacultyDirectoryItem } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";

interface RawFaculty {
  name: string;
  email: string;
  faculty?: string;
  department: string;
  designation?: string;
  position?: string;
  room_no?: string;
  building_no?: string;
  academic_interests?: string;
  research_interests?: string;
  photo_url?: string;
}

// In-memory cache to prevent repeated 428-row Supabase round-trips
let cachedFaculty: FacultyDirectoryItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getFacultyMembers(): Promise<FacultyDirectoryItem[]> {
  const now = Date.now();
  if (cachedFaculty && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedFaculty;
  }

  // 1. First check local bundled JSON (super-fast, 0ms latency)
  try {
    const filePath = path.join(process.cwd(), "public", "faculty.json");
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const rawList: RawFaculty[] = JSON.parse(fileContent);

      const parsed: FacultyDirectoryItem[] = rawList.map((item, index) => ({
        id: `fac-${index + 1}`,
        name: item.name,
        email: item.email,
        faculty: item.faculty || null,
        department: item.department,
        designation: item.designation || null,
        position: item.position || null,
        room_no: item.room_no || null,
        building_no: item.building_no || null,
        academic_interests: item.academic_interests
          ? item.academic_interests.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        research_interests: item.research_interests
          ? item.research_interests.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        photo_url: item.photo_url || null,
      }));

      cachedFaculty = parsed;
      lastCacheTime = now;
      return parsed;
    }
  } catch (err) {
    console.error("Local faculty.json read error:", err);
  }

  // 2. Fall back to Supabase database
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faculty_directory")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      cachedFaculty = data as FacultyDirectoryItem[];
      lastCacheTime = now;
      return cachedFaculty;
    }
  } catch (err) {
    console.error("Supabase faculty_directory read error:", err);
  }

  return [];
}
