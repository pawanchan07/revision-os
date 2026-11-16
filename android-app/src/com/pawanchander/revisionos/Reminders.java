package com.pawanchander.revisionos;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Nudges are planned by the web app and stored here as a short list. Each one is a single
 * alarm. There is no background service and nothing polls: Android wakes the app only at the
 * planned time. The alarms are inexact on purpose (no special permission needed), so Android
 * may deliver one some minutes late, and battery saver can delay it further.
 */
final class Reminders {
    static final int SNOOZE_ID = 98;
    static final int[] IDS = { 1, 2, 3, 4, 5, 6, 7, SNOOZE_ID, 99 };
    private static final String PREFS = "reminders", KEY = "list", INBOX = "inbox";

    private Reminders() { }

    static void save(Context c, String json) {
        try {
            new JSONArray(json);                       // refuse anything that is not a list
        } catch (Exception e) {
            json = "[]";
        }
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply();
    }

    static JSONArray load(Context c) {
        try {
            return new JSONArray(c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    static JSONObject find(Context c, int id) {
        JSONArray list = load(c);
        for (int i = 0; i < list.length(); i++) {
            JSONObject o = list.optJSONObject(i);
            if (o != null && o.optInt("id", -1) == id) return o;
        }
        return null;
    }

    private static PendingIntent alarm(Context c, int id) {
        Intent i = new Intent(c, ReminderReceiver.class).setAction(ReminderReceiver.ACT_SHOW).putExtra("id", id);
        return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Cancels every alarm we own, then sets one per stored nudge that is still in the future. */
    static void apply(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        for (int id : IDS) am.cancel(alarm(c, id));
        JSONArray list = load(c);
        long now = System.currentTimeMillis();
        for (int i = 0; i < list.length(); i++) {
            JSONObject o = list.optJSONObject(i);
            if (o == null) continue;
            int id = o.optInt("id", -1);
            long at = o.optLong("at", 0);
            boolean ours = false;
            for (int known : IDS) if (known == id) ours = true;
            if (!ours || at <= now) continue;
            try {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, alarm(c, id));
            } catch (Exception ignored) { }
        }
    }

    /** "Later": the same nudge again in an hour, as a plain banner, never full screen. */
    static void snooze(Context c, int id) {
        JSONObject r = find(c, id);
        if (r == null) return;
        try {
            JSONObject again = new JSONObject(r.toString());
            again.put("id", SNOOZE_ID);
            again.put("at", System.currentTimeMillis() + 60L * 60L * 1000L);
            again.put("fs", false);
            JSONArray list = load(c), next = new JSONArray();
            for (int i = 0; i < list.length(); i++) {
                JSONObject o = list.optJSONObject(i);
                if (o != null && o.optInt("id", -1) != SNOOZE_ID) next.put(o);
            }
            next.put(again);
            save(c, next.toString());
            apply(c);
        } catch (Exception ignored) { }
    }

    /** An answer given from the notification itself. The app collects these the next time it opens. */
    static void inbox(Context c, String concept, String grade) {
        if (concept == null || grade == null) return;
        try {
            android.content.SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            JSONArray box = new JSONArray(p.getString(INBOX, "[]"));
            box.put(new JSONObject().put("cid", concept).put("grade", grade).put("at", System.currentTimeMillis()));
            p.edit().putString(INBOX, box.toString()).apply();
        } catch (Exception ignored) { }
    }

    static String takeInbox(Context c) {
        android.content.SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String box = p.getString(INBOX, "[]");
        p.edit().remove(INBOX).apply();
        return box;
    }

    /** Android 14 and later only let an app take the full screen if the user has allowed it. */
    static boolean canFullScreen(Context c) {
        if (Build.VERSION.SDK_INT < 34) return true;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm != null && nm.canUseFullScreenIntent();
    }
}
