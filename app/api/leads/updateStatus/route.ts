import { NextResponse } from "next/server";
import { getSheetsClient, SHEET_ID } from "@/lib/sheets";

export const revalidate = 0
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const sheets = await getSheetsClient();
    const row = Number(id) + 1; // omdat header rij 1 is
    const range = `Sheet1!F${row}`;

    // status direct zoals frontend 'm stuurt (A-F of 'Gesloten')
    const newStatus = status === "Gesloten" ? "Gesloten" : status;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [[newStatus]] },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ updateStatus error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
