<script setup lang="ts">
const legal = {
  name: import.meta.env.VITE_LEGAL_NAME as string,
  email: import.meta.env.VITE_LEGAL_EMAIL as string,
  addressLine1: import.meta.env.VITE_LEGAL_ADDRESS_LINE_1 as string,
  addressLine2: import.meta.env.VITE_LEGAL_ADDRESS_LINE_2 as string,
  country: import.meta.env.VITE_LEGAL_COUNTRY as string,
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Datenschutzerklärung</h1>

    <div class="prose prose-gray max-w-none space-y-4 text-sm">
      <section>
        <h2 class="text-lg font-semibold text-gray-800">1. Datenschutz auf einen Blick</h2>

        <h3 class="font-semibold text-gray-700 mt-3">Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
          Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Datenerfassung auf dieser Website</h3>
        <p>
          <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
          Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
        </p>
        <p>
          <strong>Wie erfassen wir Ihre Daten?</strong><br />
          Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierfür
          können sich z. B. Daten, die Sie in ein Kontaktformular eingeben. Andere Daten werden
          automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
          IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser,
          Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
          automatisch, sobald Sie diese Website betreten.
        </p>
        <p>
          <strong>Wofür nutzen wir Ihre Daten?</strong><br />
          Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
          gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
        </p>
        <p>
          <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
          Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein
          Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
          Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
          jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
          Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-800">2. Hosting</h2>
        <p>
          Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die
          personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern
          des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen,
          Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und
          sonstige Daten, die über eine Website generiert werden, handeln.
        </p>
        <p>
          Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren
          potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer
          sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen
          professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <p>
          Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung seiner
          Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese Daten
          befolgen.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-800">3. Allgemeine Hinweise und Pflichtinformationen</h2>

        <h3 class="font-semibold text-gray-700 mt-3">Datenschutz</h3>
        <p>
          Der Betreiber dieser Seite nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir
          behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
          Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>
        <p>
          Wenn Sie diese Website besuchen, werden verschiedene personenbezogene Daten erhoben.
          Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können.
          Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir
          sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
        </p>
        <p>
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der
          Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der
          Daten vor dem Zugriff durch Dritte ist nicht möglich.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Hinweis zur verantwortlichen Stelle</h3>
        <p>
          Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
        </p>
        <p>
          {{ legal.name }}<br />
          {{ legal.addressLine1 }}<br />
          {{ legal.addressLine2 }}
        </p>
        <p>
          E-Mail: <a :href="`mailto:${legal.email}`" class="text-blue-600 hover:text-blue-800 underline">{{ legal.email }}</a>
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Speicherdauer</h3>
        <p>
          Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
          wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
          Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder
          eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern
          wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
          personenbezogenen Daten haben.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
        <p>
          Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung
          möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die
          Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
          unberührt.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Beschwerderecht bei der Aufsichtsbehörde</h3>
        <p>
          Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
          einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen
          Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das
          Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
          gerichtlicher Rechtsbehelfe.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-800">4. Datenerfassung auf dieser Website</h2>

        <h3 class="font-semibold text-gray-700 mt-3">Server-Log-Dateien</h3>
        <p>
          Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
          Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
        </p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p class="mt-2">
          Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
          Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
          Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien
          Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files
          erfasst werden.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Cookies</h3>
        <p>
          Diese Website verwendet keine Cookies oder andere Tracking-Technologien. Es werden
          keine Daten zu Analyse- oder Marketingzwecken erhoben.
        </p>

        <h3 class="font-semibold text-gray-700 mt-3">Dritte</h3>
        <p>
          Diese Website bindet keine externen Dienste wie Tracking, Analyse-Tools, soziale
          Medien oder externe Schriftarten ein. Es werden keine Daten an Dritte weitergegeben.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-800">5. Datenquelle RKI</h2>
        <p>
          Die auf dieser Website dargestellten Daten werden vom Robert Koch-Institut (RKI)
          bereitgestellt und sind öffentlich zugänglich. Es werden keine personenbezogenen
          Daten verarbeitet. Die Daten enthalten ausschließlich aggregierte
          Hospitalisierungsinzidenzen nach Altersgruppe, Kalenderwoche und SARI-Typ.
        </p>
      </section>
    </div>
  </div>
</template>
