---
name: java-version-upgrade
description: Upgrade Java version across a Gradle or Maven project. Finds and updates all version references in build configs (build.gradle, build.gradle.kts, pom.xml), Docker images (Dockerfile, Jib plugin), CI/CD pipelines (GitHub Actions, Jenkins, GitLab CI), and version manager files (.java-version, .sdkmanrc, .tool-versions). Handles Gradle wrapper upgrades, Spotless/google-java-format compatibility, JaCoCo migration, and Gradle deprecation fixes. Use when the user wants to upgrade, bump, or change the Java/JDK version. Triggers on "upgrade Java to X", "bump JDK version", "migrate from Java X to Y", "update Java version".
---

# Java Version Upgrade

## Workflow

### 0. Prerequisites — check & install target JDK

Before anything else, ensure the target JDK is available locally.

**Check current JDK:**
```bash
java -version
```

**List all installed JDKs:**
- **macOS**: `/usr/libexec/java_home -V`
- **RHEL 9.7**: `alternatives --list java`

**Install target JDK if missing:**
- **macOS**: `brew search openjdk` then `brew install --cask microsoft-openjdk@<version>` or `brew install openjdk@<version>`
- **RHEL 9.7**: `dnf search java-<version>-openjdk` then `sudo dnf install java-<version>-openjdk-devel`
- **Fallback**: SDKMAN — `sdk install java <version>-tem`

**Verify installation:**
```bash
JAVA_HOME=$(/usr/libexec/java_home -v <version>) $JAVA_HOME/bin/java -version
```

**Set for build** — prefix all gradle/maven commands with:
```bash
JAVA_HOME=$(/usr/libexec/java_home -v <version>)
```

### 1. Discover — find all version references

Search the repo for the old Java version in these locations (skip `node_modules`, `build`, `.gradle`, `.next`, `dist`):

**Build configs:**
- `**/build.gradle`, `**/build.gradle.kts` — `sourceCompatibility`, `targetCompatibility`, `jvmToolchain()`, `JavaLanguageVersion.of()`
- `**/pom.xml` — `<java.version>`, `<maven.compiler.source>`, `<maven.compiler.target>`, `<maven.compiler.release>`
- `**/gradle.properties` — any `javaVersion` property
- `**/buildSrc/**/*.gradle` — convention plugins (Docker base images, toolchain)

**Docker:**
- `**/Dockerfile*` — `FROM` image tags (`eclipse-temurin:X-jre`, `openjdk:X`, `amazoncorretto:X`)
- Jib plugin config — `from.image` in Gradle/Maven

**CI/CD:**
- `.github/workflows/*.yml` — `java-version` in `setup-java` action, step names
- `Jenkinsfile` — JDK tool name
- `.gitlab-ci.yml` — image tags

**Version manager files:**
- `.java-version`, `.sdkmanrc`, `.tool-versions`

Present a summary table to the user:

```
| File | Line | Current |
|------|------|---------|
| build.gradle | 26 | sourceCompatibility = 21 |
| ... | ... | ... |
```

### 2. Confirm — get user approval before editing

Ask: "Found N references in M files. Proceed with upgrading Java OLD → NEW?"

Do NOT edit files until the user confirms.

### 3. Compatibility Check — Gradle & tooling versions

Before editing, check compatibility of all build tooling with the target Java version:

**Gradle version:**
- Look up [Gradle compatibility matrix](https://docs.gradle.org/current/userguide/compatibility.html) for target Java version support
- Common requirements: Java 25 requires Gradle >= 9.1.0
- If Gradle major version jump needed (e.g. 8.x → 9.x), warn user about potential breaking changes
- Check current version in `gradle/wrapper/gradle-wrapper.properties`

**Spotless / google-java-format:**
- google-java-format uses `com.sun.tools.javac` internals — each Java version can break it
- Check latest GJF version: `gh api repos/google/google-java-format/releases/latest --jq '.tag_name'`
- May also need to update Spotless plugin version
- Check current versions in `libs.versions.toml` or `buildSrc/build.gradle`

**JaCoCo:**
- Ensure JaCoCo version supports the target Java version
- Check `toolVersion` in build.gradle JaCoCo config

Present compatibility findings to user before proceeding. Example:

```
| Tool | Current | Required | Action |
|------|---------|----------|--------|
| Gradle | 8.14.2 | >= 9.1.0 | Upgrade wrapper |
| google-java-format | 1.19.1 | 1.25.0 | Update in libs.versions.toml |
| JaCoCo | 0.8.11 | 0.8.13+ | Update toolVersion |
```

### 4. Apply — edit each file

**Version references** (same as Discover list):
- **Version ranges/assertions** — e.g., `== "21" || "22" || "23"` → update the full range, not just the first match
- **String quoting** — preserve existing quote style (`'21'` vs `"21"` vs `21`)
- **Docker image suffixes** — preserve `-jre` vs `-jdk` suffix
- **Step names** — update descriptive text like `Set up JDK 21` → `Set up JDK 25`

**Gradle wrapper upgrade** (if needed):
- Direct edit `distributionUrl` in `gradle/wrapper/gradle-wrapper.properties`
- Cannot run `./gradlew wrapper --gradle-version=X` if buildSrc fails with `Unsupported class file major version`
- Update URL pattern: `https://services.gradle.org/distributions/gradle-<version>-bin.zip`

**Spotless / google-java-format version:**
- Update GJF version in Spotless config: `googleJavaFormat('<version>').aosp()`
- Update Spotless plugin version in `libs.versions.toml` or `buildSrc/build.gradle`

**Gradle 9.x deprecation fixes** (if Gradle major version changed):
- `$buildDir` → `project.layout.buildDirectory.dir(...)` or `.file(...)`
- JaCoCo `destination` → `outputLocation`
- `destinationFile = file(...)` → `destinationFile = project.layout.buildDirectory.file(...).get().asFile`

### 5. Verify — build and test

Run the project's build command with the correct JDK:

```bash
JAVA_HOME=$(/usr/libexec/java_home -v <version>) ./gradlew clean build    # Gradle
JAVA_HOME=$(/usr/libexec/java_home -v <version>) mvn clean verify         # Maven
```

**Troubleshooting guide:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Unsupported class file major version XX` | Gradle wrapper too old for target JDK | Update `distributionUrl` in gradle-wrapper.properties |
| `NoSuchMethodError` on `com.sun.tools.javac.*` | google-java-format incompatible with target JDK | Update GJF version in Spotless config |
| `Could not set unknown property 'destination'` | JaCoCo API changed in Gradle 9.x | Migrate `destination` → `outputLocation` |
| Spotless formatting failures after version bump | New GJF version reformats differently | Run `./gradlew spotlessApply` to auto-reformat |

**Common Java class file major versions:** Java 21=65, 22=66, 23=67, 24=68, 25=69

### 6. Report — summarize changes

List all files modified and include:
- Java version change (OLD → NEW)
- Gradle version change (if any)
- Spotless / google-java-format version change (if any)
- JaCoCo version change (if any)
- Auto-reformatted files from `spotlessApply` (if any)
- `JAVA_HOME` setup instructions for the user's local environment

Flag anything needing manual attention:
- Framework compatibility (Spring Boot, Quarkus minimum Java version)
- README/docs still referencing the old version
- Deprecation warnings in build output
- Deployment target considerations (e.g., RHEL 9.7 JDK availability)
