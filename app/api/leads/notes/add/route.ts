import { NextResponse } from "next/server"
import { getSheetsClient, SHEET_ID } from "@/lib/sheets"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"

export async function POST(req: Request){
  const session = await getServerSession(authOptions as any)
  const email = session?.user?.email || 'unknown@user'
  const body = await req.json()
  const row = [ body.id, new Date().toISOString(), email, body.note ]
  const sheets = await getSheetsClient()
  await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range:'Notes!A2:D', valueInputOption:'RAW', requestBody:{ values:[row] } })
  return NextResponse.json({ ok:true })
}
