import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const email = (session?.user?.email || "unknown@user").toString()

    const body = await req.json()
    const id = body?.id
    const note: string = (body?.note || "").toString().trim()

    if (!id) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 })
    }
    if (!note) {
      return NextResponse.json({ error: "Note is empty" }, { status: 400 })
    }

    const iso = new Date().toISOString()
    // Row schema in Notes-sheet: [LeadId, ISO_Timestamp, AuthorEmail, Note]
    const row = [String(id), iso, email, note]

    const sheets = await getSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Notes!A:D",               // 4 kolommen: A..D
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    })

    // Geef direct een net geformatteerde note terug voor de UI
    const displayTime = new Date(iso).toLocaleString("nl-NL", {
      dateStyle: "short",
      timeStyle: "short",
    })

    return NextResponse.json({
      ok: true,
      note: {
        author: email,
        note,
        timestamp: displayTime,
        leadId: id,
      },
    })
  } catch (err: any) {
    console.error("❌ notes/add error:", err?.message || err)
    return NextResponse.json(
      { error: err?.message || "Failed to add note" },
      { status: 500 }
    )
  }
}
