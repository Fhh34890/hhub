document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const fileInput = document.querySelector("#csvFile");
const dropZone = document.querySelector("#dropZone");
const fileResult = document.querySelector("#fileResult");
const validationMetrics = document.querySelector("#validationMetrics");
const selectedName = document.querySelector("#selectedName");
const selectedMeta = document.querySelector("#selectedMeta");
const recordCount = document.querySelector("#recordCount");
const fileSize = document.querySelector("#fileSize");
const removeFile = document.querySelector("#removeFile");
const startDemo = document.querySelector("#startDemo");
const modal = document.querySelector("#permissionModal");

function readableSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function clearFile() {
  fileInput.value = "";
  fileResult.hidden = true;
  validationMetrics.hidden = true;
  startDemo.disabled = true;
  dropZone.classList.remove("has-file", "has-error");
}

async function inspectFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) {
    clearFile();
    dropZone.classList.add("has-error");
    dropZone.querySelector("strong").textContent = "请选择 CSV 文件";
    return;
  }
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const count = Math.max(0, lines.length - 1);
  selectedName.textContent = file.name;
  selectedMeta.textContent = `${readableSize(file.size)} · 文件仅在浏览器中读取`;
  recordCount.textContent = count > 0 ? count : "待确认";
  fileSize.textContent = readableSize(file.size);
  fileResult.hidden = false;
  validationMetrics.hidden = false;
  startDemo.disabled = false;
  dropZone.classList.add("has-file");
  dropZone.classList.remove("has-error");
  dropZone.querySelector("strong").textContent = "文件已选择，可在下方继续体验";
}

fileInput?.addEventListener("change", () => inspectFile(fileInput.files[0]));
removeFile?.addEventListener("click", clearFile);

["dragenter", "dragover"].forEach((eventName) => dropZone?.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
}));
["dragleave", "drop"].forEach((eventName) => dropZone?.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
}));
dropZone?.addEventListener("drop", (event) => inspectFile(event.dataTransfer.files[0]));

document.querySelectorAll(".mode-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".mode-option").forEach((item) => item.classList.remove("selected"));
    option.classList.add("selected");
  });
});

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

startDemo?.addEventListener("click", () => {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
});
document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});
