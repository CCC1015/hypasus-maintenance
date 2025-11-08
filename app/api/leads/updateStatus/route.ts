import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/sheets";

function toCanonical(status: string) {
  const s = (status || "").trim().toUpperCase();
  if (s === "GESLOTEN" || s === "CLOSED") return "CLOSED";
  // keep only A..F, fallback A
  return ["A","B","C","D","E","F"].includes(s) ? s : "A";
}

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    if (id == null || typeof status !== "string") {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const sheets = await getSheetsClient();
    const sheetRow = Number(id) + 1;           // header is row 1
    const targetRange = `Sheet1!F${sheetRow}`; // Status = col F
    const canon = toCanonical(status);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: targetRange,
      valueInputOption: "RAW",
      requestBody: { values: [[canon]] },
    });

    return NextResponse.json({ ok: true, id, status: canon, range: targetRange });
  } catch (err: any) {
    console.error("❌ updateStatus error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
