import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/sheets";

function normalizeStatus(s?: string) {
  if (!s) return "A";
  const v = s.trim().toLowerCase();
  if (v === "closed" || v === "gesloten") return "Gesloten";
  // voor A..F – ook “ a ” → “A”
  return s.trim().toUpperCase();
}

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:F",
    });

    const rows = res.data.values || [];

    const leads = rows.slice(1).map((r: string[], i: number) => ({
      id: i + 1,                    // index-based id
      datetime: r[0] || "",
      name: r[1] || "",
      phone: r[2] || "",
      problem: r[3] || "",
      extra: r[4] || "",
      status: normalizeStatus(r[5]), // ⬅️ belangrijkste regel
    }));

    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to read Google Sheets" },
      { status: 500 }
    );
  }
}
