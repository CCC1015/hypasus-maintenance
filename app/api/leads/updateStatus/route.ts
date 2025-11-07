import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || typeof status !== "string") {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const sheets = await getSheetsClient();

    // id=1 hoort bij sheet-rij 2 (rij 1 = headers)
    const sheetRow = Number(id) + 1; // 1-based rij in Google Sheets
    const targetRange = `Sheet1!F${sheetRow}`; // kolom F = Status

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: targetRange,
      valueInputOption: "RAW",
      requestBody: { values: [[status]] },
    });

    return NextResponse.json({ ok: true, id, status, range: targetRange });
  } catch (err: any) {
    console.error("❌ updateStatus error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
