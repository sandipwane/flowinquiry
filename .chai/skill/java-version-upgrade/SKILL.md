---
name: java-version-upgrade
description: Upgrade Java version across a Gradle or Maven project. Finds and updates all version references in build configs (build.gradle, build.gradle.kts, pom.xml), Docker images (Dockerfile, Jib plugin), CI/CD pipelines (GitHub Actions, Jenkins, GitLab CI), and version manager files (.java-version, .sdkmanrc, .tool-versions). Use when the user wants to upgrade, bump, or change the Java/JDK version. Triggers on "upgrade Java to X", "bump JDK version", "migrate from Java X to Y", "update Java version".
---

# Java Version Upgrade

## Workflow

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

### 3. Apply — edit each file

Use the Edit tool to replace each reference. Pay attention to:

- **Version ranges/assertions** — e.g., `== "21" || "22" || "23"` → update the full range, not just the first match
- **String quoting** — preserve existing quote style (`'21'` vs `"21"` vs `21`)
- **Docker image suffixes** — preserve `-jre` vs `-jdk` suffix
- **Step names** — update descriptive text like `Set up JDK 21` → `Set up JDK 25`

### 4. Verify — build and test

Run the project's build command:

```bash
./gradlew clean build    # Gradle
mvn clean verify         # Maven
```

If the build fails, diagnose and fix. Common issues:
- Gradle wrapper too old for the new Java version → update with `./gradlew wrapper --gradle-version=<latest>`
- Deprecated APIs removed in new version → fix source code
- Plugin incompatibility → update plugin versions

### 5. Report — summarize changes

List all files modified and flag anything needing manual attention:
- Framework compatibility (Spring Boot, Quarkus minimum Java version)
- README/docs still referencing the old version
- Deprecation warnings in build output
