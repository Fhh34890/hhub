const MAX_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 500;
const TEXT_COLUMNS = ["text", "review", "comment", "content", "feedback", "评论内容", "评价内容", "评论正文"];
const ID_COLUMNS = ["comment_id", "id", "review_id", "评论id", "评论编号"];

const byId = (id) => document.getElementById(id);
const dropZone = byId("dropZone");
const fileInput = byId("fileInput");
const browseButton = byId("browseButton");
const removeFile = byId("removeFile");
const fileSummary = byId("fileSummary");
const fileName = byId("fileName");
const fileSize = byId("fileSize");
const fileStatus = byId("fileStatus");
const message = byId("message");
const validationResult = byId("validationResult");
const analysisSetup = byId("analysisSetup");
const progressPanel = byId("progressPanel");

function readableSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function showMessage(text, kind = "error") {
  message.textContent = text;
  message.className = `message ${kind}`;
}

function clearMessage() {
  message.textContent = "";
  message.className = "message is-hidden";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function findColumn(headers, candidates) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  return normalized.findIndex((header) => candidates.includes(header));
}

function resetFile() {
  fileInput.value = "";
  fileSummary.classList.add("is-hidden");
  validationResult.classList.add("is-hidden");
  analysisSetup.classList.add("is-hidden");
  progressPanel.classList.add("is-hidden");
  dropZone.classList.remove("is-dragging");
  clearMessage();
}

async function inspectFile(file) {
  resetFile();
  if (!file) return;
  fileSummary.classList.remove("is-hidden");
  fileName.textContent = file.name;
  fileSize.textContent = readableSize(file.size);
  fileStatus.textContent = "正在本地校验";

  if (!file.name.toLowerCase().endsWith(".csv")) {
    fileStatus.textContent = "格式错误";
    showMessage("请选择 CSV 文件。");
    return;
  }
  if (file.size > MAX_BYTES) {
    fileStatus.textContent = "文件过大";
    showMessage("文件不能超过 5 MB。");
    return;
  }

  const text = await file.text();
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) {
    fileStatus.textContent = "没有有效记录";
    showMessage("CSV 至少需要表头和一条评论。");
    return;
  }

  const headers = rows[0].map((header) => header.trim());
  const textIndex = findColumn(headers, TEXT_COLUMNS);
  const idIndex = findColumn(headers, ID_COLUMNS);
  if (textIndex < 0) {
    fileStatus.textContent = "缺少正文列";
    showMessage("未找到评论正文列。推荐使用 text，也支持 review、comment、content、feedback、评论内容等字段名。");
    return;
  }

  const records = rows.slice(1).filter((row) => String(row[textIndex] || "").trim());
  const visibleRecords = records.slice(0, MAX_RECORDS);
  byId("inputRecords").textContent = records.length;
  byId("validRecords").textContent = visibleRecords.length;
  byId("textColumn").textContent = headers[textIndex];
  byId("fileEncoding").textContent = "浏览器读取";

  const previewBody = byId("previewBody");
  previewBody.innerHTML = "";
  visibleRecords.slice(0, 10).forEach((row, index) => {
    const item = document.createElement("tr");
    const idCell = document.createElement("td");
    const textCell = document.createElement("td");
    idCell.textContent = idIndex >= 0 && row[idIndex] ? row[idIndex] : `AUTO-${String(index + 1).padStart(3, "0")}`;
    textCell.textContent = row[textIndex];
    item.append(idCell, textCell);
    previewBody.appendChild(item);
  });

  const warnings = byId("warnings");
  if (records.length > MAX_RECORDS) {
    warnings.textContent = `公开作品版最多预览前 ${MAX_RECORDS} 条，本文件共有 ${records.length} 条。`;
    warnings.classList.remove("is-hidden");
  } else {
    warnings.classList.add("is-hidden");
  }

  fileStatus.textContent = "校验通过";
  validationResult.classList.remove("is-hidden");
  analysisSetup.classList.remove("is-hidden");
  analysisSetup.scrollIntoView({ behavior: "smooth", block: "center" });
}

browseButton.addEventListener("click", (event) => {
  event.stopPropagation();
  fileInput.click();
});
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") fileInput.click();
});
fileInput.addEventListener("change", () => inspectFile(fileInput.files[0]));
removeFile.addEventListener("click", resetFile);

["dragenter", "dragover"].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
}));
["dragleave", "drop"].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
}));
dropZone.addEventListener("drop", (event) => inspectFile(event.dataTransfer.files[0]));

document.querySelectorAll(".mode-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".mode-card").forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
  });
});

byId("startAnalysis").addEventListener("click", () => {
  progressPanel.classList.remove("is-hidden");
  byId("progressPercent").textContent = "0%";
  byId("progressBar").style.width = "0%";
  byId("stageLabel").textContent = "当前访问无分析权限";
  const error = byId("progressError");
  error.innerHTML = '这是公开作品链接，未开放模型 API 调用权限。你选择的文件没有上传或保存。可以查看下方的真实分析样本，了解完整输出。 <a href="demo/dashboard.html" target="_blank" rel="noopener">打开示例 Dashboard →</a>';
  error.classList.remove("is-hidden");
  progressPanel.scrollIntoView({ behavior: "smooth", block: "center" });
});
