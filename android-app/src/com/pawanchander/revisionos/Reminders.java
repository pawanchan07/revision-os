package com.pawanchander.revisionos;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Reminders are planned by the web app and stored here as a short list. Each one is a single
 * alarm. There is no background service and nothing polls: Android wakes the app only at the
 * planned time. The alarms are inexact on purpose (no special permission needed), so Android
 * may deliver one some minutes late, and battery saver can delay it further.
 */
final class Reminders {
    static final int[] IDS = { 1, 2, 3, 4, 5, 6, 7, 99 };
    private static final String PREFS = "reminders", KEY = "list";

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
        Intent i = new Intent(c, ReminderReceiver.class).setAction("com.pawanchander.revisionos.REMIND").putExtra("id", id);
        return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Cancels every alarm we own, then sets one per stored reminder that is still in the future. */
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
}
