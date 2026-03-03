function generateTimeOptions(select) {
  const min = select.dataset.min;
  const max = select.dataset.max;
  const step = parseInt(select.dataset.step);

  if (!min || !max || !step) return;

  const [minH, minM] = min.split(":").map(Number);
  const [maxH, maxM] = max.split(":").map(Number);

  let current = new Date();
  current.setHours(minH, minM, 0);

  const end = new Date();
  end.setHours(maxH, maxM, 0);

  select.innerHTML = '<option value="">Alege ora...</option>';

  while (current <= end) {
    const hh = String(current.getHours()).padStart(2, "0");
    const mm = String(current.getMinutes()).padStart(2, "0");
    const time = hh + ":" + mm;

    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;

    select.appendChild(option);

    current.setMinutes(current.getMinutes() + step);
  }
}

function initTimeSelects() {
  document.querySelectorAll("select[data-min]").forEach(generateTimeOptions);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTimeSelects);
} else {
  initTimeSelects();
}
