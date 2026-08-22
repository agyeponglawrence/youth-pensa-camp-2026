AUDIO SUMMARIES — where they live
=================================

DONE. All six audio summaries are in place and wired up. This file is
now a record of what went where, and what to do if they are ever
replaced.

The files sit in audio/ and are named by PAGE ID, not by the number a
session displays as. That is deliberate, and it is the whole point of
this file.

  page id   file                                        displays as
  --------------------------------------------------------------------
  s1        audio/s1-the-message-of-the-gospel.mp3               01
  s2        audio/s2-the-holy-spirit-his-power-and-impact.mp3    02
  s3        audio/s3-the-holy-spirit-at-work-in-you.mp3          03
  s6        audio/s6-joyful-praise.mp3                           04
  s5        audio/s5-making-godly-impact.mp3                     05
  s4        audio/s4-panel-navigating-our-identity.mp3        Panel

THE TRAP. Two rows above do not line up, and they are the reason the
files carry ids and titles rather than numbers:

  - Joyful Praise is id s6 but displays FOURTH. It was added after the
    other five, and giving it a new id avoided moving anyone's saved
    progress.
  - The panel is id s4 but sits LAST and shows "Panel" where a numeral
    would be.

An id never moves. Saved progress on people's phones is keyed to it
(ypc2026-progress stores keys like "s5-0"), so reassigning which
session owns an id silently scrambles what people have ticked off.

The source files supplied were named by DISPLAY order — "session 04 -
joyful praise.mp3" is page id s6, and "panel discussion.mp3" is page
id s4. They were matched to sessions BY TITLE, not by the number in
the filename, and each one was checked after wiring by comparing the
duration the browser reports against the duration of the source file.
All six matched. If you ever replace a file, do the same check.

TO REPLACE A FILE
Drop the new file into audio/ under the same name and it is picked up
with no code change. If you use a different name, edit the matching
line in the MEDIA block near the top of the <script> section in
index.html. Each line carries a comment naming the session — go by
that comment, not by the number in the key.

Anything set back to "" shows a greyed-out "coming soon" button
instead, so the page still works if a file has to be pulled.

Keep files near or under ~10 MB each — mobile data adds up. The six
here are 9-10 MB, 192 kbps, about six to seven minutes each.

THE YOUTUBE LINKS are already in, alongside the audio on each line.
Each is a deep link with a ?t= timestamp so it opens at the moment
that session starts inside a longer stream recording. Don't strip the
?t= part.
