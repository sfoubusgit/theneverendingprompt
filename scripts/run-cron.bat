@echo off
REM TNEP.XYZ — Daily round rotation
REM ----------------------------------
REM Closes the current round, picks the winner (AI-generated if no submissions),
REM and opens a fresh round. Requires the Next.js dev server to be running.
REM
REM SETUP:
REM   1. Set CRON_SECRET below to match the value in your .env.local
REM   2. Schedule this file in Windows Task Scheduler to run once per day
REM      (Task Scheduler > Create Task > Triggers: Daily > Actions: this .bat)

set CRON_SECRET=replace-with-your-cron-secret
set SERVER=http://localhost:3000

echo [%date% %time%] Running TNEP cron...
curl -s -X GET "%SERVER%/api/cron" -H "Authorization: Bearer %CRON_SECRET%"
echo.
echo [%date% %time%] Done.
