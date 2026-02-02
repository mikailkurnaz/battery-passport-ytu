const passports = [
  {
    id: "NMC-BAT-2025-FR-8105",
    // ✅ başında / YOK! mutlaka ./ olmalı
    path: "./passport/nmc-bat-2025-fr-8105.json"
  }
];

const elSelect = document.getElementById("passportSelect");
const elSummary = document.getElementById("summary");
const elRaw = document.getElementById("raw");
const elStatus = document.getElementById("statusPill");

// Eğer index.html’de bu id’ler yoksa zaten çalışmaz:
if (!elSelect || !elSummary || !elRaw || !elStatus) {
  document.body.innerHTML = "Hata: index.html içinde gerekli id'ler yok (passportSelect, summary, raw, statusPill).";
  throw new Error("Missing HTML elements");
}

// dropdown doldur
for (const p of passports) {
  const opt = document.createElement("option");
  opt.value = p.path;
  opt.textContent = p.id;
  elSelect.appendChild(opt);
}

elSelect.addEventListener("change", () => load(elSelect.value));

// ilk yükleme
load(passports[0].path);

function pillText(status) {
  return status === "production" ? "Production" : "Prototype / Demo";
}

async function load(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`JSON bulunamadı: ${path} (HTTP ${res.status})`);
    const data = await res.json();

    elStatus.textContent = pillText(data?.passport?.status);

    const rows = [
      ["Pasaport ID", data?.passport?.id ?? "—"],
      ["Versiyon", data?.passport?.version ?? "—"],
      ["Batarya Türü", data?.battery?.batteryType ?? "—"],
      ["Model", data?.battery?.model ?? "—"],
      ["Kimya", data?.battery?.chemistry?.label ?? "—"],
      ["Üretim (Yıl)", data?.battery?.manufacturing?.year ?? "—"],
      ["Üretim (Ülke)", data?.battery?.manufacturing?.country ?? "—"],
      ["Karbon Ayak İzi", data?.carbonFootprint?.total
        ? `${data.carbonFootprint.total.value} ${data.carbonFootprint.total.unit}`
        : "—"
      ]
    ];

    elSummary.innerHTML = rows
      .map(([k, v]) => `
        <div style="padding:8px 0; border-bottom:1px solid #eee;">
          <div style="font-size:12px; color:#666;">${escapeHtml(k)}</div>
          <div style="font-weight:700;">${escapeHtml(v)}</div>
        </div>
      `)
      .join("");

    elRaw.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    elSummary.innerHTML = `<b>Hata:</b> ${escapeHtml(String(e))}`;
    elRaw.textContent = "";
    elStatus.textContent = "Hata";
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}
