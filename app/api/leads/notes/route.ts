import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get("id")
    if (!leadId)
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 })

    const sheets = await getSheetsClient()

    // Lees alle rijen uit je Notes tab
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Notes!A:D", // A = LeadID, B = tijd, C = auteur, D = notitie
    })

    const rows = res.data.values || []
    const dataRows = rows.slice(1) // sla headers over indien aanwezig

    // Filter notities die horen bij de juiste lead
    const notes = dataRows
      .filter(r => r[0] === leadId.toString())
      .map(r => ({
        leadId: r[0],
        timestamp: new Date(r[1]).toLocaleString("nl-NL", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        author: r[2] || "onbekend",
        note: r[3] || "",
      }))
      .reverse() // nieuwste bovenaan

    return NextResponse.json({ notes })
  } catch (err: any) {
    console.error("❌ Failed to fetch notes:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch notes" },
      { status: 500 }
    )
  }
}
