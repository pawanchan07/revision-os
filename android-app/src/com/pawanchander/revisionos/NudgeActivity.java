package com.pawanchander.revisionos;

import android.app.Activity;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * The full-screen nudge: today's question on the lock screen with one obvious button.
 * Built in code so it needs no layout files. Shown only when you have turned it on.
 */
public class NudgeActivity extends Activity implements View.OnClickListener {
    private static final int START = 1, LATER = 2;
    private int id;
    private String route;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
        getWindow().setStatusBarColor(MainActivity.BG_DARK);
        getWindow().setNavigationBarColor(MainActivity.BG_DARK);

        id = getIntent().getIntExtra("id", -1);
        route = getIntent().getStringExtra("route");
        String title = getIntent().getStringExtra("title");
        String body = getIntent().getStringExtra("body");
        String label = getIntent().getStringExtra("label");
        if (label == null || label.length() == 0) label = getString(R.string.nudge_label);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_VERTICAL);
        root.setPadding(dp(28), dp(48), dp(28), dp(40));
        // the same two soft lights as the app, top left to bottom right
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TL_BR, new int[] { 0xFF2A2466, 0xFF0E1020, 0xFF080912 });
        root.setBackground(bg);

        root.addView(text(label.toUpperCase(), 12, 0xFF49C4FF, true, 0.16f), gap(0));
        root.addView(text(title == null ? getString(R.string.app_name) : title, 30, 0xFFF2F3FA, true, 0f), gap(14));
        if (body != null && body.length() > 0) root.addView(text(body, 16, 0xFFB3B8D0, false, 0f), gap(14));

        TextView start = text(getString(R.string.act_start), 18, 0xFF0B0C18, true, 0.02f);
        start.setGravity(Gravity.CENTER);
        start.setPadding(dp(20), dp(18), dp(20), dp(18));
        GradientDrawable pill = new GradientDrawable(GradientDrawable.Orientation.LEFT_RIGHT, new int[] { 0xFF8F7DFF, 0xFF49C4FF });
        pill.setCornerRadius(dp(18));
        start.setBackground(pill);
        start.setId(START);
        start.setOnClickListener(this);
        root.addView(start, gap(36));

        TextView later = text(getString(R.string.act_later_long), 15, 0xFF7D84A3, false, 0f);
        later.setGravity(Gravity.CENTER);
        later.setPadding(dp(20), dp(16), dp(20), dp(16));
        later.setId(LATER);
        later.setOnClickListener(this);
        root.addView(later, gap(6));

        setContentView(root, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private int dp(int v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private LinearLayout.LayoutParams gap(int top) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        p.topMargin = dp(top);
        return p;
    }

    private TextView text(String s, int sp, int color, boolean bold, float spacing) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        t.setLineSpacing(0f, 1.15f);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        if (spacing > 0f) t.setLetterSpacing(spacing);
        return t;
    }

    @Override
    public void onClick(View v) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(ReminderReceiver.NOTIFICATION_ID);
        if (v.getId() == START) {
            if (Build.VERSION.SDK_INT >= 26) {
                KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
                if (km != null) km.requestDismissKeyguard(this, null);      // asks for your unlock, then continues
            }
            startActivity(ReminderReceiver.open(this, route == null ? "#/" : route));
        } else {
            Reminders.snooze(this, id);
        }
        finish();
    }
}
