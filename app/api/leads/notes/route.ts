import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function GET(req: Request){
  const id = new URL(req.url).searchParams.get('id')
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range:'Sheet1!A1:F' })
  const rows = res.data.values || []
  const notes = rows.filter((r:string[])=>r[0]===id).map((r:string[])=>({ leadId:r[0], timestamp:r[1], author:r[2], note:r[3] }))
  return NextResponse.json({ notes })
}
