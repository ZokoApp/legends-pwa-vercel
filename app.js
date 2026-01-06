const API = "https://subpreputial-hypersuggestible-leonie.ngrok-free.dev";

const btnRun = document.getElementById("btnRun");
const btnClear = document.getElementById("btnClear");
const output = document.getElementById("output");
const statusText = document.getElementById("statusText");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

btnClear.onclick = () => {
  output.textContent = "";
  statusText.textContent = "Listo";
};

btnRun.onclick = async () => {
  output.textContent = "";
  statusText.textContent = "Enviando…";

  const direccion = address.value;
  const comuna = document.getElementById("comuna").value;
  const company = document.getElementById("company").value;

  try {
    const res = await fetch(`${API}/factibilidad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direccion, comuna, company })
    });

    const data = await res.json();
    let jobId = data.jobId;

    while (true) {
      await sleep(2000);
      const poll = await fetch(`${API}/factibilidad/${jobId}`);
      const result = await poll.json();

      if (result.status === "running") {
        statusText.textContent = "Procesando…";
        continue;
      }

      if (result.status === "done") {
        statusText.textContent = "Finalizado";
        output.textContent = result.resultado || "OK";

        if (result.capturaUrl) {
          const img = document.createElement("img");
          img.src = API + result.capturaUrl;
          img.style.width = "100%";
          output.appendChild(img);
        }
        break;
      }

      if (result.status === "error") {
        statusText.textContent = "Error";
        output.textContent = result.error;
        break;
      }
    }
  } catch (e) {
    statusText.textContent = "Error";
    output.textContent = e.message;
  }
};

