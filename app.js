// ===============================
// CONFIG
// ===============================
const API = "https://subpreputial-hypersuggestible-leonie.ngrok-free.dev";

const btnRun = document.getElementById("btnRun");
const btnClear = document.getElementById("btnClear");
const output = document.getElementById("output");
const statusText = document.getElementById("statusText");

const selCompany = document.getElementById("company");
const selMode = document.getElementById("mode");
const inputAddress = document.getElementById("address");
const inputComuna = document.getElementById("comuna");
const inputRut = document.getElementById("rut");

// ===============================
// UTILS
// ===============================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function setStatus(text, color = "#9ca3af") {
  statusText.textContent = text;
  statusText.style.color = color;
}

function clearOutput() {
  output.innerHTML = "";
}

// ===============================
// LIMPIAR
// ===============================
btnClear.onclick = () => {
  clearOutput();
  setStatus("Listo", "#22c55e");
  inputAddress.value = "";
  inputComuna.value = "";
  if (inputRut) inputRut.value = "";
};

// ===============================
// EJECUTAR
// ===============================
btnRun.onclick = async () => {
  clearOutput();
  setStatus("Enviando solicitud…", "#eab308");

  const company = selCompany.value;
  const mode = selMode.value;
  const direccion = inputAddress.value.trim();
  const comuna = inputComuna.value.trim();
  const rut = inputRut ? inputRut.value.trim() : "";

  try {
    let startUrl = "";
    let pollUrl = "";

    // ==========================
    // FACTIBILIDAD
    // ==========================
    if (mode === "factibilidad") {
      if (!direccion || !comuna) {
        setStatus("Faltan datos", "#ef4444");
        return;
      }

      const res = await fetch(`${API}/factibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion, comuna, company })
      });

      if (!res.ok) throw new Error("Error iniciando factibilidad");
      const data = await res.json();

      startUrl = `${API}/factibilidad/${data.jobId}`;
      pollUrl = startUrl;
    }

    // ==========================
    // ESTADO RUT
    // ==========================
    if (mode === "estado") {
      if (!rut) {
        setStatus("Falta RUT", "#ef4444");
        return;
      }

      const res = await fetch(`${API}/estado-rut`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, company })
      });

      if (!res.ok) throw new Error("Error iniciando estado");
      const data = await res.json();

      pollUrl = `${API}/estado-rut/${data.jobId}`;
    }

    // ==========================
    // POLLING
    // ==========================
    while (true) {
      await sleep(2000);

      const poll = await fetch(pollUrl);
      if (!poll.ok) throw new Error("Error consultando estado");

      const result = await poll.json();

      if (result.status === "running" || result.status === "queued") {
        setStatus("Procesando…", "#eab308");
        continue;
      }

      if (result.status === "error") {
        setStatus("Error", "#ef4444");
        output.textContent = result.error || "Error desconocido";
        break;
      }

      if (result.status === "done") {
        setStatus("Finalizado", "#22c55e");

        // TEXTO
        if (result.resultado) {
          const pre = document.createElement("pre");
          pre.textContent = result.resultado;
          pre.style.whiteSpace = "pre-wrap";
          output.appendChild(pre);
        }

        // CAPTURA
        if (result.capturaUrl) {
          const img = document.createElement("img");
          img.src = API + result.capturaUrl + "?t=" + Date.now();
          img.style.width = "100%";
          img.style.borderRadius = "12px";
          img.style.marginTop = "12px";

          img.onclick = () => {
            const w = window.open();
            w.document.write(`<img src="${img.src}" style="width:100%">`);
          };

          output.appendChild(img);
        }

        break;
      }
    }

  } catch (err) {
    setStatus("Error", "#ef4444");
    output.textContent = err.message;
  }
};
