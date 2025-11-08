import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/sheets";

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:F",
    });

    const rows = res.data.values || [];
    const leads = rows.slice(1).map((r: string[], i: number) => ({
      id: i + 1,
      datetime: r[0] || "",
      name: r[1] || "",
      phone: r[2] || "",
      problem: r[3] || "",
      extra: r[4] || "",
      status: r[5] === "Gesloten" ? "Gesloten" : (r[5] || "A"),
    }));

    return NextResponse.json({ leads });
  } catch (err: any) {
    console.error("❌ Sheets read error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to read Google Sheets" },
      { status: 500 }
    );
  }
}
