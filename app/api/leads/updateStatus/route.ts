import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function POST(req: Request){
  const body = await req.json()
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range:'Leads!A2:I' })
  const rows = res.data.values || []
  const idx = rows.findIndex((r:string[])=>r[0]===body.id)
  if (idx===-1) return NextResponse.json({ok:false,error:'Not found'},{status:404})
  const rowIndex = idx+2
  const row = rows[idx]
  row[6] = body.status
  row[7] = body.status==='CLOSED' ? (row[7] || new Date().toISOString()) : ''
  await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID, range:`Leads!A${rowIndex}:I${rowIndex}`, valueInputOption:'RAW', requestBody:{ values:[row] } })
  return NextResponse.json({ ok:true })
}
