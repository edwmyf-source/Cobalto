package com.redcobalto.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * Cuando alguien comparte texto o un enlace hacia RedCobalto desde otra app
 * (LinkedIn, WhatsApp, Facebook...), Android abre esta actividad con un
 * Intent de tipo ACTION_SEND. En vez de abrir la pantalla de inicio normal,
 * se lleva al WebView a /compartir con ese contenido — esa pantalla abre el
 * cuadro de publicar ya con el texto puesto, y la persona solo confirma con
 * un toque. Nunca se publica nada de forma automatica.
 */
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handleShareIntent(getIntent());
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleShareIntent(intent);
  }

  private void handleShareIntent(Intent intent) {
    if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
    String type = intent.getType();
    if (type == null || !type.startsWith("text/")) return;

    String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
    String text = intent.getStringExtra(Intent.EXTRA_TEXT);
    if (text == null) return;

    Uri.Builder builder = Uri.parse("https://www.redcobalto.com/compartir").buildUpon();
    if (subject != null) builder.appendQueryParameter("titulo", subject);
    builder.appendQueryParameter("texto", text);

    String url = builder.build().toString();
    getBridge().getWebView().post(() -> getBridge().getWebView().loadUrl(url));
  }
}
