AUDIO SUMMARIES — where to put your files
=========================================

Drop your audio summary files in THIS folder, named exactly:

  session-1.mp3   The Message of the Gospel (Day 1)
  session-2.mp3   The Gospel: The Powerful Transformation (Day 2 Morning)
  session-3.mp3   The Holy Spirit at Work in You (Night of Power)
  session-4.mp3   Navigating Our Identity as Christians (Panel)
  session-5.mp3   Making Godly Impact (Day 4)

Then open index.html in a text editor, find the MEDIA block near the
top of the <script> section, and fill in the paths + YouTube links:

  const MEDIA = {
    s1:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-1.mp3" },
    s2:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-2.mp3" },
    s3:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-3.mp3" },
    s4:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-4.mp3" },
    s5:{ youtube:"https://youtu.be/XXXXXXX", audio:"audio/session-5.mp3" }
  };

Anything left as "" simply shows a greyed-out "coming soon" button,
so you can publish now and add media later.

Keep files under ~10 MB each if you can — mobile data adds up.
