// Portfolio renderer — reads resume.json (JSON Resume schema) and renders every
// populated section. Empty sections stay hidden. No framework, no build step.

// Minimal escaping so résumé text can't inject markup.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function show(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.hidden = false;
}

async function loadPortfolio() {
  let data;
  try {
    const res = await fetch("resume.json");
    if (!res.ok) throw new Error(res.statusText);
    data = await res.json();
  } catch (e) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Could not load <code>resume.json</code> — check that it exists and is valid JSON.</p>";
    return;
  }

  const b = data.basics || {};
  document.title = b.name ? `${b.name} — Portfolio` : "Portfolio";

  // Hero
  const linkedin = (b.profiles || []).find((p) => /linkedin/i.test(p.network));
  document.getElementById("hero").innerHTML = `
    ${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.name)}" class="avatar" onerror="this.remove()" />` : ""}
    <h1>${esc(b.name)}</h1>
    ${b.label ? `<p class="label">${esc(b.label)}</p>` : ""}
    ${b.location ? `<p class="location">${esc(b.location.city)}${b.location.region ? ", " + esc(b.location.region) : ""}</p>` : ""}
    <nav class="links">
      ${b.email ? `<a href="mailto:${esc(b.email)}">Email</a>` : ""}
      ${b.phone ? `<a href="tel:${esc(b.phone)}">Call</a>` : ""}
      ${linkedin ? `<a href="${esc(linkedin.url)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
    </nav>
  `;

  // Summary
  if (b.summary) {
    document.getElementById("summary").textContent = b.summary;
    show("summary-section");
  }

  // Experience
  if ((data.work || []).length) {
    document.getElementById("work-list").innerHTML = data.work.map((w) => `
      <article class="entry">
        <h3>${esc(w.position)}${w.name ? " · " + esc(w.name) : ""}</h3>
        <span class="dates">${esc(w.startDate)} – ${esc(w.endDate || "Present")}</span>
        ${w.summary ? `<p>${esc(w.summary)}</p>` : ""}
        ${(w.highlights || []).length ? `<ul>${w.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      </article>`).join("");
    show("experience-section");
  }

  // Projects
  if ((data.projects || []).length) {
    document.getElementById("project-list").innerHTML = data.projects.map((p) => `
      <article class="entry">
        <h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3>
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
      </article>`).join("");
    show("projects-section");
  }

  // Skills
  if ((data.skills || []).length) {
    document.getElementById("skill-list").innerHTML = data.skills.map((s) => `
      <div class="skill"><strong>${esc(s.name)}</strong>${(s.keywords || []).length ? ": " + s.keywords.map(esc).join(", ") : ""}</div>
    `).join("");
    show("skills-section");
  }

  // Education
  if ((data.education || []).length) {
    document.getElementById("edu-list").innerHTML = data.education.map((e) => `
      <article class="entry">
        <h3>${esc(e.studyType)}${e.area ? " · " + esc(e.area) : ""}</h3>
        <span class="dates">${esc(e.startDate)} – ${esc(e.endDate || "")}</span>
        <p>${esc(e.institution)}</p>
      </article>`).join("");
    show("education-section");
  }

  // Certificates
  if ((data.certificates || []).length) {
    document.getElementById("cert-list").innerHTML = data.certificates.map((c) => `
      <div class="skill"><strong>${esc(c.name)}</strong>${c.issuer ? " — " + esc(c.issuer) : ""}${c.date ? ` (${esc(c.date)})` : ""}</div>
    `).join("");
    show("certificates-section");
  }

  // Contact
  if (b.email) {
    document.getElementById("contact-btn").href = `mailto:${esc(b.email)}`;
    show("contact-section");
  }
}

loadPortfolio();
