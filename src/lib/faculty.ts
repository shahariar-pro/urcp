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

export async function getFacultyMembers(): Promise<FacultyDirectoryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faculty_directory")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as FacultyDirectoryItem[];
    }
  } catch {
    // Fall back to JSON file below
  }

  // Fallback to local JSON
  try {
    const filePath = path.join(process.cwd(), "public", "faculty.json");
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const rawList: RawFaculty[] = JSON.parse(fileContent);

      return rawList.map((item, index) => ({
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
    }
  } catch (err) {
    console.error("Error reading fallback faculty.json:", err);
  }

  return [];
}
