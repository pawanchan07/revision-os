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

/** Runs when a planned reminder is due and shows it. Tapping it opens the right screen. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String CHANNEL = "daily";
    private static final int NOTIFICATION_ID = 1;      // one slot: a newer reminder replaces an unread older one

    @Override
    public void onReceive(Context c, Intent intent) {
        JSONObject r = Reminders.find(c, intent.getIntExtra("id", -1));
        if (r == null) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || !nm.areNotificationsEnabled()) return;

        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, c.getString(R.string.channel_name), NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription(c.getString(R.string.channel_desc));
            nm.createNotificationChannel(ch);
        }

        Intent open = new Intent(c, MainActivity.class)
                .setAction(Intent.ACTION_MAIN)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP)
                .putExtra("route", r.optString("route", "#/"));
        PendingIntent tap = PendingIntent.getActivity(c, r.optInt("id", 0), open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String title = r.optString("title", c.getString(R.string.app_name));
        String body = r.optString("body", "");
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CHANNEL) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat_revos)
                .setColor(0xFF8F7DFF)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setContentIntent(tap)
                .setAutoCancel(true)
                .setShowWhen(true);
        try {
            nm.notify(NOTIFICATION_ID, b.build());
        } catch (SecurityException ignored) { }
    }
}
