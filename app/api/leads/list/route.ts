import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"

export async function GET(){
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:F' })
  const rows = res.data.values || []
  const leads = rows.map((r:string[]) => ({
    id:r[0], datetime:r[1], name:r[2], phone:r[3], problem:r[4], extra:r[5], status:r[6]||'A', closedAt:r[7]||'', createdBy:r[8]||''
  }))
  return NextResponse.json({ leads })
}
