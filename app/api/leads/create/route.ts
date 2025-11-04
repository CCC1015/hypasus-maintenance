import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function POST(req: Request){
  const body = await req.json()
  const now = new Date().toISOString()
  const id = 'L'+Math.random().toString(36).slice(2,8).toUpperCase()
  const row = [id, now, body.name||'', body.phone||'', body.problem||'', body.extra||'', body.status||'A', '', '']
  const sheets = await getSheetsClient()
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range:'Sheet1!A1:F', valueInputOption:'RAW', requestBody:{ values:[row] } })
  return NextResponse.json({ ok:true, id })
}
