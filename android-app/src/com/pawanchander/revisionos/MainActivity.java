package com.pawanchander.revisionos;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * The whole Android app is this one screen: a WebView showing the Revision OS web app,
 * whose files are packaged inside the APK. Nothing is loaded from the network.
 *
 * The packaged files are served under a private https address, so the app behaves exactly
 * as it does on the web (fetch, storage, secure-context features) while staying offline.
 */
public class MainActivity extends Activity {
    static final String HOST = "revisionos.localapp";
    static final String START = "https://" + HOST + "/os/index.html";
    static final int BG_DARK = 0xFF080912, BG_LIGHT = 0xFFF6F6FB;
    static final int REQ_NOTIFY = 7;

    WebView web;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().setStatusBarColor(BG_DARK);
        getWindow().setNavigationBarColor(BG_DARK);

        web = new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.setBackgroundColor(BG_DARK);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // progress, streak and the unfinished session live here
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);

        web.addJavascriptInterface(new Bridge(this), "RevosNative");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new Client(this));

        web.loadUrl(START + hashFrom(getIntent()));
    }

    /** Serves one packaged file. Unknown paths get a 404, never a network request. */
    WebResourceResponse asset(String path) {
        if (path == null || path.isEmpty() || path.endsWith("/")) path = (path == null ? "/" : path) + "index.html";
        if (path.contains("..")) return notFound();
        try {
            InputStream in = getAssets().open("www" + path);
            WebResourceResponse r = new WebResourceResponse(mime(path), isText(path) ? "utf-8" : null, in);
            Map<String, String> h = new HashMap<String, String>();
            h.put("Cache-Control", "no-cache");
            r.setResponseHeaders(h);
            return r;
        } catch (IOException e) {
            return notFound();
        }
    }

    static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }

    private static boolean isText(String p) {
        return p.endsWith(".html") || p.endsWith(".js") || p.endsWith(".css") || p.endsWith(".json") || p.endsWith(".svg");
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    /**
     * Where a launch should land. A reminder carries the screen in an extra; a deep link
     * carries it in the address (revisionos://c/apis). Only plain route characters are accepted.
     */
    static String hashFrom(Intent intent) {
        if (intent == null) return "";
        String route = intent.getStringExtra("route");
        Uri data = intent.getData();
        if (route == null && data != null && "revisionos".equals(data.getScheme())) {
            String host = data.getHost() == null ? "" : data.getHost();
            String path = data.getPath() == null ? "" : data.getPath();
            route = "#/" + host + path;
        }
        if (route == null || !route.matches("#/[A-Za-z0-9/_-]{0,120}")) return "";
        return route;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String h = hashFrom(intent);
        if (!h.isEmpty() && web != null) web.evaluateJavascript("location.hash='" + h + "'", null);
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onBackPressed() {
        if (web == null) { moveTaskToBack(true); return; }
        // The web app decides: close the palette, go back a screen, or report that it is at the start.
        web.evaluateJavascript("(window.__revosBack ? window.__revosBack() : false)", new BackResult(this));
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("window.__revosResume && window.__revosResume()", null);
        }
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ((ViewGroup) web.getParent()).removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code != REQ_NOTIFY || web == null) return;
        boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
        web.evaluateJavascript("window.__revosPerm && window.__revosPerm(" + ok + ")", null);
    }

    boolean notificationsAllowed() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && !nm.areNotificationsEnabled()) return false;
        return Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    void openExternal(String url) {
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (Exception ignored) { }
    }

    /** Serves packaged files and sends every other address to the browser. */
    static final class Client extends WebViewClient {
        private final MainActivity a;

        Client(MainActivity activity) { a = activity; }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if (!HOST.equals(u.getHost())) return null;
            return a.asset(u.getPath());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if (HOST.equals(u.getHost())) return false;
            a.openExternal(u.toString());          // source links and the web guide open in the browser
            return true;
        }
    }

    /** The web app answers whether it handled Back. If not, the app goes to the background. */
    @SuppressWarnings({"rawtypes", "unchecked"})
    static final class BackResult implements ValueCallback {
        private final MainActivity a;

        BackResult(MainActivity activity) { a = activity; }

        @Override
        public void onReceiveValue(Object handled) {      // untyped on purpose: the typed form adds a bridge method the dex tool rejects
            if (!"true".equals(String.valueOf(handled))) a.moveTaskToBack(true);
        }
    }

    /** Work the bridge needs done on the main thread. */
    static final class UiTask implements Runnable {
        static final int MINIMIZE = 0, ASK_NOTIFY = 1, BARS = 2;
        private final MainActivity a;
        private final int kind;
        private final boolean flag;

        UiTask(MainActivity activity, int kind, boolean flag) { a = activity; this.kind = kind; this.flag = flag; }

        @Override
        public void run() {
            if (kind == MINIMIZE) {
                a.moveTaskToBack(true);
            } else if (kind == ASK_NOTIFY) {
                if (Build.VERSION.SDK_INT >= 33 && a.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    a.requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, REQ_NOTIFY);
                } else if (a.web != null) {
                    a.web.evaluateJavascript("window.__revosPerm && window.__revosPerm(" + a.notificationsAllowed() + ")", null);
                }
            } else if (kind == BARS) {
                int c = flag ? BG_DARK : BG_LIGHT;
                a.getWindow().setStatusBarColor(c);
                a.getWindow().setNavigationBarColor(c);
                if (a.web != null) a.web.setBackgroundColor(c);
                View d = a.getWindow().getDecorView();
                int flags = d.getSystemUiVisibility();
                int light = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | (Build.VERSION.SDK_INT >= 26 ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0);
                d.setSystemUiVisibility(flag ? (flags & ~light) : (flags | light));
            }
        }
    }

    /** What the web app can ask Android to do. Every method is small and checks its input. */
    static final class Bridge {
        private final MainActivity a;

        Bridge(MainActivity activity) { a = activity; }

        /** "12,40,18" means vibrate 12ms, pause 40ms, vibrate 18ms. */
        @JavascriptInterface
        public void vibrate(String pattern) {
            try {
                String[] parts = pattern.split(",");
                if (parts.length == 0 || parts.length > 12) return;
                long[] timings = new long[parts.length + 1];
                timings[0] = 0;
                for (int i = 0; i < parts.length; i++) timings[i + 1] = Math.max(1, Math.min(400, Long.parseLong(parts[i].trim())));
                Vibrator v = (Vibrator) a.getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator()) return;
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(timings, -1));
                else v.vibrate(timings, -1);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public boolean notifyAllowed() {
            return a.notificationsAllowed();
        }

        /** Asks for notification permission where Android requires asking, then reports the answer to the page. */
        @JavascriptInterface
        public void requestNotify() {
            a.runOnUiThread(new UiTask(a, UiTask.ASK_NOTIFY, false));
        }

        /** Replaces every planned reminder with this list: [{id, at, title, body, route}]. An empty list cancels all. */
        @JavascriptInterface
        public void schedule(String json) {
            Reminders.save(a, json);
            Reminders.apply(a);
        }

        /** Answers given from a notification since the app was last open, as a JSON list. Reading empties it. */
        @JavascriptInterface
        public String takeInbox() {
            return Reminders.takeInbox(a);
        }

        @JavascriptInterface
        public boolean fullScreenAllowed() {
            return Reminders.canFullScreen(a);
        }

        /** Opens the Android screen where full-screen notifications are allowed for this app. */
        @JavascriptInterface
        public void requestFullScreen() {
            try {
                Intent i = Build.VERSION.SDK_INT >= 34
                        ? new Intent(android.provider.Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + a.getPackageName()))
                        : new Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, a.getPackageName());
                a.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void minimize() {
            a.runOnUiThread(new UiTask(a, UiTask.MINIMIZE, false));
        }

        @JavascriptInterface
        public void open(String url) {
            a.openExternal(url);
        }

        /** Keeps the system bars in step with the app theme. */
        @JavascriptInterface
        public void setBars(boolean dark) {
            a.runOnUiThread(new UiTask(a, UiTask.BARS, dark));
        }

        @JavascriptInterface
        public String version() {
            try {
                return a.getPackageManager().getPackageInfo(a.getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "";
            }
        }
    }
}
