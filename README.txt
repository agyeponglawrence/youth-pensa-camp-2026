AUDIO SUMMARIES — where to put your files
=========================================

IMPORTANT: the audio file numbers and the page's session numbers no
longer line up. The page ids (s1…s6) are what the wiring uses, and an
id never moves — it is what saved progress on people's phones is keyed
to. Go by the id column below, not by the filename.

  file             page id   displays as   session
  ---------------------------------------------------------------
  session-1.mp3    s1        01            The Message of the Gospel
                                           (Day 1, opening night)
  session-2.mp3    s2        02            The Holy Spirit, His Power
                                           and Impact (Day 2 morning)
  session-3.mp3    s3        03            The Holy Spirit at Work in
                                           You (Day 2, Night of Power)
  session-6.mp3    s6        04            Joyful Praise: The Impact of
                                           the Gospel (Day 3 evening)
  session-5.mp3    s5        05            Making Godly Impact (Day 4)
  session-4.mp3    s4        Panel         Navigating Our Identity as
                                           Christians (Day 3 panel)

Two things to notice. The panel is id s4 but is no longer numbered —
it sits last on the page and shows "Panel" where a numeral would be.
And Joyful Praise is id s6 but displays fourth, because it was added
after the other five and giving it a new id avoided moving anyone's
saved progress. Name its file session-6.mp3 to match its id.

Then open index.html in a text editor, find the MEDIA block near the
top of the <script> section, and fill in the paths + YouTube links:

  const MEDIA = {
    s1:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-1.mp3" },
    s2:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-2.mp3" },
    s3:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-3.mp3" },
    s4:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-4.mp3" },
    s5:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-5.mp3" },
    s6:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-6.mp3" }
  };

Anything left as "" simply shows a greyed-out "coming soon" button,
so you can publish now and add media later.

Keep files under ~10 MB each if you can — mobile data adds up.
