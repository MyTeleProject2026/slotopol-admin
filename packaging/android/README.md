# Slotopol Admin Android packaging

Canonical native Android package for the Slotopol Admin web application.

Package: `com.mytele.slotopol.admin`.

Override the deployment URL with `-PwebAppUrl=...` when the web deployment hostname changes.

Build with `./gradlew assembleRelease bundleRelease`. GitHub Actions builds a real APK and AAB on every `main` push and manual run. The project targets Android API 36 and uses JDK 17 in CI.

No signing keys are committed. Configure the production signing key in the release pipeline before store publication.
