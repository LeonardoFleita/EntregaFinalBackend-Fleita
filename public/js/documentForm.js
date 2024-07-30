function toggleNameField() {
  const typeSelect = document.getElementById("type");
  const nameField = document.getElementById("name");
  const nameContainer = document.getElementById("nameContainer");

  if (typeSelect.value === "other" || typeSelect.value === "product") {
    nameContainer.style.display = "block";
  } else {
    nameContainer.style.display = "none";
    nameField.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleNameField();
});
