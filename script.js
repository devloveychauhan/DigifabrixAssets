/* ==========================================================
   STATE
========================================================== */

let barChart = null;
let lineChart = null;

/* ==========================================================
   PLAN FUNCTIONS
========================================================== */

function reloadPlans() {
    const d = document.getElementById("planDate")?.value;
    const s = document.getElementById("shiftId")?.value;
    if (!d || !s) return;

    window.location.href = `?date=${encodeURIComponent(d)}&shift_id=${encodeURIComponent(s)}`;
}

function setKpi(p) {
    const map = {
        kDate: `${p.PlanDate} (${p.ShiftName})`,
        kTime: p.ServerTime,
        kLine: p.LineName,
        kModel: p.Model || "-",
        kSfg: p.SFG_Code,
        kTotalPlan: p.TotalPlan,
        kTotalActual: p.TotalActual,
        kTargetUph: p.Target_UPH,
        kActualUph: p.ActualUPH
    };

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    });
}

// tables

function buildRows(rows) {
    const body = document.getElementById("tableBody");
    if (!body) return;

    body.innerHTML = "";

    if (!rows?.length) {
        body.innerHTML = `<tr><td colspan="6">No data</td></tr>`;
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${r.timing}</td>
      <td>${r.uph_target}</td>
      <td>${r["Cell Short"]}</td>
      <td>${r["Laser Weld"]}</td>
      <td>${r["BMS Mounting"]}</td>
      <td>${r["FQC"]}</td>
    `;
        body.appendChild(tr);
    });
}

async function loadPlan(planId) {
    try {
        const res = await fetch(`?ajax=1&plan_id=${planId}`, { cache: "no-store" });
        const js = await res.json();

        if (!js.ok) throw new Error(js.msg);

        setKpi(js.data.plan);
        buildRows(js.data.rows);

    } catch (err) {
        console.error("Load plan error:", err);
    }
}


function cssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function responsiveFont(base) {
    const w = window.innerWidth;
    if (w > 1800) return base + 2;
    if (w > 1200) return base;
    if (w > 768) return base - 1;
    return base - 2;
}


const barData = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    values: [108, 371, 315, 47, 336, 67, 372, 146, 254, 223, 90, 100]
};

const lineData = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    values: [98, 320, 290, 60, 300, 80, 350, 130, 220, 200, 100, 120]
};



function buildBarChartConfig(data) {
    return {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Monthly Output",
                data: data.values,
                backgroundColor: "#3b82f6",
                borderRadius: 4
            }]
        },
        options: getCommonChartOptions("Hundred"),
        plugins: [ChartDataLabels]
    };
}

function buildLineChartConfig(data) {
    return {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Performance Trend",
                data: data.values,
                borderColor: "#e63946",
                backgroundColor: "rgba(230,57,70,0.15)",
                pointBackgroundColor: "#e63946",
                pointBorderColor: "#e63946",
                pointRadius: 4,
                borderWidth: 2,
                tension: 0.35,
                fill: true
            }]
        },
        options: getCommonChartOptions("Efficiency %")
    };
}

/* ==========================================================
   COMMON CHART OPTIONS
========================================================== */

function getCommonChartOptions(yTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                labels: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(12) }
                }
            },
            datalabels: {
                color: cssVar("--text"),
                font: { size: responsiveFont(16) },
                anchor: "end",   // attach to end of bar
                align: "top",    // place above bar
                offset: 2,       // small gap from bar
                clamp: true
            }
        },
        scales: {
            x: {
                ticks: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) },
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) }
                },
                title: {
                    display: true,
                    text: yTitle,
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) },
                }
            }
        }
    };
}

/* ==========================================================
   INIT CHARTS
========================================================== */

function initCharts() {
    const barCtx = document.getElementById("barChart");
    const lineCtx = document.getElementById("lineChart");

    if (!barCtx || !lineCtx) return;

    barChart = new Chart(barCtx, buildBarChartConfig(barData));
    lineChart = new Chart(lineCtx, buildLineChartConfig(lineData));
}

/* ==========================================================
   THEME HANDLING
========================================================== */

function setupTheme() {
    const toggleBtn = document.getElementById("themeToggle");
    const saved = localStorage.getItem("dashboard-theme");

    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleBtn.textContent = "☀️ Light Mode";
    }

    toggleBtn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        document.documentElement.setAttribute("data-theme", isDark ? "" : "dark");
        toggleBtn.textContent = isDark ? "🌙 Dark Mode" : "☀️ Light Mode";

        localStorage.setItem("dashboard-theme", isDark ? "light" : "dark");

        refreshCharts();
    });
}

/* ==========================================================
   REFRESH CHART COLORS (No Destroy)
========================================================== */

function refreshCharts() {
    if (!barChart || !lineChart) return;

    barChart.options = getCommonChartOptions("Units Produced");
    lineChart.options = getCommonChartOptions("Efficiency %");

    barChart.update();
    lineChart.update();
}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    setupTheme();
});
