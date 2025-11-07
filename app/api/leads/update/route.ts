import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function POST(req: Request){
  const body = await req.json()
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range:'Sheet1!A1:F' })
  const rows = res.data.values || []
  const idx = rows.findIndex((r:string[])=>r[0]===body.id)
  if (idx===-1) return NextResponse.json({ok:false,error:'Not found'},{status:404})
  const rowIndex = idx+2
  const row = [
    body.id,
    rows[idx][1],
    body.name||'',
    body.phone||'',
    body.problem||'',
    body.extra||'',
    body.status||'A',
    body.status==='Gesloten' ? (rows[idx][7] || new Date().toISOString()) : '',
    rows[idx][8]||''
  ]
  await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range:`Leads!A${rowIndex}:I${rowIndex}`, valueInputOption:'RAW', requestBody:{ values:[row] } })
  return NextResponse.json({ ok:true })
}
