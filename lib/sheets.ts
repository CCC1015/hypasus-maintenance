import { google } from "googleapis"
export async function getSheetsClient(){
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY||'').replace(/\\n/g,'\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  return google.sheets({ version:'v4', auth })
}
export const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!
