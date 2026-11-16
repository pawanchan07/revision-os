package com.pawanchander.revisionos;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONObject;

/**
 * Shows a nudge when its alarm fires, and handles the buttons on it:
 *   Start        opens the right screen
 *   Later        the same nudge again in an hour
 *   Show answer  turns a review nudge into its answer, in place
 *   Got it / Missed it   records the review without opening the app
 */
public class ReminderReceiver extends BroadcastReceiver {
    static final String P = "com.pawanchander.revisionos.";
    static final String ACT_SHOW = P + "SHOW", ACT_SNOOZE = P + "SNOOZE", ACT_REVEAL = P + "REVEAL", ACT_GRADE = P + "GRADE";
    static final String CHANNEL = "nudge";
    static final int NOTIFICATION_ID = 1;              // one slot: a newer nudge replaces an unread older one

    @Override
    public void onReceive(Context c, Intent intent) {
        String act = intent.getAction();
        int id = intent.getIntExtra("id", -1);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (ACT_SNOOZE.equals(act)) {
            nm.cancel(NOTIFICATION_ID);
            Reminders.snooze(c, id);
            return;
        }
        if (ACT_GRADE.equals(act)) {
            Reminders.inbox(c, intent.getStringExtra("cid"), intent.getStringExtra("grade"));
            nm.cancel(NOTIFICATION_ID);
            return;
        }
        JSONObject r = Reminders.find(c, id);
        if (r == null || !nm.areNotificationsEnabled()) return;
        post(c, nm, r, ACT_REVEAL.equals(act));
    }

    private static PendingIntent self(Context c, String action, int id, int slot, String cid, String grade) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction(action).putExtra("id", id);
        if (cid != null) i.putExtra("cid", cid).putExtra("grade", grade);
        return PendingIntent.getBroadcast(c, id * 10 + slot, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static Intent open(Context c, String route) {
        return new Intent(c, MainActivity.class)
                .setAction(Intent.ACTION_MAIN)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP)
                .putExtra("route", route);
    }

    private static void post(Context c, NotificationManager nm, JSONObject r, boolean reveal) {
        if (Build.VERSION.SDK_INT >= 26) {
            // High importance, so it arrives as a banner at the top of the screen.
            NotificationChannel ch = new NotificationChannel(CHANNEL, c.getString(R.string.channel_name), NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription(c.getString(R.string.channel_desc));
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
            nm.deleteNotificationChannel("daily");     // the quieter channel from earlier versions
        }
        int id = r.optInt("id", 0);
        String route = r.optString("route", "#/");
        String title = r.optString("title", c.getString(R.string.app_name));
        String body = r.optString("body", "");
        String question = r.optString("q", ""), answer = r.optString("a", ""), cid = r.optString("cid", "");
        boolean quiz = question.length() > 0 && answer.length() > 0 && cid.length() > 0;
        PendingIntent tap = PendingIntent.getActivity(c, id, open(c, route), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_revos)
                .setColor(0xFF8F7DFF)
                .setContentIntent(tap)
                .setAutoCancel(true)
                .setShowWhen(true)
                .setCategory(Notification.CATEGORY_REMINDER)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .setPriority(Notification.PRIORITY_HIGH)
                .setOnlyAlertOnce(reveal);

        if (reveal && quiz) {
            if (answer.length() > 700) answer = answer.substring(0, 700) + "...";
            b.setContentTitle(question).setContentText(answer).setStyle(new Notification.BigTextStyle().bigText(answer))
                    .addAction(0, c.getString(R.string.act_got), self(c, ACT_GRADE, id, 3, cid, "good"))
                    .addAction(0, c.getString(R.string.act_missed), self(c, ACT_GRADE, id, 4, cid, "miss"));
        } else {
            b.setContentTitle(title).setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body));
            if (quiz) b.addAction(0, c.getString(R.string.act_reveal), self(c, ACT_REVEAL, id, 2, null, null));
            else b.addAction(0, c.getString(R.string.act_start), tap);
            b.addAction(0, c.getString(R.string.act_later), self(c, ACT_SNOOZE, id, 1, null, null));

            // Full screen only when asked for and allowed. Android shows it full screen when the
            // phone is locked or idle, and as a banner when it is in use.
            if (r.optBoolean("fs", false) && Reminders.canFullScreen(c)) {
                Intent full = new Intent(c, NudgeActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_USER_ACTION)
                        .putExtra("id", id).putExtra("title", title).putExtra("body", body).putExtra("route", route)
                        .putExtra("label", r.optString("label", ""));
                b.setFullScreenIntent(PendingIntent.getActivity(c, 500 + id, full, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE), true);
            }
        }
        try {
            nm.notify(NOTIFICATION_ID, b.build());
        } catch (SecurityException ignored) { }
    }
}
